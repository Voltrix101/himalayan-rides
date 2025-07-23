import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, CreditCard, Users, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';

interface Experience {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  price: number;
  rating: number;
  category: 'Adventure' | 'Cultural' | 'Spiritual' | 'Photography';
}

interface ExperienceBookingModalProps {
  experience: Experience | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExperienceBookingModal({ experience, isOpen, onClose }: ExperienceBookingModalProps) {
  const { state, dispatch } = useApp();
  const [bookingData, setBookingData] = useState({
    startDate: '',
    participants: 1,
    specialRequests: '',
    contactNumber: state.user?.phone || ''
  });
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  if (!experience) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setBookingData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const calculateTotal = () => {
    return experience.price * bookingData.participants;
  };

  const handleBookingSubmit = async () => {
    if (!state.user) return;

    setIsLoading(true);
    
    try {
      // Simulate booking process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const booking = {
        id: Date.now().toString(),
        userId: state.user.id,
        experienceId: experience.id,
        experience,
        startDate: new Date(bookingData.startDate),
        participants: bookingData.participants,
        totalAmount: calculateTotal(),
        status: 'confirmed' as const,
        paymentId: `exp_${Date.now()}`,
        createdAt: new Date(),
        specialRequests: bookingData.specialRequests,
        contactNumber: bookingData.contactNumber
      };

      // Add to bookings (you can extend the context to handle experience bookings)
      console.log('Experience booked:', booking);
      
      alert('Experience booked successfully! You will receive a confirmation email shortly.');
      onClose();
      setStep(1);
      setBookingData({
        startDate: '',
        participants: 1,
        specialRequests: '',
        contactNumber: state.user?.phone || ''
      });
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop (not the modal content)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    // Prevent modal from closing when clicking inside the content
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
          onClick={handleModalClick}
        >
          <div className="flex items-center justify-center min-h-full w-full">
            <GlassCard 
              className="w-full max-w-2xl my-8 relative"
              hover={false}
              onClick={handleContentClick}
            >
            <div className="p-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/60 hover:text-white z-10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Book {experience.title}</h2>
                <div className="flex items-center gap-4 text-white/80">
                  <span>₹{experience.price.toLocaleString()}/person</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {experience.duration}
                  </span>
                  <span>•</span>
                  <span>{experience.category}</span>
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
                        Preferred Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={bookingData.startDate}
                        onChange={handleInputChange}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Number of Participants
                      </label>
                      <input
                        type="number"
                        name="participants"
                        value={bookingData.participants}
                        onChange={handleInputChange}
                        onClick={(e) => e.stopPropagation()}
                        min="1"
                        max="10"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white mb-2">Contact Number</label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={bookingData.contactNumber}
                      onChange={handleInputChange}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Enter your contact number"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">Special Requests (Optional)</label>
                    <textarea
                      name="specialRequests"
                      value={bookingData.specialRequests}
                      onChange={handleInputChange}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Any special requirements or requests..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 resize-none transition-colors"
                    />
                  </div>

                  {bookingData.participants > 0 && (
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="space-y-2 text-white">
                        <div className="flex justify-between">
                          <span>Price per person:</span>
                          <span>₹{experience.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Participants:</span>
                          <span>{bookingData.participants}</span>
                        </div>
                        <hr className="border-white/20" />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total Amount:</span>
                          <span>₹{calculateTotal().toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => setStep(2)}
                    className="w-full"
                    disabled={!bookingData.startDate || !bookingData.contactNumber || bookingData.participants < 1}
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
                      Booking Summary
                    </h3>
                    
                    <div className="space-y-3 text-white/80">
                      <div className="flex justify-between">
                        <span>Experience:</span>
                        <span className="text-white font-medium">{experience.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{new Date(bookingData.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{experience.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Participants:</span>
                        <span>{bookingData.participants}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Contact:</span>
                        <span>{bookingData.contactNumber}</span>
                      </div>
                      {bookingData.specialRequests && (
                        <div className="flex justify-between">
                          <span>Special Requests:</span>
                          <span className="text-right max-w-xs">{bookingData.specialRequests}</span>
                        </div>
                      )}
                      <hr className="border-white/20" />
                      <div className="flex justify-between text-white font-bold text-lg">
                        <span>Total Amount:</span>
                        <span>₹{calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-6 rounded-xl text-white">
                    <h4 className="font-bold mb-2">Secure Payment</h4>
                    <p className="text-sm opacity-90 mb-4">
                      Your payment is processed securely. You will receive a confirmation email after successful payment.
                    </p>
                    <div className="text-xs opacity-75">
                      Test Mode: Payment will be simulated for demo purposes
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      variant="secondary" 
                      onClick={() => setStep(1)} 
                      className="flex-1"
                      disabled={isLoading}
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleBookingSubmit} 
                      className="flex-1"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : `Pay ₹${calculateTotal().toLocaleString()}`}
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