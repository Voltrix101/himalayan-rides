// Performance monitoring hook - only exports React hook

import { useEffect, useRef, useCallback } from 'react';

// Performance metrics interface
interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  bundleSize: number;
  memoryUsage: number;
  cacheHitRate: number;
  modalSwitchTime: number;
  scrollPerformance: number;
  componentRenderTimes: Map<string, number>;
}

// Performance Monitor Class (simplified for hook-only export)
class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: ((metrics: Partial<PerformanceMetrics>) => void)[] = [];
  private componentRenderTimes = new Map<string, number>();
  private componentStartTimes = new Map<string, number>();
  private cacheHits = 0;
  private cacheTotal = 0;

  constructor() {
    this.initializeMetrics();
  }

  private initializeMetrics() {
    if (typeof window !== 'undefined') {
      // Web Vitals observation
      try {
        import('web-vitals').then(({ onFCP, onLCP, onFID, onCLS, onTTFB }) => {
          onFCP((metric) => this.updateMetric('loadTime', metric.value));
          onLCP((metric) => this.updateMetric('renderTime', metric.value));
          onFID((metric) => this.updateMetric('modalSwitchTime', metric.value));
          onCLS((metric) => this.updateMetric('scrollPerformance', 100 - metric.value * 100));
          onTTFB((metric) => this.updateMetric('loadTime', metric.value));
        });
      } catch (error) {
        console.warn('Web Vitals not available:', error);
      }

      // Memory usage
      if ('memory' in performance) {
        const memoryInfo = (performance as any).memory;
        this.updateMetric('memoryUsage', (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100);
      }

      // Bundle size estimation
      if ('getEntriesByType' in performance) {
        const navigationEntries = performance.getEntriesByType('navigation');
        if (navigationEntries.length > 0) {
          const entry = navigationEntries[0] as PerformanceNavigationTiming;
          this.updateMetric('bundleSize', entry.transferSize || 0);
        }
      }
    }
  }

  private updateMetric(key: Exclude<keyof PerformanceMetrics, 'componentRenderTimes'>, value: number) {
    (this.metrics as any)[key] = value;
    this.notifyObservers();
  }

  private notifyObservers() {
    this.observers.forEach(observer => observer(this.metrics));
  }

  subscribe(observer: (metrics: Partial<PerformanceMetrics>) => void) {
    this.observers.push(observer);
    return () => {
      this.observers = this.observers.filter(obs => obs !== observer);
    };
  }

  startComponentRender(componentName: string): string {
    const trackingId = `${componentName}_${Date.now()}`;
    this.componentStartTimes.set(trackingId, performance.now());
    return trackingId;
  }

  endComponentRender(componentName: string) {
    const now = performance.now();
    for (const [key, startTime] of this.componentStartTimes.entries()) {
      if (key.startsWith(componentName)) {
        const renderTime = now - startTime;
        this.componentRenderTimes.set(componentName, renderTime);
        this.componentStartTimes.delete(key);
        this.updateMetric('renderTime', renderTime);
        break;
      }
    }
  }

  trackModalSwitch(startTime: number) {
    const switchTime = performance.now() - startTime;
    this.updateMetric('modalSwitchTime', switchTime);
  }

  trackCacheHit(isHit: boolean) {
    this.cacheTotal++;
    if (isHit) this.cacheHits++;
    this.updateMetric('cacheHitRate', (this.cacheHits / this.cacheTotal) * 100);
  }

  generateReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      ...this.metrics,
      componentRenderTimes: Object.fromEntries(this.componentRenderTimes.entries())
    };

    return JSON.stringify(report, null, 2);
  }
}

// Global instance
const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring (ONLY export hooks from this file)
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
