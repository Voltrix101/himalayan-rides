import React, { useState, useCallback, memo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PerformanceMonitor } from '../../utils/performanceMonitor';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  enableMotion?: boolean;
  placeholder?: string;
}

export const OptimizedImage = memo<OptimizedImageProps>(({
  src,
  alt,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  onLoad,
  enableMotion = true,
  placeholder
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  
  // Only track performance in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      startTimeRef.current = Date.now();
    }
  }, []);
  
  const handleLoad = useCallback(() => {
    // Lightweight performance tracking only in development
    if (process.env.NODE_ENV === 'development') {
      const loadTime = Date.now() - startTimeRef.current;
      if (loadTime > 3000) {
        console.warn(`🐌 Slow image load: ${alt} took ${loadTime}ms`);
      }
    }
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad, alt]);
  
  const handleError = useCallback(() => {
    setError(true);
    console.warn(`Image failed to load: ${src}`);
  }, [src]);
  
  // Error fallback
  if (error) {
    return (
      <div className={`bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center ${className}`}>
        <span className="text-white/60 text-4xl">🏔️</span>
      </div>
    );
  }
  
  const imageProps = {
    ref: imgRef,
    src,
    alt,
    sizes,
    loading: priority ? 'eager' as const : 'lazy' as const,
    className: "w-full h-full object-cover",
    onLoad: handleLoad,
    onError: handleError,
    style: {
      willChange: enableMotion ? 'transform' : 'auto',
      backfaceVisibility: 'hidden' as const
    }
  };
  
  const content = (
    <div className={`relative overflow-hidden ${className}`}>
      {enableMotion ? (
        <motion.img
          {...imageProps}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ 
            opacity: isLoaded ? 1 : 0,
            scale: isLoaded ? 1 : 1.1
          }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      ) : (
        <img
          {...imageProps}
          style={{ 
            ...imageProps.style,
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.6s ease'
          }}
        />
      )}
      
      {/* Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 animate-pulse flex items-center justify-center">
          {placeholder ? (
            <div className="text-white/60 text-sm font-medium">{placeholder}</div>
          ) : (
            <div className="w-8 h-8 border-2 border-white/30 border-t-white/60 rounded-full animate-spin"></div>
          )}
        </div>
      )}
    </div>
  );
  
  return content;
});

OptimizedImage.displayName = 'OptimizedImage';
