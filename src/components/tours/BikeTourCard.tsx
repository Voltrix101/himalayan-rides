import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { BikeTourPlan } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { UniversalBookingModal } from '../booking/UniversalBookingModal';

interface BikeTourCardProps {
  tour: BikeTourPlan;
}

export function BikeTourCard({ tour }: BikeTourCardProps) {
  const [showItinerary, setShowItinerary] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { requireAuth } = useAuth();

  const handleBookTour = () => {
    requireAuth(() => {
      setShowBookingModal(true);
    });
  };

  return (
    <>
      <GlassCard className="overflow-hidden">
        <div className="relative h-48 overflow-hidden">
          <img
            src="https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt={tour.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute top-4 right-4">
            <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1">
              <span className="text-white font-medium">₹{tour.price.toLocaleString()}</span>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-bold text-white mb-2">{tour.title}</h3>
            <div className="flex items-center gap-2 text-white/80">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{tour.duration}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h4 className="text-white font-semibold mb-2">Highlights</h4>
            <div className="flex flex-wrap gap-2">
              {tour.highlights.map((highlight, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80 flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  {highlight}
                </span>
              ))}
            </div>
          </div>

          <Button
            onClick={handleBookTour}
            className="w-full mb-2"
          >
            Book This Tour
          </Button>
          <Button
            variant="glass"
            onClick={() => setShowItinerary(true)}
            className="w-full"
          >
            View Itinerary
          </Button>
        </div>
      </GlassCard>

      {/* Itinerary Modal */}
      <AnimatePresence>
        {showItinerary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={() => setShowItinerary(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-blue-500 text-xl font-bold"
                onClick={() => setShowItinerary(false)}
              >
                ×
              </button>
              <h2 className="text-2xl font-bold text-blue-600 mb-6">Itinerary</h2>
              <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                {tour.itinerary && tour.itinerary.length > 0 ? (
                  tour.itinerary.map((day, idx) => (
                    <div key={idx}>
                      <div className="text-lg font-bold text-blue-600 mb-1">{day.title ? `Day ${day.day}: ${day.title}` : `Day ${day.day}`}</div>
                      <div className="text-gray-700 text-sm whitespace-pre-line">{day.description}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400">No itinerary available.</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <UniversalBookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        item={{
          id: tour.id,
          title: tour.title,
          type: 'tour',
          price: tour.price,
          duration: tour.duration,
          description: `Experience the ultimate motorcycle adventure through the Himalayas with our carefully crafted ${tour.title}.`
        }}
      />
    </>
  );
}