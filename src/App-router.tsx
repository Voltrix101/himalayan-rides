import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
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
const StreamlinedAdminDashboard = lazy(() => import('./components/admin/StreamlinedAdminDashboard'));
const SupportPage = lazy(() => import('./components/support/SupportPage').then(m => ({ default: m.SupportPage })));

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
  const { user, showAuthModal, hideAuthModal } = useAuth();
  
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

  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<RegionSelector />} />
            <Route path="/explore" element={<OptimizedExploreLadakh />} />
            <Route path="/support" element={<SupportPage />} />
            
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
                  <StreamlinedAdminDashboard />
                </AdminRoute>
              } 
            />
            
            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

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
