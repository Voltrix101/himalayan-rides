import React, { useState } from 'react';
import { Star, Users, Fuel, Settings } from 'lucide-react';
import { Vehicle } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { UniversalBookingModal } from '../booking/UniversalBookingModal';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { requireAuth } = useAuth();

  const handleRentNow = () => {
    requireAuth(() => {
      setShowBookingModal(true);
    });
  };
  return (
    <>
      <GlassCard className="overflow-hidden">
        <div className="relative h-48 overflow-hidden">
          <img
            src={vehicle.image}
            alt={vehicle.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute top-4 right-4">
            <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-white font-medium">{vehicle.rating}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">{vehicle.name}</h3>
            <span className="text-2xl font-bold text-white">₹{vehicle.price}/day</span>
          </div>

          <div className="flex items-center gap-4 mb-6 text-white/80">
            <div className="flex items-center gap-1">
              <Fuel className="w-4 h-4" />
              <span className="text-sm">{vehicle.fuel}</span>
            </div>
            <div className="flex items-center gap-1">
              <Settings className="w-4 h-4" />
              <span className="text-sm">{vehicle.gearbox}</span>
            </div>
            {vehicle.seats && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span className="text-sm">{vehicle.seats} seats</span>
              </div>
            )}
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {vehicle.features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <Button
            onClick={handleRentNow}
            className="w-full"
            disabled={!vehicle.available}
          >
            {vehicle.available ? 'Rent Now' : 'Not Available'}
          </Button>
        </div>
      </GlassCard>

      <UniversalBookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        item={{
          id: vehicle.id,
          title: vehicle.name,
          type: 'vehicle',
          price: vehicle.price,
          description: `Rent our ${vehicle.name} - ${vehicle.fuel} fuel, ${vehicle.gearbox} transmission. Perfect for your Himalayan adventure.`
        }}
      />
    </>
  );
}