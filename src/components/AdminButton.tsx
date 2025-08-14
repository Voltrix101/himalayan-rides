import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, TrendingUp, Database, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { isCurrentUserAdmin } from '../utils/adminUtils';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

export const AdminButton: React.FC = () => {
  const [showMetrics, setShowMetrics] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { metrics } = usePerformanceMonitor();

  // Only show to admin users
  const isAdmin = user && isCurrentUserAdmin(user);
  if (!isAdmin) return null;

  const handleAdminPanelClick = () => {
    navigate('/admin');
    setShowMetrics(false);
  };

  const toggleMetrics = () => {
    setShowMetrics(!showMetrics);
  };

  const performanceData = [
    {
      label: 'Load Time',
      value: `${Math.round(metrics.loadTime || 0)}ms`,
      icon: <TrendingUp className="w-4 h-4" />,
      status: (metrics.loadTime || 0) < 1000 ? 'good' : 'warning'
    },
    {
      label: 'Render Time', 
      value: `${Math.round(metrics.renderTime || 0)}ms`,
      icon: <Database className="w-4 h-4" />,
      status: (metrics.renderTime || 0) < 100 ? 'good' : 'warning'
    },
    {
      label: 'Memory Usage',
      value: `${Math.round(metrics.memoryUsage || 0)}MB`,
      icon: <Database className="w-4 h-4" />,
      status: (metrics.memoryUsage || 0) < 50 ? 'good' : 'warning'
    },
    {
      label: 'Cache Hit Rate',
      value: `${Math.round((metrics.cacheHitRate || 0) * 100)}%`,
      icon: <TrendingUp className="w-4 h-4" />,
      status: (metrics.cacheHitRate || 0) > 0.8 ? 'good' : 'warning'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <>
      {/* Admin Button */}
      <motion.div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-3"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Performance Metrics Toggle */}
        <motion.button
          onClick={toggleMetrics}
          className="p-3 bg-purple-600/20 backdrop-blur-sm border border-purple-500/30 rounded-lg hover:bg-purple-600/30 transition-colors shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Performance Metrics"
        >
          <TrendingUp className="w-5 h-5 text-purple-400" />
        </motion.button>

        {/* Admin Panel Button */}
        <motion.button
          onClick={handleAdminPanelClick}
          className="p-3 bg-emerald-600/20 backdrop-blur-sm border border-emerald-500/30 rounded-lg hover:bg-emerald-600/30 transition-colors shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Admin Panel"
        >
          <Shield className="w-5 h-5 text-emerald-400" />
        </motion.button>
      </motion.div>

      {/* Performance Metrics Popup */}
      <AnimatePresence>
        {showMetrics && (
          <motion.div
            initial={{ opacity: 0, x: 20, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 20, y: 20 }}
            className="fixed bottom-24 right-4 z-40 w-80 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-medium">Performance Metrics</h3>
              </div>
              <button
                onClick={() => setShowMetrics(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics */}
            <div className="p-4 space-y-3">
              {performanceData.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className={getStatusColor(metric.status)}>
                      {metric.icon}
                    </span>
                    <span className="text-sm text-gray-300">{metric.label}</span>
                  </div>
                  <span className={`text-sm font-bold ${getStatusColor(metric.status)}`}>
                    {metric.value}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Admin Panel Quick Access */}
            <div className="p-4 border-t border-gray-700 bg-gray-800/30">
              <motion.button
                onClick={handleAdminPanelClick}
                className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 font-medium">Open Admin Panel</span>
              </motion.button>
            </div>

            {/* User Info */}
            <div className="px-4 pb-4">
              <div className="text-xs text-gray-400 text-center">
                Admin: {user?.email}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
