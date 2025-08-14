import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { AuthModal } from './components/auth/AuthModal';
import { UniversalModal, ModalType } from './components/ui/UniversalModal';
import { PerformanceDisplay } from './hooks/usePerformanceMonitor';
import { optimizedFirestore } from './utils/firebaseOptimizer';
import { useAuth } from './hooks/useAuth';
import { isCurrentUserAdmin } from './utils/adminUtils';
import { AdminStatusIndicator } from './components/AdminStatusIndicator';
import { AdminButton } from './components/AdminButton';
import { Toaster } from 'react-hot-toast';
import { useState, useCallback, useEffect } from 'react';
// import './utils/testFirebaseConnection'; // Auto-run production Firebase test

// Lazy load components for better performance
const RegionSelector = lazy(() => import('./components/home/RegionSelector').then(m => ({ default: m.RegionSelector })));
const FleetView = lazy(() => import('./components/fleet/FleetView').then(m => ({ default: m.FleetView })));
const Dashboard = lazy(() => import('./components/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const OptimizedExploreLadakh = lazy(() => import('./components/explore/OptimizedExploreLadakh'));
const YourTrips = lazy(() => import('./components/trips/YourTrips').then(m => ({ default: m.YourTrips })));
const EnhancedAdminDashboard = lazy(() => import('./components/admin/EnhancedAdminDashboard'));
const FirebaseTestPage = lazy(() => import('./pages/FirebaseTestPage').then(m => ({ default: m.default })));

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
  const { user, showAuthModal, hideAuthModal, login, isLoading } = useAuth();
  const { state } = useApp();
  
  // Non-auth modal state (for booking, tour, etc.)
  const [nonAuthModalState, setNonAuthModalState] = useState<{
    isOpen: boolean;
    type: Exclude<ModalType, 'auth'>;
    data: Record<string, unknown>;
  }>({
    isOpen: false,
    type: 'booking',
    data: {}
  });

  // Non-auth modal handlers
  const openModal = useCallback((type: ModalType, data: Record<string, unknown> = {}) => {
    console.log('🚪 Opening modal:', type, data);
    if (type === 'auth') {
      // For auth modals, use the useAuth state
      // This should be handled by calling login() from useAuth instead
      console.warn('Use login() from useAuth instead of openModal("auth")');
      return;
    }
    setNonAuthModalState({ isOpen: true, type: type as Exclude<ModalType, 'auth'>, data });
  }, []);

  const closeNonAuthModal = useCallback(() => {
    setNonAuthModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Get background image from selected region
  const backgroundImage = state.selectedRegion.image;

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
        <Header onAuthClick={login} />
        
        <main className="pt-16">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<RegionSelector />} />
              <Route path="/explore" element={<OptimizedExploreLadakh />} />
              <Route path="/test" element={<FirebaseTestPage />} />
              
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

      {/* Auth Modal - using dedicated AuthModal component with Google sign-in */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={hideAuthModal}
        onAuthSuccess={hideAuthModal}
      />

      {/* Non-Auth Modals - controlled by local state */}
      <UniversalModal
        isOpen={nonAuthModalState.isOpen}
        onClose={closeNonAuthModal}
        type={nonAuthModalState.type}
        data={nonAuthModalState.data}
      />

      {/* Admin Performance Monitor */}
      {user && isCurrentUserAdmin(user) && (
        <div className="fixed bottom-4 right-4 z-40">
          <PerformanceDisplay />
        </div>
      )}

      {/* Admin Status Indicator */}
      <AdminStatusIndicator />

      {/* Admin Button */}
      <AdminButton />
      
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
