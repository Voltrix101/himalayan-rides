import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { AuthModal } from './components/auth/AuthModal';
import { RegionSelector } from './components/home/RegionSelector';
import { FleetView } from './components/fleet/FleetView';
import { BookingModal } from './components/booking/BookingModal';
import { Dashboard } from './components/dashboard/Dashboard';
import { ExploreLadakh } from './components/explore/ExploreLadakh';
import { YourTrips } from './components/trips/YourTrips';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { useAuth } from './hooks/useAuth';
import { Vehicle } from './types';
import { Toaster } from 'react-hot-toast';

function AppContent() {
  const { state } = useApp();
  const { user, requireAuth, isLoading, login } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'fleet' | 'dashboard' | 'explore' | 'trips'>('home');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const backgroundImage = state.selectedRegion.image;

  // Check if we're on the admin route
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  // If admin route, render admin dashboard
  if (isAdminRoute) {
    return <AdminDashboard />;
  }

  useEffect(() => {
    if (user && currentView === 'home') {
      setCurrentView('fleet');
    }
  }, [user, currentView]);

  useEffect(() => {
    const handleNavigateToExplore = () => {
      setCurrentView('explore');
    };

    const handleNavigateToTrips = () => {
      setCurrentView('trips');
    };

    window.addEventListener('navigateToExplore', handleNavigateToExplore);
    window.addEventListener('navigateToTrips', handleNavigateToTrips);
    
    return () => {
      window.removeEventListener('navigateToExplore', handleNavigateToExplore);
      window.removeEventListener('navigateToTrips', handleNavigateToTrips);
    };
  }, []);

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

  const handleVehicleSelect = (vehicle: Vehicle) => {
    requireAuth(() => {
      setSelectedVehicle(vehicle);
      setShowBookingModal(true);
    });
  };

  const handleAuthSuccess = () => {
    if (currentView === 'home') {
      setCurrentView('fleet');
    }
  };

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
          </div>
        )}

        {/* Main Content */}
        {currentView === 'home' && <RegionSelector />}
        {currentView === 'explore' && <ExploreLadakh />}
        {currentView === 'fleet' && <FleetView onVehicleSelect={handleVehicleSelect} />}
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'trips' && <YourTrips />}

        {/* Global Auth Modal */}
        <AuthModal 
          isOpen={state.showAuthModal} 
          onClose={() => {}} // Handled by hideAuthModal in useAuth
          onAuthSuccess={handleAuthSuccess}
        />
        
        <BookingModal
          vehicle={selectedVehicle}
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedVehicle(null);
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