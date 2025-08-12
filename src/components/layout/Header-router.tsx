import { motion } from 'framer-motion';
import { Mountain, User, Menu, LogOut, Shield } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { isCurrentUserAdmin } from '../../utils/adminUtils';

interface HeaderProps {
  onAuthClick?: () => void;
}

export function Header({ onAuthClick }: HeaderProps) {
  const { state } = useApp();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const handleAuthClick = () => {
    if (onAuthClick) {
      onAuthClick();
    }
  };

  // Helper function to determine if a nav item is active
  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20"
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <Mountain className="w-8 h-8 text-white" />
          <span className="text-2xl font-bold text-white">Himalayan Rides</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link 
            to="/" 
            className={`text-white/80 hover:text-white transition-colors ${
              isActive('/') ? 'text-white border-b-2 border-white pb-1' : ''
            }`}
          >
            Home
          </Link>
          <Link 
            to="/explore" 
            className={`text-white/80 hover:text-white transition-colors ${
              isActive('/explore') ? 'text-white border-b-2 border-white pb-1' : ''
            }`}
          >
            Explore
          </Link>
          <Link 
            to="/fleet" 
            className={`text-white/80 hover:text-white transition-colors ${
              isActive('/fleet') ? 'text-white border-b-2 border-white pb-1' : ''
            }`}
          >
            Fleet
          </Link>
          {state.user && (
            <Link 
              to="/trips" 
              className={`text-white/80 hover:text-white transition-colors ${
                isActive('/trips') ? 'text-white border-b-2 border-white pb-1' : ''
              }`}
            >
              Your Trips
            </Link>
          )}
          {state.user && isCurrentUserAdmin(state.user) && (
            <Link 
              to="/admin" 
              className={`bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                isActive('/admin') ? 'bg-purple-600/40' : ''
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {state.user ? (
            <div className="flex items-center gap-4">
              <span className="text-white/80 hidden md:block">
                Hi, {state.user.name || state.user.email}
              </span>
              <Button variant="glass" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                <span className="hidden md:block">Logout</span>
              </Button>
            </div>
          ) : (
            <Button variant="glass" size="sm" onClick={handleAuthClick}>
              <User className="w-4 h-4" />
              <span className="hidden md:block">Login</span>
            </Button>
          )}

          {/* Mobile menu button */}
          <button className="md:hidden text-white">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
