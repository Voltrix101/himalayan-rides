import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Vehicle } from '../../types';
import { VehicleCard } from './VehicleCard';
import { Button } from '../ui/Button';

interface FleetViewProps {
  onVehicleSelect?: (vehicle: Vehicle) => void;
}

export function FleetView({ onVehicleSelect }: FleetViewProps) {
  const { state } = useApp();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter vehicles by region first, then by type and search
  const regionVehicles = state.vehicles.filter(vehicle => 
    vehicle.region === state.selectedRegion.id || vehicle.region === state.selectedRegion.name
  );

  // If no vehicles match the region, show all vehicles
  const vehiclesToFilter = regionVehicles.length > 0 ? regionVehicles : state.vehicles;

  const filteredVehicles = vehiclesToFilter.filter(vehicle => {
    const matchesType = filterType === 'all' || vehicle.type === filterType;
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch && vehicle.available;
  });

  return (
    <section className="min-h-screen pt-24 px-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {state.selectedRegion.name} Fleet
          </h2>
          <p className="text-white/80 text-lg">
            Premium vehicles for your Himalayan adventure
          </p>
          {regionVehicles.length === 0 && state.vehicles.length > 0 && (
            <p className="text-yellow-400 text-sm mt-2">
              No vehicles found for {state.selectedRegion.name}. Showing all available vehicles.
            </p>
          )}
        </motion.div>

        {/* Loading State */}
        {state.vehicles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <p className="text-white/60 text-lg">Loading vehicles...</p>
            <p className="text-white/40 text-sm mt-2">
              If this takes too long, Firebase may need to be configured
            </p>
            <div className="mt-4 p-4 bg-white/10 rounded-lg backdrop-blur-md">
              <p className="text-white/80 text-sm">
                <strong>Admin:</strong> Please set up Firebase Authentication and Firestore
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between"
            >
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                />
              </div>

              <div className="flex gap-2">
                {['all', 'bike', 'car', 'suv'].map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? 'primary' : 'glass'}
                    size="sm"
                    onClick={() => setFilterType(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </motion.div>

            {/* Vehicle Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredVehicles.map((vehicle, index) => (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <VehicleCard vehicle={vehicle} />
                </motion.div>
              ))}
            </motion.div>

            {filteredVehicles.length === 0 && state.vehicles.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <p className="text-white/60 text-lg">No vehicles found matching your criteria</p>
                <p className="text-white/40 text-sm mt-2">
                  Try adjusting your search or filters
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
}