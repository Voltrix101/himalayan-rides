import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ArrowLeft, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface FirebaseForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

type ForgotPasswordStep = 'email' | 'success';

export function FirebaseForgotPasswordModal({ isOpen, onClose, onBackToLogin }: FirebaseForgotPasswordModalProps) {
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>('email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: ''
  });
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setIsSubmitting(true);
      await resetPassword(formData.email);
      setCurrentStep('success');
      
      // Auto-close after 5 seconds
      setTimeout(() => {
        onBackToLogin();
        handleReset();
      }, 5000);
    } catch (error) {
      // Error is already handled in resetPassword
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleReset = () => {
    setCurrentStep('email');
    setFormData({ email: '' });
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 'email':
        return (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Forgot Password</h2>
              <p className="text-white/80">
                Enter your email address and we'll send you a password reset link
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 backdrop-blur-sm"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="glass"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending Reset Link...' : 'Send Reset Link'}
              </Button>
            </form>
          </>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-10 h-10 text-green-400" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">Email Sent!</h2>
            <p className="text-white/80 mb-6">
              We've sent a password reset link to <strong>{formData.email}</strong>
            </p>
            <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4 mb-6">
              <p className="text-blue-200 text-sm">
                📧 Check your email (including spam folder) and click the reset link to set a new password.
              </p>
            </div>
            <Button
              variant="glass"
              className="w-full"
              onClick={() => {
                onBackToLogin();
                handleReset();
              }}
            >
              Back to Login
            </Button>
          </div>
        );

      default:
        return null;
    }
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
              className="w-full max-w-md p-6 relative my-8"
              hover={false}
              onClick={handleModalClick}
            >
              <button
                onClick={() => {
                  onClose();
                  handleReset();
                }}
                className="absolute top-4 right-4 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {getStepContent()}
              </motion.div>

              {currentStep === 'email' && (
                <div className="text-center mt-4">
                  <button
                    onClick={onBackToLogin}
                    className="text-white/60 hover:text-white text-sm flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </button>
                </div>
              )}
            </GlassCard>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
