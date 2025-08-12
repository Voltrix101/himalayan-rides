import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  Users, 
  Phone, 
  Mail, 
  CreditCard, 
  User,
  IdCard,
  AlertCircle,
  Sparkles,
  Shield
} from 'lucide-react';
import { CuratedExperience, CuratedBooking } from '../../types/curatedExperience';
import { curatedExperienceService } from '../../services/curatedExperienceService';
import { PremiumPDFGenerator, transformToUniversalBooking } from '../../utils/premiumPdfGenerator';
import { useAuth } from '../../hooks/useAuth';
import { LiquidGlass } from '../ui/LiquidGlass';
import { FluidButton } from '../ui/FluidButton';
import { NeonText } from '../ui/NeonText';
import toast from 'react-hot-toast';

interface CuratedBookingModalProps {
  experience: CuratedExperience | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (booking: CuratedBooking) => void;
}

export function CuratedBookingModal({ 
  experience, 
  isOpen, 
  onClose, 
  onSuccess 
}: CuratedBookingModalProps) {
  const { user } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [bookingData, setBookingData] = useState({
    startDate: '',
    participants: 1,
    specialRequests: '',
    userInfo: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      age: '',
      idType: 'Aadhar Card',
      idNumber: '',
      emergencyContact: {
        name: '',
        phone: ''
      }
    }
  });

  if (!experience || !user) return null;

  const calculateTotal = () => {
    const baseAmount = experience.price * bookingData.participants;
    const gstAmount = baseAmount * 0.18;
    return baseAmount + gstAmount;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'emergencyContact') {
        setBookingData(prev => ({
          ...prev,
          userInfo: {
            ...prev.userInfo,
            emergencyContact: {
              ...prev.userInfo.emergencyContact,
              [child]: value
            }
          }
        }));
      } else {
        setBookingData(prev => ({
          ...prev,
          userInfo: {
            ...prev.userInfo,
            [child]: value
          }
        }));
      }
    } else {
      setBookingData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRazorpayPayment = async () => {
    if (!window.Razorpay) {
      toast.error('Payment gateway not loaded. Please refresh and try again.');
      return;
    }

    setIsProcessing(true);

    try {
      const totalAmount = calculateTotal();
      const orderId = `CUR_${Date.now()}`;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_e2XSovNpqJPCno', // Use environment variable with fallback
        amount: totalAmount * 100, // Amount in paise
        currency: 'INR',
        name: 'Himalayan Rides',
        description: experience.title,
        order_id: orderId,
        handler: async function (response: any) {
          await handlePaymentSuccess(response, orderId, totalAmount);
        },
        prefill: {
          name: bookingData.userInfo.name,
          email: bookingData.userInfo.email,
          contact: bookingData.userInfo.phone
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            toast.error('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment initiation failed:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (paymentResponse: any, orderId: string, amount: number) => {
    try {
      // Calculate dates
      const startDate = new Date(bookingData.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + experience.days - 1);

      // Prepare booking data
      const curatedBooking: Omit<CuratedBooking, 'id' | 'createdAt'> = {
        uid: user.id,
        experienceId: experience.id,
        type: 'curated',
        userInfo: bookingData.userInfo,
        experienceDetails: experience,
        bookingInfo: {
          startDate,
          endDate,
          participants: bookingData.participants,
          specialRequests: bookingData.specialRequests
        },
        payment: {
          amount,
          currency: 'INR',
          paymentId: paymentResponse.razorpay_payment_id,
          orderId: paymentResponse.razorpay_order_id || orderId,
          status: 'completed',
          timestamp: new Date(),
          method: 'Razorpay'
        },
        status: 'confirmed'
      };

      // Save to Firestore
      const result = await curatedExperienceService.createCuratedBooking(curatedBooking);

      if (result.success) {
        // Generate Premium PDF
        const completeBooking: CuratedBooking = {
          ...curatedBooking,
          id: result.bookingId!,
          createdAt: new Date()
        };

        // 🎯 Transform to Universal Booking format
        const universalBooking = transformToUniversalBooking({
          id: result.bookingId!,
          type: 'curated',
          title: experience.name,
          duration: experience.duration,
          user: curatedBooking.userInfo,
          participants: curatedBooking.participants,
          itinerary: experience.itinerary || [],
          billing: {
            perPerson: experience.basePrice,
            total: experience.basePrice * curatedBooking.participants.length,
            tax: Math.round(experience.basePrice * curatedBooking.participants.length * 0.09),
            finalAmount: Math.round(experience.basePrice * curatedBooking.participants.length * 1.09),
          },
          experience: {
            location: experience.destination,
            highlights: experience.highlights || [],
          },
        });

        // 🎨 Generate Premium PDF
        const pdfGenerator = new PremiumPDFGenerator(universalBooking);
        await pdfGenerator.generateBookingConfirmation();

        // Success feedback
        toast.success('🎉 Booking confirmed! Premium PDF downloaded successfully.');
        
        onSuccess?.(completeBooking);
        onClose();
        
        // Reset form
        setStep(1);
        setBookingData({
          startDate: '',
          participants: 1,
          specialRequests: '',
          userInfo: {
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            age: '',
            idType: 'Aadhar Card',
            idNumber: '',
            emergencyContact: { name: '', phone: '' }
          }
        });

      } else {
        throw new Error(result.error || 'Booking failed');
      }

    } catch (error) {
      console.error('Booking creation failed:', error);
      toast.error('Booking failed after payment. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return !!(bookingData.startDate && bookingData.participants > 0);
      case 2:
        return !!(
          bookingData.userInfo.name &&
          bookingData.userInfo.email &&
          bookingData.userInfo.phone &&
          bookingData.userInfo.age &&
          bookingData.userInfo.idNumber &&
          bookingData.userInfo.emergencyContact.name &&
          bookingData.userInfo.emergencyContact.phone
        );
      default:
        return true;
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            ref={modalRef}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={handleModalClick}
          >
            <LiquidGlass variant="frosted" className="p-8 relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/60 hover:text-white z-10 bg-black/20 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="mb-6">
                <NeonText variant="rainbow" className="text-2xl font-bold mb-2">
                  Book {experience.title}
                </NeonText>
                <div className="flex items-center gap-2 text-white/80">
                  <span className="bg-purple-500/20 px-3 py-1 rounded-full text-xs uppercase">
                    {experience.category}
                  </span>
                  <span className="bg-blue-500/20 px-3 py-1 rounded-full text-xs">
                    {experience.days} Days
                  </span>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center mb-8">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      step >= stepNumber 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white/20 text-white/60'
                    }`}>
                      {stepNumber}
                    </div>
                    {stepNumber < 3 && (
                      <div className={`w-16 h-1 mx-2 ${
                        step > stepNumber ? 'bg-blue-500' : 'bg-white/20'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step Content */}
              <div className="space-y-6">
                {/* Step 1: Booking Details */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Booking Details
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 mb-2">Start Date</label>
                        <input
                          type="date"
                          name="startDate"
                          value={bookingData.startDate}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-white/80 mb-2">Participants</label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setBookingData(prev => ({ 
                              ...prev, 
                              participants: Math.max(1, prev.participants - 1) 
                            }))}
                            className="w-10 h-10 bg-white/10 border border-white/20 rounded-lg text-white"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={bookingData.participants}
                            readOnly
                            className="w-16 h-10 text-center bg-white/10 border border-white/20 rounded-lg text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setBookingData(prev => ({ 
                              ...prev, 
                              participants: Math.min(experience.maxParticipants, prev.participants + 1) 
                            }))}
                            className="w-10 h-10 bg-white/10 border border-white/20 rounded-lg text-white"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-xs text-white/60 mt-1">
                          Max {experience.maxParticipants} participants
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2">Special Requests (Optional)</label>
                      <textarea
                        name="specialRequests"
                        value={bookingData.specialRequests}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                        placeholder="Any dietary restrictions, accessibility needs, or special requirements..."
                      />
                    </div>

                    <div className="flex justify-end">
                      <FluidButton
                        variant="primary"
                        onClick={() => setStep(2)}
                        disabled={!validateStep(1)}
                      >
                        Continue to Personal Details
                      </FluidButton>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Personal Information */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Personal Information
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 mb-2">Full Name</label>
                        <input
                          type="text"
                          name="userInfo.name"
                          value={bookingData.userInfo.name}
                          onChange={handleInputChange}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-white/80 mb-2">Age</label>
                        <input
                          type="number"
                          name="userInfo.age"
                          value={bookingData.userInfo.age}
                          onChange={handleInputChange}
                          min="18"
                          max="100"
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-white/80 mb-2">Email</label>
                        <input
                          type="email"
                          name="userInfo.email"
                          value={bookingData.userInfo.email}
                          onChange={handleInputChange}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-white/80 mb-2">Phone</label>
                        <input
                          type="tel"
                          name="userInfo.phone"
                          value={bookingData.userInfo.phone}
                          onChange={handleInputChange}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-white/80 mb-2">ID Type</label>
                        <select
                          name="userInfo.idType"
                          value={bookingData.userInfo.idType}
                          onChange={handleInputChange}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                        >
                          <option value="Aadhar Card">Aadhar Card</option>
                          <option value="Passport">Passport</option>
                          <option value="Driving License">Driving License</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-white/80 mb-2">ID Number</label>
                        <input
                          type="text"
                          name="userInfo.idNumber"
                          value={bookingData.userInfo.idNumber}
                          onChange={handleInputChange}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                          required
                        />
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Emergency Contact</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/80 mb-2">Contact Name</label>
                          <input
                            type="text"
                            name="emergencyContact.name"
                            value={bookingData.userInfo.emergencyContact.name}
                            onChange={handleInputChange}
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 mb-2">Contact Phone</label>
                          <input
                            type="tel"
                            name="emergencyContact.phone"
                            value={bookingData.userInfo.emergencyContact.phone}
                            onChange={handleInputChange}
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <FluidButton
                        variant="secondary"
                        onClick={() => setStep(1)}
                      >
                        Back
                      </FluidButton>
                      <FluidButton
                        variant="primary"
                        onClick={() => setStep(3)}
                        disabled={!validateStep(2)}
                      >
                        Continue to Payment
                      </FluidButton>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Payment Summary
                    </h3>

                    {/* Booking Summary */}
                    <div className="bg-white/5 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between text-white/80">
                        <span>Experience ({bookingData.participants} participants)</span>
                        <span>₹{(experience.price * bookingData.participants).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-white/80">
                        <span>GST (18%)</span>
                        <span>₹{((experience.price * bookingData.participants) * 0.18).toLocaleString()}</span>
                      </div>
                      <div className="border-t border-white/20 pt-3">
                        <div className="flex justify-between text-white font-bold text-lg">
                          <span>Total Amount</span>
                          <span>₹{calculateTotal().toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Gateway Info */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-blue-400" />
                        <h4 className="font-semibold text-white">Secure Payment</h4>
                      </div>
                      <p className="text-white/80 text-sm">
                        Your payment is processed securely through Razorpay with 256-bit SSL encryption.
                        We accept all major credit/debit cards, UPI, and net banking.
                      </p>
                    </div>

                    <div className="flex justify-between">
                      <FluidButton
                        variant="secondary"
                        onClick={() => setStep(2)}
                        disabled={isProcessing}
                      >
                        Back
                      </FluidButton>
                      <FluidButton
                        variant="primary"
                        onClick={handleRazorpayPayment}
                        disabled={isProcessing}
                        className="flex items-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Pay ₹{calculateTotal().toLocaleString()}
                          </>
                        )}
                      </FluidButton>
                    </div>
                  </motion.div>
                )}
              </div>
            </LiquidGlass>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
