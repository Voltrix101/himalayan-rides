import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, MapPin } from 'lucide-react';

interface GlassExploreCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  location?: string;
  isExpanded?: boolean;
  onToggle?: (id: string) => void;
}

export function GlassExploreCard({
  id,
  title,
  description,
  imageUrl,
  videoUrl,
  location,
  isExpanded = false,
  onToggle
}: GlassExploreCardProps) {
  const handleToggle = () => {
    onToggle?.(isExpanded ? '' : id);
  };

  return (
    <motion.div
      layout
      className="group relative overflow-hidden rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Collapsed State */}
      <motion.div layout className="relative">
        {/* Hero Image */}
        <div className="relative h-64 overflow-hidden">
          <motion.img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            layoutId={`image-${id}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          
          {/* Location Badge */}
          {location && (
            <div className="absolute top-4 right-4">
              <div className="backdrop-blur-md bg-white/20 rounded-full px-3 py-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-white" />
                <span className="text-white text-xs font-medium">{location}</span>
              </div>
            </div>
          )}

          {/* Title and Explore Button */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <motion.h3 
              layout
              className="text-2xl md:text-3xl font-bold text-white mb-4 drop-shadow-lg"
            >
              {title}
            </motion.h3>
            
            <motion.button
              onClick={handleToggle}
              className="group/btn backdrop-blur-md bg-white/20 hover:bg-white/30 border border-white/30 rounded-full px-6 py-3 flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-4 h-4 text-white group-hover/btn:text-blue-200 transition-colors" />
              <span className="text-white font-medium group-hover/btn:text-blue-200 transition-colors">
                Explore
              </span>
            </motion.button>
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="p-6 backdrop-blur-md bg-white/5">
                {/* Close Button */}
                <div className="flex justify-end mb-4">
                  <motion.button
                    onClick={handleToggle}
                    className="backdrop-blur-md bg-white/20 hover:bg-white/30 border border-white/30 rounded-full p-2 transition-all duration-300 hover:scale-110 active:scale-95"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </div>

                {/* Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Description */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="space-y-4"
                  >
                    <h4 className="text-xl font-semibold text-white mb-3">
                      Discover the Magic
                    </h4>
                    <p className="text-white/80 leading-relaxed text-sm md:text-base">
                      {description}
                    </p>
                    
                    {/* Decorative Elements */}
                    <div className="flex items-center gap-2 pt-4">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                      <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                      <span className="text-white/60 text-xs ml-2">Immersive Experience</span>
                    </div>
                  </motion.div>

                  {/* Video */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="relative rounded-xl overflow-hidden backdrop-blur-md bg-white/10 border border-white/20"
                  >
                    <div className="aspect-video">
                      <iframe
                        src={videoUrl}
                        title={`${title} - Explore Video`}
                        className="w-full h-full rounded-xl"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
