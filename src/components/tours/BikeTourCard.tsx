import React, { useState } from 'react';
import { motion } from 'framer-motion';
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

          <button
            onClick={() => setShowItinerary(!showItinerary)}
            className="flex items-center justify-between w-full text-white/80 hover:text-white transition-colors mb-4"
          >
            <span className="font-medium">View Itinerary</span>
            {showItinerary ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showItinerary && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 space-y-3 max-h-60 overflow-y-auto"
            >
              {tour.itinerary.map((day, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                      {day.day}
                    </div>
                    <h5 className="text-white font-medium text-sm">{day.title}</h5>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed pl-8">
                    {day.description}
                  </p>
                </div>
              ))}
            </motion.div>
          )}

          <Button
            onClick={handleBookTour}
            className="w-full"
          >
            Book This Tour
          </Button>
        </div>
      </GlassCard>

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