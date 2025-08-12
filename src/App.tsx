import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { UniversalModal, ModalType } from './components/ui/UniversalModal';
import { PerformanceDisplay } from './hooks/usePerformanceMonitor';
import { optimizedFirestore } from './utils/firebaseOptimizer';
import { useAuth } from './hooks/useAuth';
import { isCurrentUserAdmin } from './utils/adminUtils';
import { AdminStatusIndicator } from './components/AdminStatusIndicator';
import { Toaster } from 'react-hot-toast';
import { useState, useCallback, useEffect } from 'react';

// Lazy load components for better performance
const RegionSelector = lazy(() => import('./components/home/RegionSelector').then(m => ({ default: m.RegionSelector })));
const FleetView = lazy(() => import('./components/fleet/FleetView').then(m => ({ default: m.FleetView })));
const Dashboard = lazy(() => import('./components/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const OptimizedExploreLadakh = lazy(() => import('./components/explore/OptimizedExploreLadakh'));
const YourTrips = lazy(() => import('./components/trips/YourTrips').then(m => ({ default: m.YourTrips })));
const EnhancedAdminDashboard = lazy(() => import('./components/admin/EnhancedAdminDashboard'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
  </div>
);

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// Admin protected route wrapper
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!user || !isCurrentUserAdmin(user)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

function AppContent() {
  const { user, showAuthModal, hideAuthModal, isLoading } = useAuth();
  const { state } = useApp();
  
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

  // Universal Modal handlers
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

  // Get background image from selected region
  const backgroundImage = state.selectedRegion.image;

  // Handle auth modal from useAuth
  useEffect(() => {
    console.log('🎭 Auth modal state changed:', showAuthModal);
    if (showAuthModal) {
      console.log('📱 Opening auth modal...');
      openModal('auth');
    }
  }, [showAuthModal, openModal]);

  useEffect(() => {
    const handleOpenTourModal = () => {
      openModal('tour');
    };

    window.addEventListener('openTourModal', handleOpenTourModal);
    
    return () => {
      window.removeEventListener('openTourModal', handleOpenTourModal);
      optimizedFirestore.cleanup();
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
        <Header onAuthClick={() => openModal('auth')} />
        
        <main className="pt-16">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<RegionSelector />} />
              <Route path="/explore" element={<OptimizedExploreLadakh />} />
              
              {/* Protected Routes */}
              <Route 
                path="/fleet" 
                element={
                  <ProtectedRoute>
                    <FleetView onVehicleSelect={(vehicle) => openModal('booking', { vehicle })} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/trips" 
                element={
                  <ProtectedRoute>
                    <YourTrips />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <EnhancedAdminDashboard />
                  </AdminRoute>
                } 
              />
              
              {/* Catch all route - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>

      {/* Universal Modal */}
      <UniversalModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        data={modalState.data}
      />

      {/* Admin Performance Monitor */}
      {user && isCurrentUserAdmin(user) && (
        <div className="fixed bottom-4 right-4 z-40">
          <PerformanceDisplay />
        </div>
      )}

      {/* Admin Status Indicator */}
      <AdminStatusIndicator />
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
        }}
      />
    </div>
  );
}

export default App;
