import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

interface OptimizedGlassProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
  enableHover?: boolean;
  enableMotion?: boolean;
}

const glassStyles = {
  light: 'backdrop-blur-sm bg-white/10 border border-white/20 shadow-lg',
  medium: 'backdrop-blur-md bg-white/20 border border-white/30 shadow-xl',
  heavy: 'backdrop-blur-xl bg-white/30 border border-white/40 shadow-2xl'
};

const hoverVariants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

export const OptimizedGlass = memo<OptimizedGlassProps>(({ 
  children, 
  className = '', 
  intensity = 'medium',
  enableHover = false,
  enableMotion = true
}) => {
  const baseClass = useMemo(() => 
    `${glassStyles[intensity]} rounded-lg ${className}`,
    [intensity, className]
  );
  
  // For non-interactive glass, use regular div for better performance
  if (!enableHover || !enableMotion) {
    return (
      <div className={baseClass}>
        {children}
      </div>
    );
  }
  
  return (
    <motion.div
      className={baseClass}
      variants={hoverVariants}
      initial="initial"
      whileHover="hover"
      style={{
        willChange: 'transform',
        backfaceVisibility: 'hidden'
      }}
    >
      {children}
    </motion.div>
  );
});

OptimizedGlass.displayName = 'OptimizedGlass';
