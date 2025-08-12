import { useCallback, useEffect, useRef } from 'react';
import { useScroll, useTransform, MotionValue } from 'framer-motion';
import { PerformanceMonitor } from '../utils/performanceMonitor';

interface ScrollConfig {
  throttle?: number;
  enableParallax?: boolean;
  enableBlur?: boolean;
  enableOpacity?: boolean;
}

export const useOptimizedScroll = (config: ScrollConfig = {}) => {
  const { throttle = 16, enableParallax = true, enableBlur = true, enableOpacity = true } = config;
  const lastUpdateRef = useRef(0);
  const rafRef = useRef<number>();
  const { scrollY, scrollYProgress } = useScroll();
  
  // Performance profiling
  const profileName = 'scroll-hook';
  
  useEffect(() => {
    PerformanceMonitor.startProfile(profileName);
    return () => {
      PerformanceMonitor.endProfile(profileName);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);
  
  // Throttled scroll value with RAF optimization
  const throttledCallback = useCallback((value: number) => {
    const now = performance.now();
    if (now - lastUpdateRef.current < throttle) {
      return lastUpdateRef.current;
    }
    
    // Use RAF for smooth updates
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      lastUpdateRef.current = value;
    });
    
    return value;
  }, [throttle]);
  
  // Optimized transforms with reduced calculations
  const opacity = enableOpacity ? useTransform(scrollY, [0, 300], [0.8, 0.95]) : undefined;
  const blur = enableBlur ? useTransform(scrollY, [0, 300], [8, 24]) : undefined;
  const parallaxY = enableParallax ? useTransform(scrollY, [0, 1000], [0, -100]) : undefined;
  const scale = enableParallax ? useTransform(scrollY, [0, 500], [1, 1.05]) : undefined;
  
  // Throttled scroll Y
  const throttledScrollY = useTransform(scrollY, throttledCallback);
  
  return {
    scrollY: throttledScrollY,
    scrollYProgress,
    opacity,
    blur,
    parallaxY,
    scale
  };
};
