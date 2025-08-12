import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface FluidButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  glow?: boolean;
  ripple?: boolean;
}

export function FluidButton({ 
  children, 
  className,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  icon,
  glow = false,
  ripple = true
}: FluidButtonProps) {
  const variants = {
    primary: 'glow-button text-white font-medium',
    secondary: 'liquid-glass text-white font-medium hover:bg-white/20',
    ghost: 'bg-transparent border border-white/20 text-white hover:bg-white/10',
    glow: 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold shadow-lg shadow-purple-500/50'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 text-base rounded-2xl',
    lg: 'px-8 py-4 text-lg rounded-2xl',
    xl: 'px-10 py-5 text-xl rounded-3xl'
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        variants[variant],
        sizes[size],
        'relative overflow-hidden transition-all duration-300',
        'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        glow && 'shadow-2xl',
        className
      )}
      whileHover={{ 
        scale: disabled ? 1 : 1.05,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: disabled ? 1 : 0.95,
        transition: { duration: 0.1 }
      }}
    >
      {ripple && (
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-full"
          initial={{ scale: 0, opacity: 0.5 }}
          whileTap={{ 
            scale: 4, 
            opacity: 0,
            transition: { duration: 0.4 }
          }}
        />
      )}
      
      <div className="relative flex items-center justify-center gap-2">
        {icon && (
          <motion.div
            initial={{ rotate: 0 }}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            {icon}
          </motion.div>
        )}
        {children}
      </div>
    </motion.button>
  );
}
