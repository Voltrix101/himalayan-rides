import { memo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, FileText, MapPin, Calendar, Users, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { useConfetti } from '../../hooks/useConfetti';
import { useAppNavigation } from '../../hooks/useAppNavigation';

interface SuccessModalContentProps {
  bookingData?: {
    bookingId: string;
    type: 'tour' | 'experience';
    title: string;
    totalAmount: number;
    participants: number;
    startDate: string;
    customerEmail: string;
    customerName: string;
  };
  onClose?: () => void;
}

const SuccessModalContent = memo<SuccessModalContentProps>(({ bookingData, onClose }) => {
  const { triggerConfetti } = useConfetti();
  const { navigateToMyTrips } = useAppNavigation();

  useEffect(() => {
    // Trigger confetti when component mounts
    const timer = setTimeout(() => {
      triggerConfetti();
    }, 500);

    return () => clearTimeout(timer);
  }, [triggerConfetti]);

  const handleViewMyTrips = () => {
    onClose?.();
    navigateToMyTrips();
  };

  if (!bookingData) {
    return (
      <div className="p-8 text-center">
        <p className="text-white">No booking data available</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 15,
          delay: 0.2 
        }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6 shadow-lg">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-3xl font-bold text-white mb-2"
        >
          🎉 Booking Confirmed!
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-white/80 text-lg"
        >
          Your {bookingData.type === 'tour' ? 'bike tour' : 'experience'} adventure awaits!
        </motion.p>
      </motion.div>

      {/* Booking Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-400" />
          Booking Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="text-xs text-white/60">Booking ID</div>
              <div className="font-semibold text-white">{bookingData.bookingId}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-xs text-white/60">{bookingData.type === 'tour' ? 'Tour' : 'Experience'}</div>
              <div className="font-semibold text-white">{bookingData.title}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <div className="text-xs text-white/60">Start Date</div>
              <div className="font-semibold text-white">{new Date(bookingData.startDate).toLocaleDateString()}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <div className="text-xs text-white/60">Participants</div>
              <div className="font-semibold text-white">{bookingData.participants} {bookingData.participants === 1 ? 'person' : 'people'}</div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-white/20">
          <div className="flex justify-between items-center">
            <span className="text-white/80">Total Amount Paid:</span>
            <span className="text-2xl font-bold text-green-400">₹{bookingData.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </motion.div>

      {/* Email Confirmation */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-xl p-6 border border-blue-400/30 mb-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <Mail className="w-6 h-6 text-blue-400" />
          <h4 className="text-lg font-semibold text-white">Confirmation Email Sent!</h4>
        </div>
        
        <p className="text-white/80 text-sm mb-2">
          We've sent detailed trip information and your invoice to:
        </p>
        <p className="text-blue-300 font-semibold">{bookingData.customerEmail}</p>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Trip itinerary and details</span>
          </div>
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Payment receipt and invoice</span>
          </div>
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Emergency contact information</span>
          </div>
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Pre-trip preparation guide</span>
          </div>
        </div>
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="bg-white/5 rounded-xl p-6 border border-white/10 mb-8"
      >
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-yellow-400" />
          What's Next?
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">1</div>
            <div>
              <div className="text-white font-medium">Check Your Email</div>
              <div className="text-white/70 text-sm">Review trip details and prepare for your adventure</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">2</div>
            <div>
              <div className="text-white font-medium">Our Team Will Contact You</div>
              <div className="text-white/70 text-sm">We'll reach out 24-48 hours before your trip</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">3</div>
            <div>
              <div className="text-white font-medium">Get Ready for Adventure!</div>
              <div className="text-white/70 text-sm">Pack according to our preparation guide</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Button
          onClick={handleViewMyTrips}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 font-semibold"
        >
          View My Trips
        </Button>
        
        <Button
          variant="secondary"
          onClick={onClose}
          className="flex-1 py-3 font-semibold"
        >
          Book Another Adventure
        </Button>
      </motion.div>

      {/* Customer Service */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.7 }}
        className="text-center mt-6 pt-6 border-t border-white/10"
      >
        <p className="text-white/60 text-sm">
          Need help? Contact us at{' '}
          <a href="mailto:support@himalayanrides.com" className="text-purple-400 hover:text-purple-300">
            support@himalayanrides.com
          </a>{' '}
          or call{' '}
          <a href="tel:+919876543210" className="text-purple-400 hover:text-purple-300">
            +91-9876543210
          </a>
        </p>
      </motion.div>
    </div>
  );
});

SuccessModalContent.displayName = 'SuccessModalContent';

export default SuccessModalContent;
