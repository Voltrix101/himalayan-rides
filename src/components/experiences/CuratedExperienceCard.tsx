import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Star, 
  Users, 
  Sparkles,
  Heart,
  Camera,
  Mountain
} from 'lucide-react';
import { CuratedExperience } from '../../types/curatedExperience';
import { FluidButton } from '../ui/FluidButton';
import { LiquidGlass } from '../ui/LiquidGlass';
import { NeonText } from '../ui/NeonText';
import { useTouchInteraction } from '../../hooks/useTouchInteraction';

interface CuratedExperienceCardProps {
  experience: CuratedExperience;
  onBookNow: (experience: CuratedExperience) => void;
  isLoading?: boolean;
}

export function CuratedExperienceCard({ 
  experience, 
  onBookNow, 
  isLoading = false 
}: CuratedExperienceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { touchProps } = useTouchInteraction();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Photography': return <Camera className="w-4 h-4" />;
      case 'Spiritual': return <Sparkles className="w-4 h-4" />;
      case 'Cultural': return <Heart className="w-4 h-4" />;
      default: return <Mountain className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-400/20';
      case 'Moderate': return 'text-yellow-400 bg-yellow-400/20';
      case 'Challenging': return 'text-red-400 bg-red-400/20';
      default: return 'text-blue-400 bg-blue-400/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      {...touchProps}
      className="group relative h-[580px] w-full max-w-sm mx-auto"
    >
      <LiquidGlass 
        variant="frosted" 
        className="h-full overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-500"
      >
        {/* Ken Burns Effect Background Image */}
        <div className="relative h-48 overflow-hidden">
          <motion.div
            animate={{ 
              scale: isHovered ? 1.1 : 1,
              rotate: isHovered ? 2 : 0
            }}
            transition={{ duration: 10, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
            className="absolute inset-0"
          >
            <img
              src={experience.image}
              alt={experience.title}
              className={`w-full h-full object-cover transition-all duration-1000 ${
                imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
          </motion.div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Category Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
          >
            <span className="text-white">{getCategoryIcon(experience.category)}</span>
            <span className="text-white text-sm font-medium">{experience.category}</span>
          </motion.div>

          {/* Difficulty Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold ${getDifficultyColor(experience.difficulty)}`}
          >
            {experience.difficulty}
          </motion.div>

          {/* Rating */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-4 left-4 flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full"
          >
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-white text-sm font-medium">{experience.rating}</span>
          </motion.div>
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col h-[calc(100%-192px)] min-h-[360px]">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <NeonText variant="rainbow" className="text-lg font-bold mb-2 line-clamp-2">
              {experience.title}
            </NeonText>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-white/80 text-sm mb-4 line-clamp-3 flex-grow"
          >
            {experience.description}
          </motion.p>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-3 mb-6"
          >
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-white/70">
                <Clock className="w-4 h-4" />
                <span>{experience.days} Days</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <Users className="w-4 h-4" />
                <span>Max {experience.maxParticipants}</span>
              </div>
            </div>

            {/* Highlights Preview */}
            <div className="space-y-1">
              {experience.highlights.slice(0, 2).map((highlight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + (index * 0.1) }}
                  className="flex items-start gap-2 text-xs text-white/60"
                >
                  <span className="text-green-400 mt-0.5">•</span>
                  <span className="line-clamp-1">{highlight}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Price and Book Now */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mt-auto space-y-3 pb-2"
          >
            {/* Price */}
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                ₹{experience.price.toLocaleString()}
              </div>
              <div className="text-xs text-white/60">per person</div>
            </div>

            {/* Book Now Button with Ripple Effect */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FluidButton
                variant="primary"
                size="lg"
                onClick={() => onBookNow(experience)}
                disabled={isLoading}
                className="w-full relative overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100"
                  animate={{ 
                    x: isHovered ? ['0%', '100%'] : '0%'
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: isHovered ? Infinity : 0,
                    ease: "linear"
                  }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Book Now
                    </>
                  )}
                </span>
              </FluidButton>
            </motion.div>
          </motion.div>
        </div>

        {/* Hover Glow Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          animate={{
            background: isHovered 
              ? [
                  'radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 100% 100%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 0% 100%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                ]
              : 'radial-gradient(circle at 50% 50%, transparent 0%, transparent 100%)'
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* Floating Particles Effect on Hover */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/60 rounded-full"
                initial={{ 
                  x: Math.random() * 100 + '%',
                  y: '100%',
                  opacity: 0
                }}
                animate={{ 
                  y: '-10%',
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}
      </LiquidGlass>
    </motion.div>
  );
}
