import { memo, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { OptimizedGlass } from '../ui/OptimizedGlass';
import { Button } from '../ui/Button';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'poor';
  target: number;
}

interface PerformanceData {
  fps: number;
  memoryUsage: number;
  loadTime: number;
  lcp: number;
  fid: number;
  cls: number;
  renderTime: number;
  bundleSize: number;
}

const PerformanceDashboard = memo(() => {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    fps: 60,
    memoryUsage: 0,
    loadTime: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    renderTime: 0,
    bundleSize: 0
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [history, setHistory] = useState<PerformanceData[]>([]);

  // Real-time performance monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        setPerformanceData(prev => ({
          ...prev,
          fps,
          memoryUsage: (performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0,
          renderTime: currentTime - lastTime
        }));

        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);

    // Measure Web Vitals
    const measureWebVitals = () => {
      // LCP (Largest Contentful Paint)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        setPerformanceData(prev => ({
          ...prev,
          lcp: lastEntry.startTime
        }));
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // FID (First Input Delay)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          setPerformanceData(prev => ({
            ...prev,
            fid: entry.processingStart - entry.startTime
          }));
        });
      }).observe({ entryTypes: ['first-input'] });

      // CLS (Cumulative Layout Shift)
      new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        setPerformanceData(prev => ({
          ...prev,
          cls: clsValue
        }));
      }).observe({ entryTypes: ['layout-shift'] });
    };

    measureWebVitals();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isMonitoring]);

  // Calculate performance metrics
  const metrics: PerformanceMetric[] = [
    {
      name: 'FPS',
      value: performanceData.fps,
      unit: 'fps',
      status: performanceData.fps >= 55 ? 'good' : performanceData.fps >= 30 ? 'warning' : 'poor',
      target: 60
    },
    {
      name: 'Memory Usage',
      value: performanceData.memoryUsage,
      unit: 'MB',
      status: performanceData.memoryUsage <= 100 ? 'good' : performanceData.memoryUsage <= 200 ? 'warning' : 'poor',
      target: 100
    },
    {
      name: 'LCP',
      value: performanceData.lcp,
      unit: 'ms',
      status: performanceData.lcp <= 2500 ? 'good' : performanceData.lcp <= 4000 ? 'warning' : 'poor',
      target: 2500
    },
    {
      name: 'FID',
      value: performanceData.fid,
      unit: 'ms',
      status: performanceData.fid <= 100 ? 'good' : performanceData.fid <= 300 ? 'warning' : 'poor',
      target: 100
    },
    {
      name: 'CLS',
      value: performanceData.cls,
      unit: '',
      status: performanceData.cls <= 0.1 ? 'good' : performanceData.cls <= 0.25 ? 'warning' : 'poor',
      target: 0.1
    },
    {
      name: 'Render Time',
      value: performanceData.renderTime,
      unit: 'ms',
      status: performanceData.renderTime <= 16 ? 'good' : performanceData.renderTime <= 33 ? 'warning' : 'poor',
      target: 16
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-400 bg-green-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/20';
      case 'poor': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const toggleMonitoring = useCallback(() => {
    setIsMonitoring(prev => !prev);
    if (!isMonitoring) {
      setHistory([]);
    }
  }, [isMonitoring]);

  const saveSnapshot = useCallback(() => {
    setHistory(prev => [...prev, performanceData].slice(-10)); // Keep last 10 snapshots
  }, [performanceData]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-80"
      >
        <OptimizedGlass intensity="heavy" className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Performance Monitor</h3>
            <div className="flex space-x-2">
              <Button
                onClick={toggleMonitoring}
                className={`px-3 py-1 text-xs ${
                  isMonitoring 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isMonitoring ? 'Stop' : 'Start'}
              </Button>
              <Button
                onClick={saveSnapshot}
                disabled={!isMonitoring}
                className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
              >
                Snapshot
              </Button>
            </div>
          </div>

          {/* Current Metrics */}
          <div className="space-y-3 mb-4">
            {metrics.map((metric) => (
              <div key={metric.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-300">{metric.name}</span>
                  <div className={`px-2 py-1 rounded text-xs ${getStatusColor(metric.status)}`}>
                    {metric.status}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-mono">
                    {metric.value.toFixed(metric.name === 'CLS' ? 3 : 0)}{metric.unit}
                  </div>
                  <div className="text-xs text-gray-400">
                    Target: {metric.target.toFixed(metric.name === 'CLS' ? 1 : 0)}{metric.unit}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Performance Score */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Overall Score</span>
              <span className="text-lg font-bold text-white">
                {Math.round(metrics.reduce((score, metric) => {
                  return score + (metric.status === 'good' ? 100 : metric.status === 'warning' ? 60 : 20);
                }, 0) / metrics.length)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.round(metrics.reduce((score, metric) => {
                    return score + (metric.status === 'good' ? 100 : metric.status === 'warning' ? 60 : 20);
                  }, 0) / metrics.length)}%` 
                }}
              />
            </div>
          </div>

          {/* Optimization Tips */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-purple-300 mb-2">Optimization Tips</h4>
            <div className="space-y-1 text-xs text-gray-300">
              {performanceData.fps < 50 && (
                <div className="text-yellow-400">• Reduce animation complexity</div>
              )}
              {performanceData.memoryUsage > 150 && (
                <div className="text-yellow-400">• Check for memory leaks</div>
              )}
              {performanceData.lcp > 3000 && (
                <div className="text-yellow-400">• Optimize image loading</div>
              )}
              {metrics.every(m => m.status === 'good') && (
                <div className="text-green-400">• Performance is optimal!</div>
              )}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-purple-300">History</h4>
                <Button
                  onClick={clearHistory}
                  className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700"
                >
                  Clear
                </Button>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {history.map((snapshot, index) => (
                  <div key={index} className="text-xs text-gray-400 font-mono">
                    #{index + 1}: {snapshot.fps}fps, {snapshot.memoryUsage.toFixed(0)}MB
                  </div>
                ))}
              </div>
            </div>
          )}
        </OptimizedGlass>
      </motion.div>
    </div>
  );
});

PerformanceDashboard.displayName = 'PerformanceDashboard';

export default PerformanceDashboard;
