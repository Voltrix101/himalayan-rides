import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  BookOpen, 
  Users, 
  Car, 
  TrendingUp, 
  LogOut, 
  Menu, 
  X,
  Shield,
  Video,
  MapPin,
  Compass,
  Star
} from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useAuth } from '../../hooks/useAuth';
import { GlassCard } from '../ui/GlassCard';
import '../../styles/adminButton.css'; // Ensure the CSS is imported

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'bookings', label: 'Bookings', icon: BookOpen },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'vehicles', label: 'Vehicles', icon: Car },
  { id: 'destinations', label: 'Must-Visit Destinations', icon: Compass },
  { id: 'experiences', label: 'Curated Experiences', icon: Star },
  { id: 'bikeTours', label: 'Bike Tour Plans', icon: MapPin },
  { id: 'revenue', label: 'Revenue', icon: TrendingUp },
];

export function AdminLayout({ children, currentPage, onPageChange }: AdminLayoutProps) {
  const { adminUser } = useAdminAuth();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20 transition-colors"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 1024) && (
          <>
            {/* Mobile Overlay */}
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-black/50 z-40"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar Content */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed left-0 top-0 h-full w-72 z-40 lg:z-30"
            >
              <GlassCard className="h-full rounded-none lg:rounded-r-2xl">
                <div className="p-6 h-full flex flex-col">
                  {/* Home Button */}
                  <button
                    className="admin-btn mb-6"
                    onClick={() => window.location.href = '/'}
                  >
                    🏠 Home
                  </button>
                  {/* Header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                        <p className="text-white/60 text-sm">Himalayan Rides</p>
                      </div>
                    </div>
                    
                    {/* Admin Info */}
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-white/80 text-sm">Signed in as:</p>
                      <p className="text-white font-medium text-sm truncate">
                        {adminUser?.email}
                      </p>
                    </div>
                  </div>

                  {/* Navigation */}
                  <nav className="flex-1">
                    <ul className="space-y-2">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.id;
                        
                        return (
                          <li key={item.id}>
                            <button
                              onClick={() => {
                                onPageChange(item.id);
                                setSidebarOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                isActive
                                  ? 'bg-white/20 text-white shadow-lg'
                                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                              <span className="font-medium">{item.label}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200 mt-6"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </GlassCard>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen">
        <div className="p-4 lg:p-8">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
