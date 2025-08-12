import { memo, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { OptimizedImage } from '../ui/OptimizedImage';
import { useOptimizedScroll } from '../../hooks/useOptimizedScroll';
import { PerformanceMonitor } from '../../utils/performanceMonitor';

const HERO_IMAGES = [
  '/images/leh-1.jpg',
  '/images/leh-2.jpg', 
  '/images/leh-3.jpg'
];

interface OptimizedHeroSectionProps {
  onExploreClick?: () => void;
}

export const OptimizedHeroSection = memo<OptimizedHeroSectionProps>(({ 
  onExploreClick 
}) => {
  const { parallaxY } = useOptimizedScroll({ 
    enableBlur: false, 
    enableOpacity: false 
  });
  
  // Memoized Ken Burns animation variants
  const kenBurnsVariants = useMemo(() => ({
    animate: {
      scale: [1, 1.05, 1],
      x: [0, -20, 0],
      transition: {
        duration: 12, // Slower for smoother performance
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }), []);
  
  // Memoized text animation variants
  const textVariants = useMemo(() => ({
    initial: { opacity: 0, y: 30 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  }), []);
  
  const handleExploreClick = useCallback(() => {
    PerformanceMonitor.startProfile('explore-navigation');
    onExploreClick?.();
    PerformanceMonitor.endProfile('explore-navigation');
  }, [onExploreClick]);
  
  return (
    <section className="relative h-screen overflow-hidden">
      {/* Optimized Background Images with better performance */}
      <div className="absolute inset-0">
        {HERO_IMAGES.map((image, index) => (
          <motion.div
            key={image}
            className="absolute inset-0"
            style={{ 
              y: parallaxY,
              willChange: 'transform',
              backfaceVisibility: 'hidden'
            }}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: index === 0 ? [0, 1, 1, 0] : [0, 0, 1, 1, 0],
              transition: {
                duration: 12,
                repeat: Infinity,
                delay: index * 4, // Stagger the animations
                ease: "easeInOut"
              }
            }}
          >
            <motion.div 
              variants={kenBurnsVariants} 
              animate="animate"
              style={{
                willChange: 'transform',
                backfaceVisibility: 'hidden'
              }}
            >
              <OptimizedImage
                src={image}
                alt={`Ladakh landscape ${index + 1}`}
                className="w-full h-full"
                priority={index === 0}
                enableMotion={false} // Disable motion in image to reduce layers
                placeholder={`Ladakh ${index + 1}`}
              />
            </motion.div>
          </motion.div>
        ))}
      </div>
      
      {/* Optimized Static Gradient Overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(45deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.4) 100%)'
        }}
      />
      
      {/* Content Layer - Optimized */}
      <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
        <motion.div
          variants={textVariants}
          initial="initial"
          animate="animate"
          className="max-w-4xl"
        >
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
            <span 
              className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent"
              style={{ willChange: 'auto' }}
            >
              Ladakh
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Land of High Passes • Where Earth Touches Sky • Adventure Awaits
          </p>
          
          {/* CTA Button */}
          {onExploreClick && (
            <motion.button
              onClick={handleExploreClick}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                willChange: 'transform',
                backfaceVisibility: 'hidden'
              }}
            >
              Explore Adventures
            </motion.button>
          )}
        </motion.div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2"></div>
        </div>
      </motion.div>
    </section>
  );
});

OptimizedHeroSection.displayName = 'OptimizedHeroSection';
