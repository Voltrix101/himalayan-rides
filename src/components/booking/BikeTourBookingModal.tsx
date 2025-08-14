import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Mountain, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
 import { razorpayService, type BookingData, type RazorpayPaymentData } from '../../services/razorpayService';
import { processPayment } from '../../services/vercelApiService';
import UniversalModal from '../ui/UniversalModal';

interface LocalBikeTour {
  id: string;
  name: string;
  description: string;
  image: string;
  duration: string;
  distance: string;
  difficulty: 'Intermediate' | 'Advanced' | 'Expert';
  price: number;
  rating: number;
  highlights: string[];
  includes: string[];
  route: string;
  itinerary?: {
    day: number;
    title: string;
    description: string;
    activities?: string[];
    accommodation?: string;
    distance?: string;
    altitude?: string;
  }[];
}

interface BikeTourBookingModalProps {
  bikeTour: LocalBikeTour | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BikeTourBookingModal({ bikeTour, isOpen, onClose }: BikeTourBookingModalProps) {
  const { state } = useApp();
  const modalRef = useRef<HTMLDivElement>(null);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    participants: 1,
    bikePreference: 'Royal Enfield 350',
    specialRequests: '',
    contactNumber: state.user?.phone || '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    // Additional participants details (simplified - no ID required)
    additionalParticipants: [] as {
      name: string;
      phone: string;
      age: string;
    }[]
  });
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successBookingData, setSuccessBookingData] = useState<any>(null);

  // Add ESC key support and body scroll prevention
  React.useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPaymentStatus('idle');
      setPaymentError(null);
      setBookingData(prev => ({
        ...prev,
        startDate: '',
        participants: 1,
        bikePreference: 'Royal Enfield 350',
        specialRequests: '',
        contactNumber: state.user?.phone || '',
        emergencyContact: {
          name: '',
          phone: '',
          relationship: ''
        },
        additionalParticipants: []
      }));
    }
  }, [isOpen, state.user?.phone]);

  if (!bikeTour) return null;

  // Handle participant count changes
  const handleParticipantChange = (newCount: number) => {
    setBookingData(prev => {
      const currentCount = prev.additionalParticipants.length;
      let newAdditionalParticipants = [...prev.additionalParticipants];

      if (newCount > currentCount + 1) {
        // Add new participants
        for (let i = currentCount + 1; i < newCount; i++) {
          newAdditionalParticipants.push({
            name: '',
            phone: '',
            age: ''
          });
        }
      } else if (newCount < currentCount + 1) {
        // Remove participants
        newAdditionalParticipants = newAdditionalParticipants.slice(0, newCount - 1);
      }

      return {
        ...prev,
        participants: newCount,
        additionalParticipants: newAdditionalParticipants
      };
    });
  };

  // Update additional participant details
  const updateAdditionalParticipant = (index: number, field: string, value: string) => {
    setBookingData(prev => ({
      ...prev,
      additionalParticipants: prev.additionalParticipants.map((participant, i) => 
        i === index ? { ...participant, [field]: value } : participant
      )
    }));
  };

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        const additionalParticipantsValid = bookingData.additionalParticipants.every(p => 
          p.name.trim() && p.phone.trim() && p.age.trim()
        );
        return Boolean(
          bookingData.startDate && 
          bookingData.participants > 0 && 
          bookingData.contactNumber &&
          bookingData.emergencyContact.name &&
          bookingData.emergencyContact.phone &&
          (bookingData.participants === 1 || additionalParticipantsValid)
        );
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 2));
    }
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const calculateTotal = () => {
    return bikeTour.price * bookingData.participants;
  };

  const handlePayment = async () => {
    if (!state.user) {
      alert('Please login to continue');
      return;
    }

    setIsLoading(true);
    setPaymentStatus('processing');

    try {
      const totalAmount = calculateTotal();
      
      const bookingPayload: BookingData = {
        experienceId: bikeTour.id,
        experienceTitle: bikeTour.name,
        customerName: state.user.name || state.user.email || 'Customer',
        email: state.user.email || '',
        phone: bookingData.contactNumber,
        participants: bookingData.participants,
        startDate: new Date(bookingData.startDate),
        totalAmount: totalAmount,
        pickupLocation: 'As per tour route',
        specialRequests: `Bike preference: ${bookingData.bikePreference}. ${bookingData.specialRequests}`,
        emergencyContact: bookingData.emergencyContact.name ? bookingData.emergencyContact : undefined,
      };

      // Use processPayment from Vercel API service
      console.log('Starting payment process with Vercel API...');
      const result = await processPayment(bookingPayload, state.user.id);
      
      // Payment successful
      setPaymentStatus('success');
      setIsLoading(false);
      
      // Prepare success modal data
      const successData = {
        bookingId: result.bookingId,
        type: 'tour' as const,
        title: bikeTour.name,
        totalAmount: totalAmount,
        participants: bookingData.participants,
        startDate: bookingData.startDate,
        customerEmail: state.user?.email || '',
        customerName: state.user?.name || state.user?.email || 'Customer',
        paymentId: result.paymentId,
        orderId: result.orderId,
      };
      
      setSuccessBookingData(successData);
      setShowSuccessModal(true);
      
      console.log('Payment successful! Booking data:', successData);
      
      // Close booking modal after longer delay to allow success modal to show
      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Payment failed:', error);
      setPaymentStatus('error');
      setPaymentError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Tour Details</h3>
              <p className="text-gray-300">Please provide your tour preferences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white text-sm font-bold mb-2">Start Date</label>
                <input
                  type="date"
                  value={bookingData.startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm font-bold mb-2">Number of Participants</label>
                <select
                  value={bookingData.participants}
                  onChange={(e) => handleParticipantChange(parseInt(e.target.value))}
                  className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm"
                  required
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num} className="bg-gray-800 text-white">{num} {num === 1 ? 'Person' : 'People'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white text-sm font-bold mb-2">Bike Preference</label>
                <select
                  value={bookingData.bikePreference}
                  onChange={(e) => setBookingData(prev => ({ ...prev, bikePreference: e.target.value }))}
                  className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm"
                >
                  <option value="Royal Enfield 350" className="bg-gray-800 text-white">Royal Enfield 350</option>
                  <option value="Royal Enfield 500" className="bg-gray-800 text-white">Royal Enfield 500</option>
                  <option value="Royal Enfield Himalayan" className="bg-gray-800 text-white">Royal Enfield Himalayan</option>
                  <option value="KTM Adventure" className="bg-gray-800 text-white">KTM Adventure</option>
                </select>
              </div>

              <div>
                <label className="block text-white text-sm font-bold mb-2">Contact Number</label>
                <input
                  type="tel"
                  value={bookingData.contactNumber}
                  onChange={(e) => setBookingData(prev => ({ ...prev, contactNumber: e.target.value }))}
                  className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white text-sm font-bold mb-2">Special Requests (Optional)</label>
              <textarea
                value={bookingData.specialRequests}
                onChange={(e) => setBookingData(prev => ({ ...prev, specialRequests: e.target.value }))}
                className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm"
                rows={3}
                placeholder="Any special requirements or dietary restrictions..."
              />
            </div>

            {/* Additional Participants Details */}
            {bookingData.participants > 1 && (
              <div className="mt-6 space-y-4">
                <h4 className="text-lg font-bold text-white mb-4">Additional Participants Details</h4>
                {bookingData.additionalParticipants.map((participant, index) => (
                  <div key={index} className="bg-white/5 border border-white/20 rounded-lg p-4 space-y-4">
                    <h5 className="text-md font-semibold text-orange-400">Participant {index + 2}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white text-sm font-bold mb-2">Full Name</label>
                        <input
                          type="text"
                          value={participant.name}
                          onChange={(e) => updateAdditionalParticipant(index, 'name', e.target.value)}
                          className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm"
                          placeholder="Enter full name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white text-sm font-bold mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={participant.phone}
                          onChange={(e) => updateAdditionalParticipant(index, 'phone', e.target.value)}
                          className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm"
                          placeholder="Enter phone number"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white text-sm font-bold mb-2">Age</label>
                        <input
                          type="number"
                          value={participant.age}
                          onChange={(e) => updateAdditionalParticipant(index, 'age', e.target.value)}
                          className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm"
                          placeholder="Enter age"
                          min="18"
                          max="80"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Emergency Contact Section */}
            <div className="mt-6 space-y-4">
              <h4 className="text-lg font-bold text-white mb-4">Emergency Contact</h4>
              <div className="bg-white/5 border border-white/20 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-bold mb-2">Emergency Contact Name</label>
                    <input
                      type="text"
                      value={bookingData.emergencyContact.name}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                      }))}
                      className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm"
                      placeholder="Emergency contact full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-bold mb-2">Emergency Contact Phone</label>
                    <input
                      type="tel"
                      value={bookingData.emergencyContact.phone}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                      }))}
                      className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm"
                      placeholder="Emergency contact phone number"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-bold mb-2">Relationship</label>
                    <select
                      value={bookingData.emergencyContact.relationship}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                      }))}
                      className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm"
                      required
                    >
                      <option value="" className="bg-gray-800 text-white">Select relationship</option>
                      <option value="spouse" className="bg-gray-800 text-white">Spouse</option>
                      <option value="parent" className="bg-gray-800 text-white">Parent</option>
                      <option value="sibling" className="bg-gray-800 text-white">Sibling</option>
                      <option value="friend" className="bg-gray-800 text-white">Friend</option>
                      <option value="other" className="bg-gray-800 text-white">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Booking Summary</h3>
              <p className="text-gray-300">Review your booking details before payment</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Tour:</span>
                <span className="text-white font-bold">{bikeTour.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Date:</span>
                <span className="text-white">{new Date(bookingData.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Participants:</span>
                <span className="text-white">{bookingData.participants}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Bike:</span>
                <span className="text-white">{bookingData.bikePreference}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Contact:</span>
                <span className="text-white">{bookingData.contactNumber}</span>
              </div>
              <div className="border-t border-white/30 pt-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-white font-bold">Total Amount:</span>
                  <span className="text-orange-400 font-bold text-xl">₹{calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>

            {paymentStatus === 'error' && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-red-400 font-medium">Payment Failed</p>
                  <p className="text-red-300 text-sm">{paymentError}</p>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="relative p-6 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <Mountain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Book Your Adventure</h2>
                      <p className="text-gray-300 text-sm">{bikeTour.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-300">Step {step} of 2</span>
                    <span className="text-sm text-gray-400">{Math.round((step / 2) * 100)}% Complete</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(step / 2) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {renderStep()}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/20 bg-black/20 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <div className="flex space-x-3">
                    {step > 1 && (
                      <Button
                        onClick={handlePrevStep}
                        className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 border border-white/30"
                      >
                        Previous
                      </Button>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    {step < 2 ? (
                      <Button
                        onClick={handleNextStep}
                        disabled={!validateStep(step)}
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next - Review & Pay
                      </Button>
                    ) : (
                      <Button
                        onClick={handlePayment}
                        disabled={isLoading || paymentStatus === 'processing'}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            <span>Pay ₹{calculateTotal().toLocaleString()}</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <UniversalModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="success"
        data={successBookingData}
      />
    </>
  );
}
