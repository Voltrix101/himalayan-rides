import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Download, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';

export function Dashboard() {
  const { state } = useApp();

  if (!state.user) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-blue-400';
      case 'active': return 'text-green-400';
      case 'completed': return 'text-gray-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-white';
    }
  };

  return (
    <section className="min-h-screen pt-24 px-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Welcome back, {state.user.name}
          </h2>
          <p className="text-white/80 text-lg">
            Manage your bookings and profile
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Profile</h3>
              <div className="space-y-3 text-white/80">
                <div>
                  <span className="font-medium">Email:</span>
                  <p>{state.user.email}</p>
                </div>
                <div>
                  <span className="font-medium">Phone:</span>
                  <p>{state.user.phone}</p>
                </div>
                <div>
                  <span className="font-medium">Region:</span>
                  <p className="capitalize">{state.user.region}</p>
                </div>
              </div>
              <Button variant="glass" size="sm" className="w-full mt-4">
                Edit Profile
              </Button>
            </GlassCard>
          </motion.div>

          {/* Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Your Bookings</h3>
              
              {state.bookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/60">No bookings yet</p>
                  <Button variant="glass" size="sm" className="mt-4">
                    Book Your First Ride
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white/5 rounded-xl p-4 border border-white/10"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h4 className="text-white font-medium">{booking.vehicle.name}</h4>
                            <span className={`text-sm px-2 py-1 rounded-full bg-white/10 ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-white/60 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {booking.startDate.toLocaleDateString()} - {booking.endDate.toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{booking.pickupLocation}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-white font-bold">₹{booking.totalAmount}</p>
                            <p className="text-white/60 text-sm">#{booking.paymentId}</p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}