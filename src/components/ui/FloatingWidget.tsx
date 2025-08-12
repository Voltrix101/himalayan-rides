import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface FloatingWidgetProps {
  children: React.ReactNode;
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  className?: string;
  glow?: boolean;
}

export function FloatingWidget({ 
  children, 
  position, 
  className,
  glow = true 
}: FloatingWidgetProps) {
  const positions = {
    'bottom-left': 'bottom-6 left-6',
    'bottom-right': 'bottom-6 right-6', 
    'top-left': 'top-6 left-6',
    'top-right': 'top-6 right-6'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: 1.2,
        ease: [0.4, 0, 0.2, 1] 
      }}
      className={cn(
        'fixed z-30',
        positions[position],
        className
      )}
    >
      <div className={cn(
        'floating-glass rounded-2xl p-4',
        'backdrop-blur-xl border border-white/10',
        glow && 'shadow-xl shadow-purple-500/10',
        'hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300'
      )}>
        {children}
      </div>
    </motion.div>
  );
}
