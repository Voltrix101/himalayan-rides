import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, Clock, Users, Database, TrendingUp } from 'lucide-react';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';

interface PerformanceMetric {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  status: 'good' | 'warning' | 'error';
}

export const PerformanceMonitor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { metrics } = usePerformanceMonitor();

  const toggleVisibility = () => setIsVisible(!isVisible);

  if (!isVisible) {
    return (
      <motion.button
        onClick={toggleVisibility}
        className="fixed bottom-4 left-4 z-50 p-3 bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg hover:bg-gray-800/80 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Activity className="w-5 h-5 text-green-400" />
      </motion.button>
    );
  }

  const performanceMetrics: PerformanceMetric[] = [
    {
      label: 'Load Time',
      value: `${Math.round(metrics.loadTime || 0)}ms`,
      icon: <Clock className="w-4 h-4" />,
      status: (metrics.loadTime || 0) < 1000 ? 'good' : (metrics.loadTime || 0) < 3000 ? 'warning' : 'error'
    },
    {
      label: 'Render Time',
      value: `${Math.round(metrics.renderTime || 0)}ms`,
      icon: <Zap className="w-4 h-4" />,
      status: (metrics.renderTime || 0) < 100 ? 'good' : (metrics.renderTime || 0) < 300 ? 'warning' : 'error'
    },
    {
      label: 'Memory',
      value: `${Math.round(metrics.memoryUsage || 0)}MB`,
      icon: <Database className="w-4 h-4" />,
      status: (metrics.memoryUsage || 0) < 50 ? 'good' : (metrics.memoryUsage || 0) < 100 ? 'warning' : 'error'
    },
    {
      label: 'Cache Hit Rate',
      value: `${Math.round((metrics.cacheHitRate || 0) * 100)}%`,
      icon: <Users className="w-4 h-4" />,
      status: (metrics.cacheHitRate || 0) > 0.8 ? 'good' : (metrics.cacheHitRate || 0) > 0.6 ? 'warning' : 'error'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-400 border-green-500/30 bg-green-500/10';
      case 'warning': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      case 'error': return 'text-red-400 border-red-500/30 bg-red-500/10';
      default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-4 z-50 w-80 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-medium">Performance Monitor</h3>
        </div>
        <button
          onClick={toggleVisibility}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="p-4 space-y-3">
        {performanceMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              flex items-center justify-between p-3 rounded-lg border
              ${getStatusColor(metric.status)}
            `}
          >
            <div className="flex items-center gap-2">
              {metric.icon}
              <span className="text-sm font-medium">{metric.label}</span>
            </div>
            <span className="text-sm font-bold">{metric.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Overall Status */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-300">System Running Optimally</span>
        </div>
      </div>
    </motion.div>
  );
};
