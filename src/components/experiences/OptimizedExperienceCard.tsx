import { memo, useState, useEffect, useRef, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { OptimizedGlass } from '../ui/OptimizedGlass';
import { OptimizedImage } from '../ui/OptimizedImage';
import { Button } from '../ui/Button';

interface Experience {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  image: string;
  highlights: string[];
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  season: string;
}

interface OptimizedExperienceCardProps {
  experience: Experience;
  onBook: (experience: Experience) => void;
  index: number;
}

// Optimized card animation variants
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
      mass: 0.8
    }
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25
    }
  }
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1,
      duration: 0.3,
      ease: "easeOut" as const
    }
  }
};

const OptimizedExperienceCard = memo<OptimizedExperienceCardProps>(({ 
  experience, 
  onBook
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  // Simple performance tracking
  const startProfile = (id: string) => performance.mark(`${id}-start`);
  const endProfile = (id: string) => {
    performance.mark(`${id}-end`);
    performance.measure(id, `${id}-start`, `${id}-end`);
  };

  // Intersection Observer for viewport-based loading
  useEffect(() => {
    const currentRef = cardRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          startProfile(`experience-card-${experience.id}`);
          setIsVisible(true);
          controls.start('visible');
          endProfile(`experience-card-${experience.id}`);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px 0px'
      }
    );

    observer.observe(currentRef);
        return () => observer.unobserve(currentRef);
  }, [isVisible, experience.id, controls]);

  // Optimized hover handlers
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    controls.start('hover');
  }, [controls]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    controls.start('visible');
  }, [controls]);

  // Optimized booking handler
  const handleBooking = useCallback(() => {
    startProfile(`booking-${experience.id}`);
    onBook(experience);
    endProfile(`booking-${experience.id}`);
  }, [experience, onBook]);  // Get difficulty color
  const getDifficultyColor = useCallback((difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400';
      case 'Moderate': return 'text-yellow-400';
      case 'Challenging': return 'text-red-400';
      default: return 'text-gray-400';
    }
  }, []);

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      initial="hidden"
      animate={controls}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ 
        willChange: isHovered ? 'transform' : 'auto',
        backfaceVisibility: 'hidden'
      }}
      className="h-full"
    >
      <OptimizedGlass 
        intensity="medium" 
        className="h-full overflow-hidden hover:ring-2 hover:ring-purple-400/50 transition-all duration-300"
      >
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          <OptimizedImage
            src={experience.image}
            alt={experience.title}
            className="w-full h-full object-cover"
            enableMotion={isVisible}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Difficulty Badge */}
          <div className="absolute top-4 right-4">
            <OptimizedGlass intensity="heavy" className="px-3 py-1">
              <span className={`text-sm font-medium ${getDifficultyColor(experience.difficulty)}`}>
                {experience.difficulty}
              </span>
            </OptimizedGlass>
          </div>

          {/* Price Badge */}
          <div className="absolute bottom-4 right-4">
            <OptimizedGlass intensity="heavy" className="px-3 py-1">
              <span className="text-white font-bold">₹{experience.price.toLocaleString()}</span>
            </OptimizedGlass>
          </div>
        </div>

        {/* Content Section */}
        <motion.div 
          variants={contentVariants}
          className="p-6 space-y-4"
        >
          {/* Title and Duration */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white leading-tight">
              {experience.title}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-300">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {experience.duration}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {experience.season}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
            {experience.description}
          </p>

          {/* Highlights */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-purple-300">Highlights</h4>
            <div className="flex flex-wrap gap-2">
              {experience.highlights.slice(0, 3).map((highlight, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-400/30"
                >
                  {highlight}
                </span>
              ))}
              {experience.highlights.length > 3 && (
                <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-full border border-gray-400/30">
                  +{experience.highlights.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Book Button */}
          <div className="pt-4">
            <Button
              onClick={handleBooking}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200"
            >
              Book Experience
            </Button>
          </div>
        </motion.div>
      </OptimizedGlass>
    </motion.div>
  );
});

OptimizedExperienceCard.displayName = 'OptimizedExperienceCard';

export default OptimizedExperienceCard;
