import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Users, Star, Calendar, Mountain, Sunrise, Sunset, Route } from 'lucide-react';
import { BikeTourPlan, TourItinerary } from '../../types';

interface FluidBikeTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  tour: BikeTourPlan;
}

interface DayCardProps {
  itinerary: TourItinerary;
  index: number;
  totalDays: number;
}

function DayCard({ itinerary, index, totalDays }: DayCardProps) {
  const getDayIcon = (day: number, icon?: string) => {
    if (icon) return icon;
    if (day === 1) return '🛬';
    if (day === totalDays) return '🏁';
    if (day <= 3) return '🏔️';
    if (day <= 6) return '🏞️';
    return '⛰️';
  };

  const getTimeIcon = (day: number) => {
    if (day === 1) return <Sunrise className="w-4 h-4" />;
    if (day === totalDays) return <Sunset className="w-4 h-4" />;
    return <Mountain className="w-4 h-4" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.1, 
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="relative"
    >
      {/* Timeline Connection Line */}
      {index < totalDays - 1 && (
        <div className="absolute left-6 top-16 w-0.5 h-20 bg-gradient-to-b from-blue-400/60 to-purple-400/60 backdrop-blur-sm"></div>
      )}
      
      {/* Day Card */}
      <div className="relative flex items-start gap-4 group">
        {/* Day Number Badge with iOS Glow */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="relative flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400/20 to-purple-400/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-2xl"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
          <span className="text-2xl relative z-10">{getDayIcon(itinerary.day, itinerary.icon)}</span>
          
          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/30 to-purple-400/30 blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
        </motion.div>

        {/* Content Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="flex-1 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:bg-white/15"
        >
          {/* Day Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h4 className="text-xl font-bold text-white bg-gradient-to-r from-white to-white/80 bg-clip-text">
                Day {itinerary.day}
              </h4>
              {getTimeIcon(itinerary.day)}
              {itinerary.location && (
                <div className="flex items-center gap-1 text-white/70">
                  <MapPin className="w-3 h-3" />
                  <span className="text-xs font-medium">{itinerary.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <h5 className="text-lg font-semibold text-white mb-3 leading-tight">
            {itinerary.title}
          </h5>

          {/* Description */}
          <p className="text-white/80 text-sm leading-relaxed mb-4">
            {itinerary.description}
          </p>

          {/* Enhanced Details Grid */}
          {(itinerary.highlights || itinerary.activities || itinerary.accommodation) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              {/* Highlights */}
              {itinerary.highlights && itinerary.highlights.length > 0 && (
                <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10">
                  <div className="text-white/60 text-xs font-medium mb-2">Highlights</div>
                  <div className="space-y-1">
                    {itinerary.highlights.slice(0, 2).map((highlight, idx) => (
                      <div key={idx} className="text-white text-xs flex items-center gap-1">
                        <Star className="w-2 h-2 text-yellow-400" />
                        {highlight}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activities */}
              {itinerary.activities && itinerary.activities.length > 0 && (
                <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10">
                  <div className="text-white/60 text-xs font-medium mb-2">Activities</div>
                  <div className="space-y-1">
                    {itinerary.activities.slice(0, 2).map((activity, idx) => (
                      <div key={idx} className="text-white text-xs flex items-center gap-1">
                        <Mountain className="w-2 h-2 text-green-400" />
                        {activity}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Accommodation */}
              {itinerary.accommodation && (
                <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10">
                  <div className="text-white/60 text-xs font-medium mb-2">Stay</div>
                  <div className="text-white text-xs">{itinerary.accommodation}</div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

export function FluidBikeTourModal({ isOpen, onClose, tour }: FluidBikeTourModalProps) {
  // Default values for missing properties
  const defaultDifficulty = "Moderate";
  const defaultBestSeason = ["May", "June", "July", "August", "September"];
  const defaultGroupSize = { min: 4, max: 12 };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, borderRadius: "2rem", y: 100 }}
            animate={{ scale: 1, opacity: 1, borderRadius: "1.5rem", y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="bg-white/10 text-white backdrop-blur-3xl border border-white/20 shadow-2xl w-[95%] max-w-4xl max-h-[90vh] rounded-3xl relative overflow-hidden"
          >
            {/* iOS-style Liquid Glass Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/5 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-blue-400/10 via-transparent to-purple-400/10"></div>
            
            {/* Header Section */}
            <div className="relative p-8 border-b border-white/10 backdrop-blur-xl">
              {/* Close Button */}
              <motion.button
                onClick={onClose}
                className="absolute top-6 right-6 text-white text-2xl font-semibold hover:text-white/80 transition-all duration-300 hover:bg-white/10 rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-md border border-white/20"
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5" />
              </motion.button>

              {/* Tour Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text">
                  {tour.title}
                </h2>
                
                {/* Tour Info Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                    <div className="flex items-center gap-2 text-white/70 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-medium">Duration</span>
                    </div>
                    <div className="text-white font-semibold">{tour.duration}</div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                    <div className="flex items-center gap-2 text-white/70 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-medium">Group Size</span>
                    </div>
                    <div className="text-white font-semibold">{defaultGroupSize.min}-{defaultGroupSize.max}</div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                    <div className="flex items-center gap-2 text-white/70 mb-1">
                      <Mountain className="w-4 h-4" />
                      <span className="text-xs font-medium">Difficulty</span>
                    </div>
                    <div className="text-white font-semibold">{defaultDifficulty}</div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                    <div className="flex items-center gap-2 text-white/70 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-medium">Best Season</span>
                    </div>
                    <div className="text-white font-semibold text-xs">{defaultBestSeason.slice(0, 2).join(', ')}</div>
                  </div>
                </div>

                {/* Tour Description */}
                {tour.description && (
                  <div className="mt-6 bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
                    <p className="text-white/80 leading-relaxed">{tour.description}</p>
                  </div>
                )}

                {/* Tour Highlights */}
                {tour.highlights && tour.highlights.length > 0 && (
                  <div className="mt-4 bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Route className="w-4 h-4 text-blue-400" />
                      Tour Highlights
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {tour.highlights.map((highlight, idx) => (
                        <div key={idx} className="text-white/80 text-sm flex items-center gap-2">
                          <Star className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                          {highlight}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Scrollable Itinerary Content */}
            <div className="relative max-h-[60vh] overflow-y-auto p-8 space-y-6 custom-scrollbar">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  Day-by-Day Itinerary
                </h3>
                
                <div className="space-y-8">
                  {tour.itinerary && tour.itinerary.length > 0 ? (
                    tour.itinerary.map((day, index) => (
                      <DayCard
                        key={day.day}
                        itinerary={day}
                        index={index}
                        totalDays={tour.itinerary.length}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 text-white/60">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Detailed itinerary will be provided upon booking</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Footer with Call to Action */}
            <div className="relative p-6 border-t border-white/10 backdrop-blur-xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex items-center justify-between"
              >
                <div>
                  <div className="text-white/60 text-sm">Starting from</div>
                  <div className="text-2xl font-bold text-white">₹{tour.price.toLocaleString()}</div>
                  <div className="text-white/50 text-xs">per person</div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-3 rounded-2xl shadow-2xl transition-all duration-300 backdrop-blur-md border border-white/20"
                >
                  Book This Adventure
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = scrollbarStyles;
  document.head.appendChild(style);
}
