import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

interface FloatingParticlesProps {
  count?: number;
  className?: string;
  color?: 'blue' | 'purple' | 'cyan' | 'white';
}

export function FloatingParticles({ 
  count = 15, 
  className = '',
  color = 'cyan'
}: FloatingParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  const colorClasses = {
    blue: 'bg-blue-400/20',
    purple: 'bg-purple-400/20',
    cyan: 'bg-cyan-400/20',
    white: 'bg-white/10'
  };

  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1, // Reduced size for better performance
      opacity: Math.random() * 0.3 + 0.1, // Reduced opacity 
      duration: Math.random() * 30 + 15, // Slower animations
      delay: Math.random() * 10
    }));
    setParticles(newParticles);
  }, [count]);

  // Reduce motion for accessibility
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full ${colorClasses[color]} backdrop-blur-sm`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            scale: [1, 1.2, 1],
            opacity: [particle.opacity, particle.opacity * 0.5, particle.opacity],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* iOS-style light orbs */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className={`absolute rounded-full ${colorClasses[color]} blur-xl`}
          style={{
            left: `${20 + i * 30}%`,
            top: `${20 + i * 20}%`,
            width: 40 + i * 20,
            height: 40 + i * 20,
            opacity: 0.1,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.3, 0.1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 2,
          }}
        />
      ))}
    </div>
  );
}
