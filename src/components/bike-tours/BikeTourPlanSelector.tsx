import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BikeTourPlan } from '../../data/bikeTourPlans';
import BikeTourPlanService from '../../services/bikeTourPlanService';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';

// Simple SVG Icons
const ClockIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CurrencyRupeeIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MapPinIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const StarIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const BikeIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface BikeTourPlanSelectorProps {
  onPlanSelect: (plan: BikeTourPlan) => void;
  onClose?: () => void;
}

const BikeTourPlanSelector: React.FC<BikeTourPlanSelectorProps> = ({ onPlanSelect, onClose }) => {
  const [plans, setPlans] = useState<BikeTourPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = BikeTourPlanService.subscribeToBikeTourPlans((updatedPlans) => {
      setPlans(updatedPlans);
      setLoading(false);
    });

    // Initialize default plans if collection is empty
    BikeTourPlanService.autoSyncIfEmpty();

    return () => unsubscribe();
  }, []);

  // Filter plans based on selected criteria
  const filteredPlans = plans.filter(plan => {
    const matchesDuration = selectedDuration === 'all' || (() => {
      const duration = parseInt(plan.duration.split(' ')[0]);
      switch (selectedDuration) {
        case '7': return duration === 7;
        case '10': return duration === 10;
        case '15': return duration === 15;
        default: return true;
      }
    })();

    const matchesDifficulty = selectedDifficulty === 'all' || plan.difficulty === selectedDifficulty;

    return matchesDuration && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'moderate': return 'text-yellow-400';
      case 'challenging': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'moderate': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'challenging': return 'bg-red-500/20 text-red-300 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ladakh Bike Tour Plans
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose from our expertly crafted motorcycle adventures through the stunning landscapes of Ladakh
            </p>
          </motion.div>
        </div>

        {/* Filters */}
        <GlassCard className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">Duration:</span>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Durations</option>
                <option value="7">7 Days</option>
                <option value="10">10 Days</option>
                <option value="15">15 Days</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">Difficulty:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="challenging">Challenging</option>
              </select>
            </div>
          </div>
        </GlassCard>

        {/* Plans Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredPlans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <GlassCard className="p-6 h-full flex flex-col hover:bg-white/10 transition-all duration-300 group">
                    {/* Plan Header */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                          {plan.name}
                        </h3>
                        <div className={`px-2 py-1 rounded-full text-xs border ${getDifficultyBadgeColor(plan.difficulty)}`}>
                          {plan.difficulty.toUpperCase()}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm line-clamp-2">{plan.description}</p>
                    </div>

                    {/* Plan Details */}
                    <div className="space-y-3 mb-6 flex-grow">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-5 h-5 text-blue-400" />
                        <span className="text-gray-300">{plan.duration}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <CurrencyRupeeIcon className="w-5 h-5 text-green-400" />
                        <span className="text-gray-300">₹{plan.price.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <StarIcon className={`w-5 h-5 ${getDifficultyColor(plan.difficulty)}`} />
                        <span className="text-gray-300 capitalize">{plan.difficulty} Level</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-5 h-5 text-red-400" />
                        <span className="text-gray-300">{plan.itinerary.length} destinations</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <BikeIcon className="w-5 h-5 text-purple-400" />
                        <span className="text-gray-300">Bike Tour Adventure</span>
                      </div>
                    </div>

                    {/* Highlights */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-white mb-2">Key Highlights:</h4>
                      <ul className="space-y-1">
                        {plan.highlights.slice(0, 3).map((highlight, idx) => (
                          <li key={idx} className="text-xs text-gray-300 flex items-center gap-1">
                            <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                            {highlight}
                          </li>
                        ))}
                        {plan.highlights.length > 3 && (
                          <li className="text-xs text-gray-400">
                            +{plan.highlights.length - 3} more highlights
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => onPlanSelect(plan)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300"
                    >
                      Select This Plan
                    </Button>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {filteredPlans.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <h3 className="text-2xl text-white mb-4">No plans match your criteria</h3>
            <p className="text-gray-300 mb-6">Try adjusting your filters to see more options</p>
            <Button
              onClick={() => {
                setSelectedDuration('all');
                setSelectedDifficulty('all');
              }}
              variant="secondary"
            >
              Clear Filters
            </Button>
          </motion.div>
        )}

        {/* Close Button */}
        {onClose && (
          <div className="text-center mt-8">
            <Button onClick={onClose} variant="secondary">
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BikeTourPlanSelector;
