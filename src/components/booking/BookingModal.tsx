import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, CreditCard } from 'lucide-react';
import { Vehicle, Booking } from '../../types';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';

interface BookingModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ vehicle, isOpen, onClose }: BookingModalProps) {
  const { state, dispatch } = useApp();
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    pickupLocation: '',
    dropLocation: ''
  });
  const [step, setStep] = useState(1);

  if (!vehicle) return null;

  const calculateTotal = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days * vehicle.price;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBookingData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleBookingSubmit = () => {
    if (!state.user) return;

    const total = calculateTotal();
    const booking: Booking = {
      id: Date.now().toString(),
      userId: state.user.id,
      vehicleId: vehicle.id,
      vehicle,
      startDate: new Date(bookingData.startDate),
      endDate: new Date(bookingData.endDate),
      pickupLocation: bookingData.pickupLocation,
      dropLocation: bookingData.dropLocation,
      totalAmount: total,
      status: 'confirmed',
      paymentId: `razorpay_${Date.now()}`,
      createdAt: new Date()
    };

    dispatch({ type: 'ADD_BOOKING', payload: booking });
    alert('Booking confirmed! Payment successful.');
    onClose();
    setStep(1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <div className="flex items-center justify-center min-h-full w-full">
            <GlassCard 
              className="w-full max-w-2xl my-8 relative"
              hover={false}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
            <div className="p-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/60 hover:text-white z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Book {vehicle.name}</h2>
                <div className="flex items-center gap-4 text-white/80">
                  <span>₹{vehicle.price}/day</span>
                  <span>•</span>
                  <span>{vehicle.fuel}</span>
                  <span>•</span>
                  <span>{vehicle.gearbox}</span>
                </div>
              </div>

              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={bookingData.startDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={bookingData.endDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Pickup Location
                    </label>
                    <input
                      type="text"
                      name="pickupLocation"
                      value={bookingData.pickupLocation}
                      onChange={handleInputChange}
                      placeholder="Enter pickup location"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Drop Location
                    </label>
                    <input
                      type="text"
                      name="dropLocation"
                      value={bookingData.dropLocation}
                      onChange={handleInputChange}
                      placeholder="Enter drop location"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                      required
                    />
                  </div>

                  {calculateTotal() > 0 && (
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="flex justify-between items-center text-white">
                        <span>Total Amount:</span>
                        <span className="text-2xl font-bold">₹{calculateTotal()}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => setStep(2)}
                    className="w-full"
                    disabled={!bookingData.startDate || !bookingData.endDate || !bookingData.pickupLocation || !bookingData.dropLocation}
                  >
                    Continue to Payment
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-white/10 rounded-xl p-6">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Payment Summary
                    </h3>
                    
                    <div className="space-y-2 text-white/80">
                      <div className="flex justify-between">
                        <span>Vehicle:</span>
                        <span>{vehicle.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{Math.ceil((new Date(bookingData.endDate).getTime() - new Date(bookingData.startDate).getTime()) / (1000 * 60 * 60 * 24))} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rate:</span>
                        <span>₹{vehicle.price}/day</span>
                      </div>
                      <hr className="border-white/20" />
                      <div className="flex justify-between text-white font-bold text-lg">
                        <span>Total:</span>
                        <span>₹{calculateTotal()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-6 rounded-xl text-white">
                    <h4 className="font-bold mb-2">Razorpay Payment Gateway</h4>
                    <p className="text-sm opacity-90 mb-4">
                      Secure payment powered by Razorpay. Your payment information is encrypted and secure.
                    </p>
                    <div className="text-xs opacity-75">
                      Test Mode: Use any UPI ID or card 4111 1111 1111 1111
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handleBookingSubmit} className="flex-1">
                      Pay ₹{calculateTotal()}
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </GlassCard>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}