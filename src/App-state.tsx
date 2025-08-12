import { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { RegionSelector } from './components/home/RegionSelector';
import { FleetView } from './components/fleet/FleetView';
import { Dashboard } from './components/dashboard/Dashboard';
import OptimizedExploreLadakh from './components/explore/OptimizedExploreLadakh';
import { YourTrips } from './components/trips/YourTrips';
import { UniversalModal, ModalType } from './components/ui/UniversalModal';
import { PerformanceDisplay } from './hooks/usePerformanceMonitor';
import { optimizedFirestore } from './utils/firebaseOptimizer';
import { useAuth } from './hooks/useAuth';
import { isCurrentUserAdmin } from './utils/adminUtils';
import { AdminStatusIndicator } from './components/AdminStatusIndicator';
import { Vehicle } from './types';
import { Toaster } from 'react-hot-toast';

// Lazy load admin dashboard for better performance
const StreamlinedAdminDashboard = lazy(() => import('./components/admin/StreamlinedAdminDashboard'));

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

function AppContent() {
  const { state } = useApp();
  const { user, requireAuth, isLoading, login, showAuthModal, hideAuthModal } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'fleet' | 'dashboard' | 'explore' | 'trips' | 'admin'>('home');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  // Universal Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: ModalType;
    data: any;
  }>({
    isOpen: false,
    type: 'auth',
    data: {}
  });

  // Universal Modal handlers - moved before early returns to maintain hook order
  const openModal = useCallback((type: ModalType, data: any = {}) => {
    console.log('🚪 Opening modal:', type, data);
    setModalState({ isOpen: true, type, data });
  }, []);

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
    // Also hide auth modal in useAuth state if it was an auth modal
    if (modalState.type === 'auth') {
      hideAuthModal();
    }
  }, [hideAuthModal, modalState.type]);

  const handleVehicleSelect = useCallback((vehicle: Vehicle) => {
    requireAuth(() => {
      setSelectedVehicle(vehicle);
      openModal('booking', { vehicle });
    });
  }, [requireAuth, openModal]);

  const handleAuthSuccess = useCallback(() => {
    if (currentView === 'home') {
      setCurrentView('fleet');
    }
  }, [currentView]);

  const backgroundImage = state.selectedRegion.image;

  useEffect(() => {
    if (user && currentView === 'home') {
      setCurrentView('fleet');
    }
    
    // Redirect to home when user logs out (user becomes null)
    if (!user && currentView !== 'home') {
      setCurrentView('home');
    }
    
    // Cleanup Firebase listeners on unmount
    return () => {
      optimizedFirestore.cleanup();
    };
  }, [user, currentView]);

  // Handle auth modal from useAuth
  useEffect(() => {
    console.log('🎭 Auth modal state changed:', showAuthModal);
    if (showAuthModal) {
      console.log('📱 Opening auth modal...');
      openModal('auth');
    }
  }, [showAuthModal, openModal]);

  useEffect(() => {
    const handleNavigateToExplore = () => {
      setCurrentView('explore');
    };

    const handleNavigateToTrips = () => {
      setCurrentView('trips');
    };

    const handleOpenTourModal = () => {
      openModal('tour');
    };

    window.addEventListener('navigateToExplore', handleNavigateToExplore);
    window.addEventListener('navigateToTrips', handleNavigateToTrips);
    window.addEventListener('openTourModal', handleOpenTourModal);
    
    return () => {
      window.removeEventListener('navigateToExplore', handleNavigateToExplore);
      window.removeEventListener('navigateToTrips', handleNavigateToTrips);
      window.removeEventListener('openTourModal', handleOpenTourModal);
    };
  }, [openModal]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading Himalayan Rides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Dynamic Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          filter: 'brightness(0.4)'
        }}
      />
      
      {/* Gradient Overlay */}
      <div className={`fixed inset-0 bg-gradient-to-br ${state.selectedRegion.gradient} opacity-60`} />
      
      {/* Content */}
      <div className="relative z-10">
        <Header 
          onAuthClick={login} 
          onNavigate={setCurrentView}
        />
        
        <main className="pt-16">
          {/* Render current view */}
          {currentView === 'home' && <RegionSelector />}
          {currentView === 'explore' && <OptimizedExploreLadakh />}
          {currentView === 'fleet' && <FleetView onVehicleSelect={handleVehicleSelect} />}
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'trips' && <YourTrips />}
          {currentView === 'admin' && (
            <Suspense fallback={<AdminLoadingFallback />}>
              <StreamlinedAdminDashboard />
            </Suspense>
          )}
        </main>
      </div>

      {/* Universal Modal */}
      <UniversalModal
        type={modalState.type}
        isOpen={modalState.isOpen}
        onClose={closeModal}
        data={{
          ...modalState.data,
          onAuthSuccess: handleAuthSuccess,
          onClose: closeModal,
          onBookingComplete: (bookingData: any) => {
            console.log('Booking completed:', bookingData);
            closeModal();
            setSelectedVehicle(null);
          }
        }}
      />
      
      {/* Performance Monitor for Admin Users Only */}
      {process.env.NODE_ENV === 'development' && isCurrentUserAdmin(user) && <PerformanceDisplay />}
      
      {/* Admin Status Indicator for Development */}
      {process.env.NODE_ENV === 'development' && <AdminStatusIndicator />}
      
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(30, 41, 59, 0.95)',
            color: '#fff',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            backdropFilter: 'blur(8px)',
          },
        }}
      />
    </div>
  );
};

// Loading fallback for admin dashboard
const AdminLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-white text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3"></div>
      <p>Loading Admin Dashboard...</p>
    </div>
  </div>
);

export default App;