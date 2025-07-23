import { motion } from 'framer-motion';
import { Mountain, User, Menu, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';

interface HeaderProps {
  onAuthClick: () => void;
}

interface HeaderProps {
  onAuthClick: () => void;
  onNavigate?: (view: 'home' | 'fleet' | 'dashboard' | 'explore' | 'trips') => void;
}

export function Header({ onAuthClick, onNavigate }: HeaderProps) {
  const { state, dispatch } = useApp();

  const handleLogout = () => {
    dispatch({ type: 'SET_USER', payload: null });
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20"
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mountain className="w-8 h-8 text-white" />
          <span className="text-2xl font-bold text-white">Himalayan Rides</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => onNavigate?.('explore')} 
            className="text-white/80 hover:text-white transition-colors"
          >
            Explore
          </button>
          <button 
            onClick={() => onNavigate?.('fleet')} 
            className="text-white/80 hover:text-white transition-colors"
          >
            Fleet
          </button>
          {state.user && (
            <button 
              onClick={() => onNavigate?.('trips')} 
              className="text-white/80 hover:text-white transition-colors"
            >
              Your Trips
            </button>
          )}
          <a href="#regions" className="text-white/80 hover:text-white transition-colors">Regions</a>
          <a href="#support" className="text-white/80 hover:text-white transition-colors">Support</a>
        </nav>

        <div className="flex items-center gap-4">
          {state.user ? (
            <div className="flex items-center gap-4">
              <span className="text-white hidden md:block">Hi, {state.user.name}</span>
              <Button variant="glass" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                <span className="hidden md:block">Logout</span>
              </Button>
            </div>
          ) : (
            <Button variant="glass" onClick={onAuthClick}>
              <User className="w-4 h-4" />
              Login
            </Button>
          )}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
}