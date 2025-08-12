import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface NeonTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'warm' | 'cool' | 'rainbow';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  animate?: boolean;
  glow?: boolean;
}

export function NeonText({ 
  children, 
  className, 
  variant = 'default',
  size = 'md',
  animate = true,
  glow = true
}: NeonTextProps) {
  const variants = {
    default: 'neon-text',
    warm: 'neon-text-warm',
    cool: 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent',
    rainbow: 'bg-gradient-to-r from-pink-500 via-purple-500 via-blue-500 via-green-500 to-yellow-500 bg-clip-text text-transparent'
  };

  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  };

  const Component = animate ? motion.div : 'div';

  const motionProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { 
      duration: 0.6, 
      ease: [0.4, 0, 0.2, 1] 
    }
  } : {};

  return (
    <Component
      {...motionProps}
      className={cn(
        variants[variant],
        sizes[size],
        glow && 'drop-shadow-lg',
        'font-bold tracking-tight',
        className
      )}
      style={{
        filter: glow ? 'drop-shadow(0 0 8px rgba(142, 68, 255, 0.5))' : undefined
      }}
    >
      {children}
    </Component>
  );
}
