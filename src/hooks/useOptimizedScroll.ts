import { useCallback, useEffect, useRef } from 'react';
import { useScroll, useTransform } from 'framer-motion';
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
  
  // Always call hooks but use different transforms based on options
  const opacityTransform = useTransform(scrollY, [0, 300], [0.8, 0.95]);
  const blurTransform = useTransform(scrollY, [0, 300], [8, 24]);
  const parallaxYTransform = useTransform(scrollY, [0, 1000], [0, -100]);
  const scaleTransform = useTransform(scrollY, [0, 500], [1, 1.05]);
  
  // Return the transforms conditionally
  const opacity = enableOpacity ? opacityTransform : undefined;
  const blur = enableBlur ? blurTransform : undefined;
  const parallaxY = enableParallax ? parallaxYTransform : undefined;
  const scale = enableParallax ? scaleTransform : undefined;
  
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
