import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { regions } from '../../data/mockData';
import { GlassCard } from '../ui/GlassCard';
import { useAppNavigation } from '../../hooks/useAppNavigation';

export function RegionSelector() {
  const { state, dispatch } = useApp();
  const { navigateToExplore } = useAppNavigation();

  const handleRegionSelect = (region: typeof regions[0]) => {
    dispatch({ type: 'SET_REGION', payload: region });
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-6 relative">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Choose Your
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
              Adventure
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Experience the majesty of the Himalayas with our premium vehicle rentals
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {regions.map((region, index) => (
            <motion.div
              key={region.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <GlassCard className="p-8 cursor-pointer group relative overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                  style={{ backgroundImage: `url(${region.image})` }}
                />
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${region.gradient} mb-6 mx-auto flex items-center justify-center`}>
                    <span className="text-2xl font-bold text-white">{region.name[0]}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{region.name}</h3>
                  <p className="text-white/80 mb-6">{region.description}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      handleRegionSelect(region);
                      if (region.id === 'ladakh') {
                        navigateToExplore();
                      }
                    }}
                    className={`w-full py-3 rounded-xl bg-gradient-to-r ${region.gradient} text-white font-medium hover:shadow-lg transition-all duration-300`}
                  >
                    {region.id === 'ladakh' ? 'Explore Ladakh' : `Explore ${region.name}`}
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}