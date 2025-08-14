import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, CreditCard, Users, Clock, MapPin, Star, Camera, Mountain, CheckCircle, AlertCircle, FileText, Upload, User, Phone, Hash } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Experience } from '../../services/adminFirebaseService';
import { razorpayService, type BookingData, type RazorpayPaymentData } from '../../services/razorpayService';
import UniversalModal from '../ui/UniversalModal';

interface ExperienceBookingModalProps {
  experience: Experience | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExperienceBookingModal({ experience, isOpen, onClose }: ExperienceBookingModalProps) {
  const { state } = useApp();
  const modalRef = useRef<HTMLDivElement>(null);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    participants: 1,
    specialRequests: '',
    contactNumber: state.user?.phone || '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    // ID Verification fields (main booker only)
    idType: 'passport' as 'passport' | 'aadhar' | 'driving_license',
    idNumber: '',
    idFile: null as File | null,
    // Additional participants details
    additionalParticipants: [] as {
      name: string;
      phone: string;
      age: string;
      idNumber: string;
    }[]
  });
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successBookingData, setSuccessBookingData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 5;

  // Handle participant count changes and manage additional participants
  const handleParticipantChange = (newCount: number) => {
    const additionalNeeded = Math.max(0, newCount - 1); // Subtract 1 for the main booker
    
    setBookingData(prev => {
      const newAdditionalParticipants = [...prev.additionalParticipants];
      
      if (additionalNeeded > newAdditionalParticipants.length) {
        // Add new participants
        for (let i = newAdditionalParticipants.length; i < additionalNeeded; i++) {
          newAdditionalParticipants.push({
            name: '',
            phone: '',
            age: '',
            idNumber: ''
          });
        }
      } else if (additionalNeeded < newAdditionalParticipants.length) {
        // Remove excess participants
        newAdditionalParticipants.splice(additionalNeeded);
      }
      
      return {
        ...prev,
        participants: newCount,
        additionalParticipants: newAdditionalParticipants
      };
    });
  };

  // Update specific additional participant details
  const updateAdditionalParticipant = (index: number, field: string, value: string) => {
    setBookingData(prev => {
      const newAdditionalParticipants = [...prev.additionalParticipants];
      if (newAdditionalParticipants[index]) {
        newAdditionalParticipants[index] = {
          ...newAdditionalParticipants[index],
          [field]: value
        };
      }
      return {
        ...prev,
        additionalParticipants: newAdditionalParticipants
      };
    });
  };

  // Add ESC key support and body scroll prevention
  React.useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      // Only close if clicking on the backdrop (modal overlay), not on any child elements
      if (event.target === modalRef.current) {
        console.log('Click on backdrop detected - closing modal'); // Debug log
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

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
    if (!state.user || !experience) return;

    setIsLoading(true);
    setPaymentStatus('processing');
    setPaymentError(null);
    
    try {
      const bookingPayload: BookingData = {
        experienceId: experience.id,
        experienceTitle: experience.title,
        customerName: state.user.name || state.user.email || 'Customer',
        email: state.user.email || '',
        phone: bookingData.contactNumber,
        participants: bookingData.participants,
        startDate: new Date(bookingData.startDate),
        endDate: experience.duration ? new Date(new Date(bookingData.startDate).getTime() + (parseInt(experience.duration) * 24 * 60 * 60 * 1000)) : undefined,
        totalAmount: calculateTotal(),
        pickupLocation: 'As per experience location',
        specialRequests: bookingData.specialRequests,
        emergencyContact: bookingData.emergencyContact.name ? bookingData.emergencyContact : undefined
      };

      // Create Razorpay order
      const orderData = await razorpayService.createOrder(bookingPayload, state.user.id);

      // Open Razorpay checkout
      await razorpayService.openCheckout(
        orderData,
        bookingPayload,
        async (paymentData: RazorpayPaymentData) => {
          // Payment successful
          setPaymentStatus('success');
          setIsLoading(false);
          
          // Prepare success modal data
          const successData = {
            bookingId: paymentData.razorpay_order_id,
            type: 'experience' as const,
            title: experience.title,
            totalAmount: calculateTotal(),
            participants: bookingData.participants,
            startDate: bookingData.startDate,
            customerEmail: state.user?.email || '',
            customerName: state.user?.name || state.user?.email || 'Customer',
          };
          
          setSuccessBookingData(successData);
          setShowSuccessModal(true);
          
          console.log('Booking successful - Email functionality temporarily disabled');
          
          // Close booking modal after longer delay to allow success modal to show properly
          setTimeout(() => {
            onClose();
            setStep(1);
            setPaymentStatus('idle');
            setBookingData({
              startDate: '',
              participants: 1,
              specialRequests: '',
              contactNumber: state.user?.phone || '',
              emergencyContact: {
                name: '',
                phone: '',
                relationship: ''
              },
              idType: 'passport',
              idNumber: '',
              idFile: null,
              additionalParticipants: []
            });
          }, 3000);
        },
        (error: any) => {
          // Payment failed
          console.error('Payment failed:', error);
          setPaymentStatus('error');
          setPaymentError(error.description || 'Payment failed. Please try again.');
          setIsLoading(false);
        }
      );
      
    } catch (error) {
      console.error('Booking failed:', error);
      setPaymentStatus('error');
      setPaymentError('Failed to initiate payment. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto scrollbar-hide"
        >
          {/* Modal container */}
          <div className="relative flex items-center justify-center min-h-full w-full p-4">
            <div ref={modalRef}>
              <GlassCard 
                className="w-full max-w-2xl my-4 relative overflow-hidden max-h-[95vh]"
                hover={false}
              >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/60 hover:text-white z-20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Hero Section with Image */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={experience.image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"}
                  alt={experience.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Floating Info Cards */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/20">
                      <div className="flex items-center gap-1 text-white/70 mb-1">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">Duration</span>
                      </div>
                      <div className="text-white text-sm font-semibold">{experience.duration}</div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/20">
                      <div className="flex items-center gap-1 text-white/70 mb-1">
                        <Users className="w-3 h-3" />
                        <span className="text-xs">Group</span>
                      </div>
                      <div className="text-white text-sm font-semibold">1-{experience.maxGroupSize || 8}</div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/20">
                      <div className="flex items-center gap-1 text-white/70 mb-1">
                        <Star className="w-3 h-3" />
                        <span className="text-xs">Rating</span>
                      </div>
                      <div className="text-white text-sm font-semibold">{experience.rating || 4.5}⭐</div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/20">
                      <div className="flex items-center gap-1 text-white/70 mb-1">
                        <MapPin className="w-3 h-3" />
                        <span className="text-xs">Location</span>
                      </div>
                      <div className="text-white text-sm font-semibold truncate">{experience.location}</div>
                    </div>
                  </div>
                </div>

                {/* Price Badge */}
                <div className="absolute top-4 left-4">
                  <div className="bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-md rounded-lg px-3 py-1 border border-purple-400/50">
                    <div className="text-white font-bold">₹{experience.price.toLocaleString()}</div>
                    <div className="text-purple-100 text-xs">per person</div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="max-h-[calc(95vh-12rem)] overflow-y-auto scrollbar-hide">
                <div className="p-6">
                  {/* Title and Description */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">{experience.title}</h2>
                    <p className="text-gray-300 text-sm leading-relaxed">{experience.description}</p>
                    
                    {/* Highlights */}
                    {experience.highlights && experience.highlights.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <Camera className="w-4 h-4 text-purple-400" />
                          Experience Highlights
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                          {experience.highlights.slice(0, 4).map((highlight, idx) => (
                            <div key={idx} className="text-white/80 text-xs flex items-center gap-1">
                              <Mountain className="w-3 h-3 text-purple-400 flex-shrink-0" />
                              {highlight}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                {/* Booking Form */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="text-xl font-bold text-white mb-4">Book Your Experience</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white mb-2 flex items-center gap-2 text-sm font-medium">
                          <Calendar className="w-4 h-4 text-purple-400" />
                          Preferred Start Date
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={bookingData.startDate}
                          onChange={handleInputChange}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 transition-all duration-200"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-white mb-2 flex items-center gap-2 text-sm font-medium">
                          <Users className="w-4 h-4 text-purple-400" />
                          Number of Participants
                        </label>
                        <input
                          type="number"
                          value={bookingData.participants}
                          onChange={(e) => handleParticipantChange(parseInt(e.target.value) || 1)}
                          onClick={(e) => e.stopPropagation()}
                          min="1"
                          max={experience.maxGroupSize}
                          className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 transition-all duration-200"
                          required
                        />
                        <p className="text-white/60 text-xs mt-1">Max group size: {experience.maxGroupSize}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-white mb-2 text-sm font-medium">Contact Number</label>
                      <input
                        type="tel"
                        name="contactNumber"
                        value={bookingData.contactNumber}
                        onChange={handleInputChange}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Enter your contact number"
                        className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2 text-sm font-medium">Special Requests (Optional)</label>
                      <textarea
                        name="specialRequests"
                        value={bookingData.specialRequests}
                        onChange={handleInputChange}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Any special requirements or requests..."
                        rows={2}
                        className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 resize-none transition-all duration-200"
                      />
                    </div>

                    {/* Additional Participants Section */}
                    {bookingData.additionalParticipants.length > 0 && (
                      <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-400" />
                          Additional Participants Details
                        </h4>
                        <div className="space-y-4">
                          {bookingData.additionalParticipants.map((participant, index) => (
                            <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-3">
                              <h5 className="text-white/90 font-medium mb-3">Participant {index + 2}</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                  <label className="block text-white/80 mb-1 text-sm flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    Full Name
                                  </label>
                                  <input
                                    type="text"
                                    value={participant.name}
                                    onChange={(e) => updateAdditionalParticipant(index, 'name', e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    placeholder="Enter full name"
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-all duration-200 text-sm"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-white/80 mb-1 text-sm flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    Phone Number
                                  </label>
                                  <input
                                    type="tel"
                                    value={participant.phone}
                                    onChange={(e) => updateAdditionalParticipant(index, 'phone', e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    placeholder="Enter phone number"
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-all duration-200 text-sm"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-white/80 mb-1 text-sm flex items-center gap-1">
                                    <Hash className="w-3 h-3" />
                                    Age
                                  </label>
                                  <input
                                    type="number"
                                    value={participant.age}
                                    onChange={(e) => updateAdditionalParticipant(index, 'age', e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    placeholder="Age"
                                    min="1"
                                    max="100"
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-all duration-200 text-sm"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-white/80 mb-1 text-sm flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    ID Number
                                  </label>
                                  <input
                                    type="text"
                                    value={participant.idNumber}
                                    onChange={(e) => updateAdditionalParticipant(index, 'idNumber', e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    placeholder="ID number"
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-all duration-200 text-sm"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Emergency Contact Section */}
                    <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-3">Emergency Contact (Optional but Recommended)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-white/80 mb-1 text-sm">Name</label>
                          <input
                            type="text"
                            name="emergencyContactName"
                            value={bookingData.emergencyContact.name}
                            onChange={(e) => setBookingData(prev => ({
                              ...prev,
                              emergencyContact: {
                                ...prev.emergencyContact,
                                name: e.target.value
                              }
                            }))}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Full name"
                            className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 mb-1 text-sm">Phone</label>
                          <input
                            type="tel"
                            name="emergencyContactPhone"
                            value={bookingData.emergencyContact.phone}
                            onChange={(e) => setBookingData(prev => ({
                              ...prev,
                              emergencyContact: {
                                ...prev.emergencyContact,
                                phone: e.target.value
                              }
                            }))}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Phone number"
                            className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 mb-1 text-sm">Relationship</label>
                          <input
                            type="text"
                            name="emergencyContactRelationship"
                            value={bookingData.emergencyContact.relationship}
                            onChange={(e) => setBookingData(prev => ({
                              ...prev,
                              emergencyContact: {
                                ...prev.emergencyContact,
                                relationship: e.target.value
                              }
                            }))}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Relation"
                            className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pricing Summary */}
                    {bookingData.participants > 0 && (
                      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-lg p-4 border border-purple-400/30">
                        <h4 className="text-white font-bold mb-3">Booking Summary</h4>
                        <div className="space-y-2 text-white/80 text-sm">
                          <div className="flex justify-between items-center">
                            <span>Price per person:</span>
                            <span className="font-semibold">₹{experience.price.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Participants:</span>
                            <span className="font-semibold">{bookingData.participants}</span>
                          </div>
                          <hr className="border-white/20" />
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-white">Total Amount:</span>
                            <span className="font-bold text-white text-lg">₹{calculateTotal().toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        onClick={() => setStep(2)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 font-semibold rounded-lg transition-all duration-200"
                        disabled={!bookingData.startDate || !bookingData.contactNumber || bookingData.participants < 1 || 
                          bookingData.additionalParticipants.some(p => !p.name || !p.phone || !p.age || !p.idNumber)}
                      >
                        Continue to ID Verification
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* ID Verification Step */}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-400" />
                      ID Verification (Main Booker)
                    </h3>
                    
                    <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                      <p className="text-white/80 text-sm mb-4">
                        Please provide valid ID verification for the main booker. This is required for security and safety purposes.
                      </p>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-white mb-2 text-sm font-medium">ID Type</label>
                          <select
                            value={bookingData.idType}
                            onChange={(e) => setBookingData(prev => ({ ...prev, idType: e.target.value as 'passport' | 'aadhar' | 'driving_license' }))}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 transition-all duration-200"
                            required
                          >
                            <option value="passport">Passport</option>
                            <option value="aadhar">Aadhar Card</option>
                            <option value="driving_license">Driving License</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-white mb-2 text-sm font-medium">ID Number</label>
                          <input
                            type="text"
                            value={bookingData.idNumber}
                            onChange={(e) => setBookingData(prev => ({ ...prev, idNumber: e.target.value }))}
                            onClick={(e) => e.stopPropagation()}
                            placeholder={
                              bookingData.idType === 'passport' ? 'Enter passport number' :
                              bookingData.idType === 'aadhar' ? 'Enter Aadhar number' :
                              'Enter driving license number'
                            }
                            className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 transition-all duration-200"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-white mb-2 text-sm font-medium">Upload ID Document</label>
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full px-4 py-6 bg-white/10 border-2 border-dashed border-white/30 rounded-lg text-white hover:border-purple-400 hover:bg-white/15 cursor-pointer transition-all duration-200 text-center"
                          >
                            <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                            {bookingData.idFile ? (
                              <div>
                                <p className="text-green-400 font-medium">{bookingData.idFile.name}</p>
                                <p className="text-white/60 text-sm">Click to change file</p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-white/80">Click to upload ID document</p>
                                <p className="text-white/60 text-sm">PNG, JPG, PDF up to 5MB</p>
                              </div>
                            )}
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
                                setBookingData(prev => ({ ...prev, idFile: file }));
                              } else if (file) {
                                alert('File size must be less than 5MB');
                              }
                            }}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        variant="secondary" 
                        onClick={() => setStep(1)} 
                        className="flex-1 py-3"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={() => setStep(3)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 font-semibold rounded-lg transition-all duration-200"
                        disabled={!bookingData.idNumber || !bookingData.idFile}
                      >
                        Continue to Payment
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Payment Step */}
                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-purple-400" />
                      Complete Your Booking
                    </h3>
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                      <h4 className="text-white font-bold mb-3">Booking Summary</h4>
                      
                      <div className="space-y-2 text-white/80 text-sm">
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
                        <div className="flex justify-between text-white font-bold">
                          <span>Total Amount:</span>
                          <span>₹{calculateTotal().toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-4 rounded-lg text-white">
                      <h4 className="font-bold mb-1">🔒 Secure Payment</h4>
                      <p className="text-sm opacity-90 mb-2">
                        Your payment is secured with industry-standard encryption via Razorpay.
                      </p>
                      <div className="text-xs opacity-75">
                        Supports UPI, Cards, Net Banking, and Wallets
                      </div>
                    </div>

                    {/* Payment Error Display */}
                    {paymentError && (
                      <div className="bg-red-500/20 border border-red-400 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-red-300 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {paymentError}
                        </div>
                      </div>
                    )}

                    {/* Payment Success Display */}
                    {paymentStatus === 'success' && (
                      <div className="bg-green-500/20 border border-green-400 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-green-300 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Payment successful! Generating your booking documents...
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button 
                        variant="secondary" 
                        onClick={() => setStep(2)} 
                        className="flex-1 py-3"
                        disabled={isLoading}
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={handleBookingSubmit} 
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 py-3 font-semibold rounded-lg transition-all duration-200"
                        disabled={isLoading || paymentStatus === 'success'}
                      >
                        {isLoading && paymentStatus === 'processing' ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Opening Payment Gateway...
                          </div>
                        ) : paymentStatus === 'success' ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Payment Successful!
                          </div>
                        ) : (
                          `Pay ₹${calculateTotal().toLocaleString()} with Razorpay`
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
              </div>
              </GlassCard>
            </div>
          </div>
        </motion.div>
      )}
      
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
}