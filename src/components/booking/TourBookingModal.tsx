import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, CreditCard, Users } from 'lucide-react';
import { BikeTourPlan } from '../../types';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';

interface TourBooking {
  id: string;
  userId: string;
  tourId: string;
  tour: BikeTourPlan;
  startDate: Date;
  participantCount: number;
  contactPerson: {
    name: string;
    email: string;
    phone: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
  };
  totalAmount: number;
  status: 'confirmed' | 'active' | 'completed' | 'cancelled';
  paymentId: string;
  createdAt: Date;
}

interface TourBookingModalProps {
  tour: BikeTourPlan | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TourBookingModal({ tour, isOpen, onClose }: TourBookingModalProps) {
  const { state } = useApp();
  const [bookingData, setBookingData] = useState({
    startDate: '',
    participantCount: 1,
    contactPerson: {
      name: state.user?.name || '',
      email: state.user?.email || '',
      phone: state.user?.phone || '',
    },
    emergencyContact: {
      name: '',
      phone: '',
    }
  });
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!tour) return null;

  const calculateTotal = () => {
    return tour.price * bookingData.participantCount;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setBookingData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setBookingData(prev => ({
        ...prev,
        [name]: name === 'participantCount' ? parseInt(value) || 1 : value
      }));
    }
  };

  const handleBookingSubmit = async () => {
    if (!state.user) return;

    setIsProcessing(true);
    
    try {
      const total = calculateTotal();
      
      const booking: TourBooking = {
        id: Date.now().toString(),
        userId: state.user.id,
        tourId: tour.id,
        tour,
        startDate: new Date(bookingData.startDate),
        participantCount: bookingData.participantCount,
        contactPerson: bookingData.contactPerson,
        emergencyContact: bookingData.emergencyContact,
        totalAmount: total,
        status: 'confirmed',
        paymentId: '',
        createdAt: new Date()
      };

      // For now, we'll use direct Razorpay integration without backend
      // You can implement backend order creation later
      initializeRazorpay(booking, `order_${Date.now()}`);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const initializeRazorpay = (booking: TourBooking, orderId: string) => {
    console.log('Initializing Razorpay with:', {
      amount: booking.totalAmount * 100,
      key: import.meta.env.VITE_RAZORPAY_KEY_ID
    });

    // Razorpay configuration
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_QAjfeo4L3cO7s8',
      amount: booking.totalAmount * 100, // Amount in paise
      currency: 'INR',
      name: 'Himalayan Rides',
      description: `${tour.title} - ${tour.duration}`,
      image: 'https://avatars.githubusercontent.com/u/7713209?s=280&v=4', // Razorpay logo or your logo
      order_id: orderId, // Order ID from backend or generated
      handler: async function (response: any) {
        try {
          console.log('Payment successful:', response);
          
          // For now, we'll just log the success and show confirmation
          // In production, you should verify this on your backend
          alert(`🎉 Payment Successful!\n\nPayment ID: ${response.razorpay_payment_id}\nBooking confirmed for ${tour.title}`);
          
          onClose();
          setStep(1);
          
        } catch (error) {
          console.error('Payment processing error:', error);
          alert('Payment successful but booking processing failed. Please contact support.');
        }
      },
      prefill: {
        name: bookingData.contactPerson.name,
        email: bookingData.contactPerson.email,
        contact: bookingData.contactPerson.phone
      },
      notes: {
        tour_id: tour.id,
        tour_name: tour.title,
        participants: bookingData.participantCount.toString()
      },
      theme: {
        color: '#3B82F6'
      },
      modal: {
        ondismiss: function() {
          console.log('Razorpay modal dismissed');
        }
      }
    };

    console.log('Razorpay window object:', (window as any).Razorpay);
    console.log('Razorpay key being used:', import.meta.env.VITE_RAZORPAY_KEY_ID);
    
    // Check if Razorpay is loaded
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      console.log('Razorpay is loaded, creating instance...');
      const razorpay = new (window as any).Razorpay(options);
      console.log('Opening Razorpay checkout...');
      razorpay.open();
    } else {
      console.log('Razorpay not loaded, loading script...');
      // Load Razorpay script if not already loaded
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        alert('Failed to load Razorpay. Please check your internet connection and try again.');
      };
      document.head.appendChild(script);
    }
  };

  const handleModalClick = (e: React.MouseEvent) => {
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
          onClick={onClose}
        >
          <div className="flex items-center justify-center min-h-full w-full">
            <GlassCard 
              className="w-full max-w-2xl my-8 relative"
              hover={false}
              onClick={handleModalClick}
            >
            <div className="p-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/60 hover:text-white z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Book {tour.title}</h2>
                <div className="flex items-center gap-4 text-white/80">
                  <span>₹{tour.price.toLocaleString()}/person</span>
                  <span>•</span>
                  <span>{tour.duration}</span>
                  <span>•</span>
                  <span>{tour.highlights.length} destinations</span>
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
                        Tour Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={bookingData.startDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Number of Participants
                      </label>
                      <select
                        name="participantCount"
                        value={bookingData.participantCount}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                        required
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Person' : 'People'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-xl p-4">
                    <h3 className="text-white font-bold mb-3">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 mb-2">Full Name</label>
                        <input
                          type="text"
                          name="contactPerson.name"
                          value={bookingData.contactPerson.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          name="contactPerson.phone"
                          value={bookingData.contactPerson.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-white/80 mb-2">Email Address</label>
                        <input
                          type="email"
                          name="contactPerson.email"
                          value={bookingData.contactPerson.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-xl p-4">
                    <h3 className="text-white font-bold mb-3">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 mb-2">Emergency Contact Name</label>
                        <input
                          type="text"
                          name="emergencyContact.name"
                          value={bookingData.emergencyContact.name}
                          onChange={handleInputChange}
                          placeholder="Emergency contact full name"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 mb-2">Emergency Contact Phone</label>
                        <input
                          type="tel"
                          name="emergencyContact.phone"
                          value={bookingData.emergencyContact.phone}
                          onChange={handleInputChange}
                          placeholder="Emergency contact phone"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {calculateTotal() > 0 && (
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="flex justify-between items-center text-white">
                        <span>Total Amount ({bookingData.participantCount} {bookingData.participantCount === 1 ? 'person' : 'people'}):</span>
                        <span className="text-2xl font-bold">₹{calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => setStep(2)}
                    className="w-full"
                    disabled={!bookingData.startDate || !bookingData.contactPerson.name || !bookingData.contactPerson.phone || !bookingData.contactPerson.email || !bookingData.emergencyContact.name || !bookingData.emergencyContact.phone}
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
                        <span>Tour:</span>
                        <span className="text-white">{tour.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="text-white">{tour.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Start Date:</span>
                        <span className="text-white">{new Date(bookingData.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Participants:</span>
                        <span className="text-white">{bookingData.participantCount} {bookingData.participantCount === 1 ? 'person' : 'people'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rate per person:</span>
                        <span className="text-white">₹{tour.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Contact Person:</span>
                        <span className="text-white">{bookingData.contactPerson.name}</span>
                      </div>
                      <hr className="border-white/20" />
                      <div className="flex justify-between text-white font-bold text-lg">
                        <span>Total Amount:</span>
                        <span>₹{calculateTotal().toLocaleString()}</span>
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

                  <div className="bg-blue-500/20 rounded-xl p-4">
                    <h4 className="text-white font-semibold mb-2">Important Notes:</h4>
                    <ul className="text-white/80 text-sm space-y-1">
                      <li>• Full payment required to confirm booking</li>
                      <li>• Cancellation policy: 48 hours before tour start</li>
                      <li>• All participants must have valid ID proof</li>
                      <li>• Emergency contact will be notified of tour details</li>
                    </ul>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button 
                      onClick={handleBookingSubmit} 
                      className="flex-1"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : `Pay ₹${calculateTotal().toLocaleString()}`}
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
