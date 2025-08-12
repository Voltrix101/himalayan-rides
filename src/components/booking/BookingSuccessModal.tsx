import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, CheckCircle, Sparkles, Calendar, User, CreditCard, X } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { PremiumPDFGenerator, transformToUniversalBooking } from '../../utils/premiumPdfGenerator';
import { useConfetti } from '../../hooks/useConfetti';

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: {
    userInfo: {
      name: string;
      email: string;
      phone: string;
    };
    tripInfo: {
      name: string;
      duration: string;
      totalCost: number;
      baseAmount?: number;
      taxAmount?: number;
      type: string;
    };
    itinerary?: Array<{
      title: string;
      description: string;
    }>;
    bookingId?: string;
    paymentId?: string;
    bookingDate?: Date;
  };
}

export function BookingSuccessModal({ isOpen, onClose, bookingData }: BookingSuccessModalProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const { triggerConfetti } = useConfetti();

  useEffect(() => {
    if (isOpen) {
      // Trigger confetti animation when modal opens
      setTimeout(() => {
        triggerConfetti();
      }, 500);
    }
  }, [isOpen, triggerConfetti]);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing
      
      // 🎯 Transform booking data to Universal Booking format
      const universalBooking = transformToUniversalBooking({
        id: bookingData.bookingId || `HMR-${Date.now()}`,
        type: bookingData.tripInfo.type as any,
        title: bookingData.tripInfo.name,
        duration: bookingData.tripInfo.duration,
        user: bookingData.userInfo,
        participants: [
          {
            name: bookingData.userInfo.name,
            age: 25,
            gender: 'N/A',
            contact: bookingData.userInfo.phone,
          }
        ],
        itinerary: bookingData.itinerary?.map((item, index) => ({
          day: `Day ${index + 1}`,
          title: item.title,
          description: item.description,
        })) || [],
        billing: {
          perPerson: bookingData.tripInfo.baseAmount || bookingData.tripInfo.totalCost,
          total: bookingData.tripInfo.totalCost,
          tax: bookingData.tripInfo.taxAmount || 0,
          finalAmount: bookingData.tripInfo.totalCost,
        },
      });

      // 🎨 Generate Premium PDF
      const pdfGenerator = new PremiumPDFGenerator(universalBooking);
      await pdfGenerator.generateBookingConfirmation();
      
      setPdfGenerated(true);
      setTimeout(() => setPdfGenerated(false), 3000);
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again or contact support.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const particleVariants = {
    initial: { scale: 0, rotate: 0 },
    animate: { 
      scale: [0, 1, 0],
      rotate: [0, 180, 360],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut"
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md"
          >
            <GlassCard className="relative overflow-hidden">
              {/* Animated Background Particles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    variants={particleVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: i * 0.2 }}
                  />
                ))}
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/60 hover:text-white z-10 p-2 rounded-full bg-white/10 backdrop-blur-sm transition-all duration-300"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative z-10 p-6">
                {/* Success Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15, stiffness: 300, delay: 0.2 }}
                  className="flex justify-center mb-4"
                >
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute -inset-2 rounded-full border-2 border-green-400/30 border-t-green-400"
                    />
                  </div>
                </motion.div>

                {/* Success Message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center mb-6"
                >
                  <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                    Booking Confirmed!
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                  </h2>
                  <p className="text-white/80 text-sm">
                    Get ready for your Himalayan adventure!
                  </p>
                </motion.div>

                {/* Booking Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white/10 rounded-xl p-4 mb-6 backdrop-blur-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-white/90">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm font-medium">{bookingData.tripInfo.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/90">
                      <User className="w-4 h-4 text-green-400" />
                      <span className="text-sm">{bookingData.userInfo.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/90">
                      <CreditCard className="w-4 h-4 text-orange-400" />
                      <span className="text-sm font-medium">₹{bookingData.tripInfo.totalCost.toLocaleString()}</span>
                    </div>
                    {bookingData.bookingId && (
                      <div className="text-xs text-white/60 mt-2">
                        Booking ID: {bookingData.bookingId}
                      </div>
                    )}
                    {bookingData.paymentId && (
                      <div className="text-xs text-white/60">
                        Payment ID: {bookingData.paymentId}
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* PDF Download Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-4"
                >
                  <div className="bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-xl p-4 border border-orange-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Download className="w-5 h-5 text-orange-400" />
                      <h3 className="text-white font-semibold">Your Trip Document</h3>
                    </div>
                    <p className="text-white/80 text-sm mb-3">
                      Download your complete itinerary and billing summary as a beautifully designed PDF.
                    </p>
                    
                    <Button
                      onClick={handleDownloadPDF}
                      disabled={isGeneratingPDF}
                      className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition-all duration-300"
                    >
                      {isGeneratingPDF ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : pdfGenerated ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          PDF Downloaded!
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          Download Your Trip PDF
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Next Steps */}
                  <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-500/30">
                    <h4 className="text-white font-semibold text-sm mb-2">📋 What's Next?</h4>
                    <ul className="text-white/80 text-xs space-y-1">
                      <li>• Check your email for confirmation details</li>
                      <li>• Our team will contact you 48 hours before departure</li>
                      <li>• Start preparing for your amazing adventure!</li>
                    </ul>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex gap-3 mt-6"
                >
                  <Button
                    variant="glass"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      onClose();
                      // Navigate to trips page or dashboard
                      window.dispatchEvent(new CustomEvent('navigateToTrips'));
                    }}
                    className="flex-1"
                  >
                    View My Trips
                  </Button>
                </motion.div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
