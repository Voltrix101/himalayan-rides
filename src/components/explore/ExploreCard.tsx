import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mountain, MapPin, Calendar, Users, Star, Clock } from 'lucide-react';

// Define the props for the card for type safety
interface ExploreCardProps {
  id: string;
  title: string;
  shortDescription: string;
  imageUrl: string;
  details: {
    duration: string;
    difficulty: 'Easy' | 'Moderate' | 'Challenging';
    price: string;
    altitude?: string;
    bestTime?: string;
    highlights?: string[];
  };
  onBookNow?: (destination: any) => void;
}

export const ExploreCard = ({ 
  id, 
  title, 
  shortDescription, 
  imageUrl, 
  details, 
  onBookNow 
}: ExploreCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const difficultyColors = {
    Easy: 'text-green-400',
    Moderate: 'text-yellow-400',
    Challenging: 'text-red-400'
  };

  const handleBookNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookNow) {
      onBookNow({
        id,
        title,
        type: 'experience',
        price: parseInt(details.price.replace(/[^\d]/g, '')),
        description: shortDescription,
        image: imageUrl,
        duration: details.duration
      });
    }
  };

  return (
    <motion.div
      layout
      onClick={() => setIsExpanded(!isExpanded)}
      className="relative p-6 rounded-2xl shadow-xl cursor-pointer overflow-hidden bg-white/10 backdrop-blur-lg border border-white/20 hover:border-white/40 transition-all duration-300"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      transition={{ 
        layout: { duration: 0.4, type: 'spring', stiffness: 100 },
        borderColor: { duration: 0.3 }
      }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-2xl"></div>

      <motion.div layout="position" className="relative z-10 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Mountain className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-blue-400 font-medium">Adventure</span>
            </div>
            <h3 className="text-2xl font-bold drop-shadow-lg mb-2">{title}</h3>
            {!isExpanded && (
              <p className="text-gray-200 text-sm leading-relaxed">{shortDescription}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className={`text-xs px-2 py-1 rounded-full bg-black/30 ${difficultyColors[details.difficulty]}`}>
              {details.difficulty}
            </div>
            {details.altitude && (
              <div className="text-xs text-gray-300 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {details.altitude}
              </div>
            )}
          </div>
        </div>

        {!isExpanded && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {details.duration}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" />
                4.8
              </div>
            </div>
            <div className="text-xl font-bold text-blue-400">
              {details.price}
            </div>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="relative z-10 mt-6 text-white"
          >
            <div className="border-t border-white/20 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Trip Details */}
                <div>
                  <h4 className="font-semibold mb-3 text-lg flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-400" />
                    Trip Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Duration:</span>
                      <span className="font-medium">{details.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Difficulty:</span>
                      <span className={`font-medium ${difficultyColors[details.difficulty]}`}>
                        {details.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Starting from:</span>
                      <span className="font-bold text-blue-400 text-lg">{details.price}</span>
                    </div>
                    {details.altitude && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Altitude:</span>
                        <span className="font-medium">{details.altitude}</span>
                      </div>
                    )}
                    {details.bestTime && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Best Time:</span>
                        <span className="font-medium">{details.bestTime}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Highlights */}
                {details.highlights && details.highlights.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-lg flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      Highlights
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {details.highlights.slice(0, 4).map((highlight, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                          <span className="text-gray-300">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleBookNow}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Book Now
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add view details logic here
                    console.log(`Viewing details for ${title}`);
                  }}
                  className="px-6 py-3 border border-white/30 hover:border-white/50 text-white font-medium rounded-xl transition-all duration-300 hover:bg-white/10 flex items-center gap-2"
                >
                  <Mountain className="w-5 h-5" />
                  Details
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expand/Collapse Indicator */}
      <motion.div
        className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
        animate={{ rotate: isExpanded ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={{ scale: isExpanded ? 0.8 : 1 }}
          transition={{ duration: 0.2 }}
        >
          ⌄
        </motion.div>
      </motion.div>
    </motion.div>
  );
};