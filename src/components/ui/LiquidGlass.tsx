import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface LiquidGlassProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'dark' | 'frosted' | 'floating' | 'navbar';
  hover?: boolean;
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  animate?: boolean;
}

export function LiquidGlass({ 
  children, 
  className,
  variant = 'default',
  hover = false,
  blur = 'md',
  glow = false,
  animate = true
}: LiquidGlassProps) {
  const baseClasses = {
    default: 'liquid-glass',
    dark: 'liquid-glass-dark',
    frosted: 'frosted-panel',
    floating: 'floating-glass',
    navbar: 'liquid-glass-navbar'
  };

  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl'
  };

  const Component = animate ? motion.div : 'div';

  const motionProps = animate ? {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { 
      duration: 0.5, 
      ease: [0.4, 0, 0.2, 1],
      type: "spring",
      stiffness: 100
    },
    whileHover: hover ? { 
      scale: 1.02, 
      y: -4,
      transition: { duration: 0.2 }
    } : undefined
  } : {};

  return (
    <Component
      {...motionProps}
      className={cn(
        baseClasses[variant],
        blurClasses[blur],
        hover && 'transition-all duration-300 cursor-pointer',
        glow && 'shadow-lg shadow-purple-500/20',
        'relative overflow-hidden',
        className
      )}
    >
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 opacity-50" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  );
}
