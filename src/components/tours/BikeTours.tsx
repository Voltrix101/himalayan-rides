import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Star, Users } from 'lucide-react';
import { bikeToursService } from '../../services/bikeToursService';
import { BikeTourPlan } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';

export function BikeTours() {
  const [tours, setTours] = useState<BikeTourPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = bikeToursService.subscribeToBikeTours((tours) => {
      setTours(tours);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleBookTour = (tour: BikeTourPlan) => {
    // You can integrate this with your existing booking modal
    console.log('Booking tour:', tour.title);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">Loading bike tours...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Ladakh Bike Tours
          </h1>
          <p className="text-xl text-white/80">
            Epic motorcycle adventures through the Himalayas
          </p>
        </motion.div>

        {tours.length === 0 ? (
          <div className="text-center text-white/60 py-12">
            <p className="text-lg">No bike tours available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour, index) => (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="h-full overflow-hidden hover:scale-105 transition-transform duration-300">
                  {tour.coverImage && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={tour.coverImage}
                        alt={tour.title}
                        className="w-full h-full object-cover"
                      />
                      {tour.isFeatured && (
                        <div className="absolute top-4 right-4 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-semibold">
                          Featured
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {tour.title}
                    </h3>
                    
                    <p className="text-white/70 text-sm mb-4 line-clamp-3">
                      {tour.description}
                    </p>

                    <div className="flex items-center gap-4 text-white/60 text-sm mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{tour.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>4.8</span>
                      </div>
                    </div>

                    {tour.highlights && tour.highlights.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-white font-semibold text-sm mb-2">Highlights:</h4>
                        <div className="flex flex-wrap gap-1">
                          {tour.highlights.slice(0, 3).map((highlight, i) => (
                            <span
                              key={i}
                              className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs"
                            >
                              {highlight}
                            </span>
                          ))}
                          {tour.highlights.length > 3 && (
                            <span className="text-white/50 text-xs px-2 py-1">
                              +{tour.highlights.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-white">
                        <span className="text-2xl font-bold">₹{tour.price?.toLocaleString()}</span>
                        <span className="text-white/60 text-sm ml-1">per person</span>
                      </div>
                      <Button
                        onClick={() => handleBookTour(tour)}
                        variant="glass"
                        className="flex items-center gap-2"
                      >
                        <Users className="w-4 h-4" />
                        Book Now
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
