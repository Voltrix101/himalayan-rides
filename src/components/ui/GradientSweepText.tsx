import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GradientSweepTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function GradientSweepText({ children, className = '', delay = 0 }: GradientSweepTextProps) {
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true, amount: 0.3 }}
    >
      {children}
      
      {/* Simplified gradient sweep overlay - only on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0"
        initial={{ x: '-100%', opacity: 0 }}
        whileHover={{ 
          x: '100%', 
          opacity: 1,
          transition: {
            duration: 1.5,
            ease: "easeInOut"
          }
        }}
        style={{
          width: '100%',
          height: '100%',
          mixBlendMode: 'overlay',
          pointerEvents: 'none'
        }}
      />
    </motion.div>
  );
}
