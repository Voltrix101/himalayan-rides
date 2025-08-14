export class PerformanceMonitor {
  private static observers: Map<string, PerformanceObserver> = new Map();
  private static measurements: Map<string, number[]> = new Map();
  
  static startProfile(name: string) {
    performance.mark(`${name}-start`);
  }
  
  static endProfile(name: string) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measures = performance.getEntriesByName(name);
    const latestMeasure = measures[measures.length - 1];
    
    // Store measurement for analysis
    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
    this.measurements.get(name)!.push(latestMeasure.duration);
    
    if (latestMeasure.duration > 16) { // > 16ms = 60fps threshold
      console.warn(`🐌 Performance Warning: ${name} took ${latestMeasure.duration.toFixed(2)}ms`);
    }
    
    return latestMeasure.duration;
  }
  
  static observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log(`📊 LCP: ${entry.startTime.toFixed(2)}ms`);
          
          // Good LCP is under 2.5s
          if (entry.startTime > 2500) {
            console.warn('🚨 Poor LCP detected - consider optimizing images and critical resources');
          }
        }
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', observer);
    } catch (error) {
      console.warn('LCP observation not supported:', error);
    }
  }
  
  static observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as any; // PerformanceEventTiming
          const fid = fidEntry.processingStart ? fidEntry.processingStart - entry.startTime : 0;
          console.log(`📊 FID: ${fid.toFixed(2)}ms`);
        }
      });
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', observer);
    } catch {
      console.warn('FID observation not supported');
    }
  }
  
  static getAverageTime(name: string): number {
    const measurements = this.measurements.get(name) || [];
    if (measurements.length === 0) return 0;
    
    const sum = measurements.reduce((a, b) => a + b, 0);
    return sum / measurements.length;
  }
  
  static cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.measurements.clear();
  }
  
  static logPerformanceReport() {
    console.group('📊 Performance Report');
    this.measurements.forEach((times, name) => {
      const avg = this.getAverageTime(name);
      const max = Math.max(...times);
      const min = Math.min(...times);
      console.log(`${name}: avg ${avg.toFixed(2)}ms, max ${max.toFixed(2)}ms, min ${min.toFixed(2)}ms`);
    });
    console.groupEnd();
  }
}
