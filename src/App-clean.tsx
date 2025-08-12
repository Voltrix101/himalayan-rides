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
import { Vehicle } from './types';
import { Toaster } from 'react-hot-toast';

// Lazy load admin dashboard for better performance
const StreamlinedAdminDashboard = lazy(() => import('./components/admin/StreamlinedAdminDashboard'));

function AppContent() {
  const { state } = useApp();
  const { user, requireAuth, isLoading, login } = useAuth();
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
    setModalState({ isOpen: true, type, data });
  }, []);

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

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
    
    // Cleanup Firebase listeners on unmount
    return () => {
      optimizedFirestore.cleanup();
    };
  }, [user, currentView]);

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
        
        {/* Navigation */}
        {user && (
          <div className="fixed top-20 right-6 z-40 flex gap-2">
            <button
              onClick={() => setCurrentView('explore')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                currentView === 'explore' 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/10 text-white/70 hover:bg-white/15'
              }`}
            >
              Explore
            </button>
            <button
              onClick={() => setCurrentView('fleet')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                currentView === 'fleet' 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/10 text-white/70 hover:bg-white/15'
              }`}
            >
              Fleet
            </button>
            <button
              onClick={() => setCurrentView('trips')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                currentView === 'trips' 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/10 text-white/70 hover:bg-white/15'
              }`}
            >
              Your Trips
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                currentView === 'dashboard' 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/10 text-white/70 hover:bg-white/15'
              }`}
            >
              Dashboard
            </button>
            {isCurrentUserAdmin(user) && (
              <button
                onClick={() => setCurrentView('admin')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  currentView === 'admin' 
                    ? 'bg-purple-600/50 text-white' 
                    : 'bg-purple-500/20 text-purple-200 hover:bg-purple-500/30'
                }`}
              >
                Admin
              </button>
            )}
          </div>
        )}

        {/* Main Content */}
        {currentView === 'home' && <RegionSelector />}
        {currentView === 'explore' && <OptimizedExploreLadakh />}
        {currentView === 'fleet' && <FleetView onVehicleSelect={handleVehicleSelect} />}
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'trips' && <YourTrips />}
        {currentView === 'admin' && (
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
                <p className="text-lg">Loading Admin Panel...</p>
              </div>
            </div>
          }>
            <StreamlinedAdminDashboard />
          </Suspense>
        )}

        {/* Universal Modal System */}
        <UniversalModal
          type={state.showAuthModal ? 'auth' : modalState.type}
          isOpen={modalState.isOpen || state.showAuthModal}
          onClose={state.showAuthModal ? () => {} : closeModal}
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
      </div>
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {/* Performance Monitor for Admin Users Only */}
      {process.env.NODE_ENV === 'development' && isCurrentUserAdmin(user) && <PerformanceDisplay />}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
