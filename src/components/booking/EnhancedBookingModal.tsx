import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Users, MapPin, CreditCard, Loader2 } from 'lucide-react';
import { OptimizedGlass } from '../ui/OptimizedGlass';
import { Button } from '../ui/Button';
import { razorpayService, BookingData, RazorpayPaymentData } from '../../services/razorpayService';
import { useApp } from '../../context/AppContext';
import { db } from '../../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import toast from 'react-hot-toast';
import UniversalModal from '../ui/UniversalModal';

interface EnhancedBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  experience?: {
    id: string;
    title: string;
    description: string;
    coverImage?: string;
    price?: number;
  };
  onSuccess?: (bookingId: string) => void;
}

export const EnhancedBookingModal: React.FC<EnhancedBookingModalProps> = ({
  isOpen,
  onClose,
  experience,
  onSuccess,
}) => {
  const { state } = useApp();
  const user = state.user;
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successBookingData, setSuccessBookingData] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    participants: 1,
    startDate: '',
    pickupLocation: '',
    specialRequests: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: 'spouse',
    },
  });

  // Calculate total function - moved before useEffect
  const calculateTotal = useCallback(() => {
    const basePrice = experience?.price || 15000;
    return basePrice * formData.participants;
  }, [experience?.price, formData.participants]);

  // Listen to booking status changes
  useEffect(() => {
    if (!bookingId) return;

    const unsubscribe = onSnapshot(
      doc(db, 'bookings', bookingId),
      (doc) => {
        if (doc.exists()) {
          const booking = doc.data();
          if (booking.status === 'confirmed') {
            setProcessingPayment(false);
            
            // Prepare success modal data
            const successData = {
              bookingId: bookingId,
              type: 'experience' as const,
              title: experience?.title || 'Adventure Experience',
              totalAmount: calculateTotal(),
              participants: formData.participants,
              startDate: formData.startDate,
              customerEmail: formData.email,
              customerName: formData.customerName,
            };
            
            setSuccessBookingData(successData);
            setShowSuccessModal(true);
            
            toast.success('🎉 Booking confirmed! Check your email for details.');
            onSuccess?.(bookingId);
            onClose();
          } else if (booking.status === 'failed') {
            setProcessingPayment(false);
            toast.error('Payment failed. Please try again.');
          }
        }
      }
    );

    return () => unsubscribe();
  }, [
    bookingId, 
    onSuccess, 
    onClose, 
    experience?.title, 
    formData.participants, 
    formData.startDate, 
    formData.email, 
    formData.customerName,
    calculateTotal
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'participants' ? parseInt(value) || 1 : value,
      }));
    }
  };

  const handleBookNow = async () => {
    try {
      setLoading(true);

      // Validation
      if (!formData.customerName || !formData.email || !formData.phone || !formData.startDate || !formData.pickupLocation) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (!user) {
        toast.error('Please login to make a booking');
        return;
      }

      const bookingData: BookingData = {
        experienceId: experience?.id,
        experienceTitle: experience?.title || 'Adventure Experience',
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        participants: formData.participants,
        startDate: new Date(formData.startDate),
        totalAmount: calculateTotal(),
        pickupLocation: formData.pickupLocation,
        specialRequests: formData.specialRequests || undefined,
        emergencyContact: formData.emergencyContact.name ? formData.emergencyContact : undefined,
      };

      // Create Razorpay order
      const orderData = await razorpayService.createOrder(bookingData, user.id);
      
      // Store booking ID for status monitoring
      setBookingId(orderData.orderId);
      
      // Open Razorpay checkout
      setProcessingPayment(true);
      
      await razorpayService.openCheckout(
        orderData,
        bookingData,
        (paymentResponse: RazorpayPaymentData) => {
          console.log('Payment successful, waiting for confirmation...', paymentResponse);
          toast.loading('Processing payment...', { duration: 5000 });
        },
        (error: any) => {
          console.error('Payment failed:', error);
          setProcessingPayment(false);
          toast.error('Payment was cancelled or failed');
        }
      );

    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget && !processingPayment) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <OptimizedGlass intensity="heavy" className="bg-white/10 border border-white/20 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Book Your Adventure
              </h2>
              {!processingPayment && (
                <button
                  onClick={onClose}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              )}
            </div>

            {processingPayment && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
                <p className="text-white/80">Processing your payment...</p>
                <p className="text-sm text-white/60 mt-2">Please don't close this window</p>
              </div>
            )}

            {!processingPayment && (
              <>
                {/* Experience Summary */}
                {experience && (
                  <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-4">
                      {experience.coverImage && (
                        <img
                          src={experience.coverImage}
                          alt={experience.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-white">{experience.title}</h3>
                        <p className="text-white/60 text-sm">{experience.description}</p>
                        <p className="text-orange-400 font-semibold mt-1">
                          ₹{(experience.price || 15000).toLocaleString()} per person
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <form className="space-y-4">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        <Users className="inline w-4 h-4 mr-2" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-orange-400 focus:outline-none"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-orange-400 focus:outline-none"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-orange-400 focus:outline-none"
                        placeholder="+91 9876543210"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        <Users className="inline w-4 h-4 mr-2" />
                        Participants *
                      </label>
                      <select
                        name="participants"
                        value={formData.participants}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-orange-400 focus:outline-none"
                        required
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                          <option key={num} value={num} className="bg-gray-800">
                            {num} {num === 1 ? 'Person' : 'People'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        <Calendar className="inline w-4 h-4 mr-2" />
                        Start Date *
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-orange-400 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        <MapPin className="inline w-4 h-4 mr-2" />
                        Pickup Location *
                      </label>
                      <input
                        type="text"
                        name="pickupLocation"
                        value={formData.pickupLocation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-orange-400 focus:outline-none"
                        placeholder="Leh, Manali, Delhi, etc."
                        required
                      />
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Emergency Contact (Optional)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Contact Name
                        </label>
                        <input
                          type="text"
                          name="emergencyContact.name"
                          value={formData.emergencyContact.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-orange-400 focus:outline-none"
                          placeholder="Emergency contact name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="emergencyContact.phone"
                          value={formData.emergencyContact.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-orange-400 focus:outline-none"
                          placeholder="+91 9876543210"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Relationship
                        </label>
                        <select
                          name="emergencyContact.relationship"
                          value={formData.emergencyContact.relationship}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-orange-400 focus:outline-none"
                        >
                          <option value="spouse" className="bg-gray-800">Spouse</option>
                          <option value="parent" className="bg-gray-800">Parent</option>
                          <option value="sibling" className="bg-gray-800">Sibling</option>
                          <option value="friend" className="bg-gray-800">Friend</option>
                          <option value="other" className="bg-gray-800">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-orange-400 focus:outline-none resize-none"
                      placeholder="Any dietary restrictions, accessibility needs, or special occasions?"
                    />
                  </div>

                  {/* Price Summary */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/80">Price per person:</span>
                      <span className="text-white">₹{(experience?.price || 15000).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/80">Participants:</span>
                      <span className="text-white">{formData.participants}</span>
                    </div>
                    <hr className="border-white/20 my-3" />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-white">Total Amount:</span>
                      <span className="text-xl font-bold text-orange-400">
                        ₹{calculateTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Book Now Button */}
                  <Button
                    onClick={handleBookNow}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Creating Order...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Pay ₹{calculateTotal().toLocaleString()} & Book Now
                      </>
                    )}
                  </Button>
                </form>

                <p className="text-xs text-white/60 text-center mt-4">
                  Your payment is secured by Razorpay. You'll receive a confirmation email with booking details and trip information.
                </p>
              </>
            )}
          </OptimizedGlass>
        </motion.div>
      </motion.div>
      
      {/* Success Modal */}
      <UniversalModal
        type="success"
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        size="large"
        data={successBookingData}
      />
    </AnimatePresence>
  );
};
