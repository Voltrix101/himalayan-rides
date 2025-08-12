import { motion } from 'framer-motion';

interface PremiumLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'wave';
  color?: 'default' | 'purple' | 'cyan' | 'gradient';
  text?: string;
}

export function PremiumLoader({ 
  size = 'md', 
  variant = 'spinner',
  color = 'gradient',
  text
}: PremiumLoaderProps) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const colors = {
    default: 'border-white/30 border-t-white',
    purple: 'border-purple-500/30 border-t-purple-400',
    cyan: 'border-cyan-500/30 border-t-cyan-400',
    gradient: 'border-transparent bg-gradient-to-r from-purple-500 to-cyan-500'
  };

  if (variant === 'spinner') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <motion.div
          className={`${sizes[size]} rounded-full border-2 ${color === 'gradient' ? 'bg-gradient-to-r from-purple-500 to-cyan-500' : colors[color]}`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            background: color === 'gradient' 
              ? 'conic-gradient(from 0deg, transparent, #8b5cf6, #06b6d4, transparent)' 
              : undefined
          }}
        />
        {text && (
          <motion.p 
            className="text-white/80 text-sm font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`w-3 h-3 rounded-full ${color === 'gradient' ? 'bg-gradient-to-r from-purple-500 to-cyan-500' : 'bg-white'}`}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
        {text && (
          <motion.p 
            className="text-white/80 text-sm font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <motion.div
          className={`${sizes[size]} rounded-full ${color === 'gradient' ? 'bg-gradient-to-r from-purple-500 to-cyan-500' : 'bg-white'}`}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.8, 0.4, 0.8]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        {text && (
          <motion.p 
            className="text-white/80 text-sm font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === 'wave') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="flex space-x-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className={`w-2 rounded-full ${color === 'gradient' ? 'bg-gradient-to-t from-purple-500 to-cyan-500' : 'bg-white'}`}
              animate={{ 
                height: [20, 40, 20]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.1,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
        {text && (
          <motion.p 
            className="text-white/80 text-sm font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  return null;
}
