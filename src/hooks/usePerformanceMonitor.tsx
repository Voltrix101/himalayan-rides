import React, { useEffect, useRef, useCallback } from 'react';

// Performance metrics interface
interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  bundleSize: number;
  memoryUsage: number;
  cacheHitRate: number;
  modalSwitchTime: number;
  scrollPerformance: number;
}

// Global performance store
class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private listeners: ((metrics: Partial<PerformanceMetrics>) => void)[] = [];
  private renderStartTime: number = 0;
  private componentRenderTimes: Map<string, number[]> = new Map();

  constructor() {
    this.initializeWebVitals();
  }

  private initializeWebVitals() {
    // Core Web Vitals tracking
    if (typeof window !== 'undefined') {
      // First Contentful Paint (FCP)
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.updateMetric('loadTime', entry.startTime);
          }
        }
      }).observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.updateMetric('renderTime', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Layout Shift (CLS)
      new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.updateMetric('scrollPerformance', 100 - (clsValue * 100));
      }).observe({ entryTypes: ['layout-shift'] });

      // Memory usage tracking
      this.trackMemoryUsage();
    }
  }

  private trackMemoryUsage() {
    if ('memory' in performance) {
      const updateMemory = () => {
        const memory = (performance as any).memory;
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        this.updateMetric('memoryUsage', usagePercent);
      };

      updateMemory();
      setInterval(updateMemory, 5000); // Update every 5 seconds
    }
  }

  startComponentRender(componentName: string) {
    this.renderStartTime = performance.now();
    return componentName;
  }

  endComponentRender(componentName: string) {
    const renderTime = performance.now() - this.renderStartTime;
    
    if (!this.componentRenderTimes.has(componentName)) {
      this.componentRenderTimes.set(componentName, []);
    }
    
    const times = this.componentRenderTimes.get(componentName)!;
    times.push(renderTime);
    
    // Keep only last 10 measurements
    if (times.length > 10) {
      times.shift();
    }

    // Update average render time
    const avgRenderTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    this.updateMetric('renderTime', avgRenderTime);
  }

  trackModalSwitch(startTime: number) {
    const switchTime = performance.now() - startTime;
    this.updateMetric('modalSwitchTime', switchTime);
  }

  trackCacheHit(isHit: boolean) {
    const currentRate = this.metrics.cacheHitRate || 0;
    const newRate = isHit ? Math.min(currentRate + 1, 100) : Math.max(currentRate - 1, 0);
    this.updateMetric('cacheHitRate', newRate);
  }

  private updateMetric(key: keyof PerformanceMetrics, value: number) {
    this.metrics[key] = value;
    this.notifyListeners();
  }

  subscribe(listener: (metrics: Partial<PerformanceMetrics>) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.metrics }));
  }

  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  getBundleSize(): Promise<number> {
    if ('navigator' in window && 'connection' in navigator) {
      // Estimate bundle size based on network info
      const connection = (navigator as any).connection;
      return Promise.resolve(connection.downlink * 100); // Rough estimate
    }
    return Promise.resolve(0);
  }

  generateReport(): string {
    const metrics = this.getMetrics();
    const report = {
      timestamp: new Date().toISOString(),
      loadTime: metrics.loadTime?.toFixed(2) + 'ms',
      renderTime: metrics.renderTime?.toFixed(2) + 'ms',
      memoryUsage: metrics.memoryUsage?.toFixed(1) + '%',
      cacheHitRate: metrics.cacheHitRate?.toFixed(1) + '%',
      modalSwitchTime: metrics.modalSwitchTime?.toFixed(2) + 'ms',
      scrollPerformance: metrics.scrollPerformance?.toFixed(1) + '%',
      componentRenderTimes: Object.fromEntries(this.componentRenderTimes.entries())
    };

    return JSON.stringify(report, null, 2);
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const metrics = useRef<Partial<PerformanceMetrics>>({});

  useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe((newMetrics) => {
      metrics.current = newMetrics;
    });

    return unsubscribe;
  }, []);

  const startRender = useCallback((componentName: string) => {
    return performanceMonitor.startComponentRender(componentName);
  }, []);

  const endRender = useCallback((componentName: string) => {
    performanceMonitor.endComponentRender(componentName);
  }, []);

  const trackModal = useCallback((startTime: number) => {
    performanceMonitor.trackModalSwitch(startTime);
  }, []);

  const trackCache = useCallback((isHit: boolean) => {
    performanceMonitor.trackCacheHit(isHit);
  }, []);

  const getReport = useCallback(() => {
    return performanceMonitor.generateReport();
  }, []);

  return {
    metrics: metrics.current,
    startRender,
    endRender,
    trackModal,
    trackCache,
    getReport
  };
};

// HOC for automatic performance tracking
export const withPerformanceTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  const PerformanceTrackedComponent = (props: P) => {
    const { startRender, endRender } = usePerformanceMonitor();

    useEffect(() => {
      const trackingId = startRender(componentName);
      return () => {
        endRender(trackingId);
      };
    }, [startRender, endRender]);

    return React.createElement(WrappedComponent, props);
  };

  PerformanceTrackedComponent.displayName = `withPerformanceTracking(${componentName})`;
  return PerformanceTrackedComponent;
};

// Performance metrics display component
export const PerformanceDisplay: React.FC = () => {
  const { metrics, getReport } = usePerformanceMonitor();

  const downloadReport = useCallback(() => {
    const report = getReport();
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [getReport]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return React.createElement('div', {
    className: 'fixed bottom-4 right-4 bg-black/80 backdrop-blur-md rounded-lg p-4 text-white text-xs z-50'
  }, [
    React.createElement('h4', { 
      key: 'title',
      className: 'font-bold mb-2' 
    }, 'Performance Metrics'),
    React.createElement('div', {
      key: 'metrics',
      className: 'space-y-1'
    }, [
      metrics.loadTime && React.createElement('div', { key: 'load' }, `Load: ${metrics.loadTime.toFixed(2)}ms`),
      metrics.renderTime && React.createElement('div', { key: 'render' }, `Render: ${metrics.renderTime.toFixed(2)}ms`),
      metrics.memoryUsage && React.createElement('div', { key: 'memory' }, `Memory: ${metrics.memoryUsage.toFixed(1)}%`),
      metrics.cacheHitRate && React.createElement('div', { key: 'cache' }, `Cache: ${metrics.cacheHitRate.toFixed(1)}%`),
      metrics.modalSwitchTime && React.createElement('div', { key: 'modal' }, `Modal: ${metrics.modalSwitchTime.toFixed(2)}ms`),
      metrics.scrollPerformance && React.createElement('div', { key: 'scroll' }, `Scroll: ${metrics.scrollPerformance.toFixed(1)}%`)
    ].filter(Boolean)),
    React.createElement('button', {
      key: 'download',
      onClick: downloadReport,
      className: 'mt-2 px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs'
    }, 'Download Report')
  ]);
};
