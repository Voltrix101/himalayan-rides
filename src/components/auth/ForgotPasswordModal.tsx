import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Key, Eye, EyeOff, ArrowLeft, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';
import { emailService } from '../../services/emailService';
import toast from 'react-hot-toast';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

type ForgotPasswordStep = 'email' | 'otp' | 'newPassword' | 'success';

export function ForgotPasswordModal({ isOpen, onClose, onBackToLogin }: ForgotPasswordModalProps) {
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>('email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [otpTimer, setOtpTimer] = useState(0);

  // Simulate OTP sending (replace with actual email service)
  const sendOTP = async (email: string) => {
    try {
      setIsSubmitting(true);
      
      // Validate email format
      if (!emailService.isValidEmail(email)) {
        toast.error('Please enter a valid email address');
        return;
      }
      
      // Generate OTP
      const otp = emailService.generateOTP();
      
      // Send OTP via email service
      await emailService.sendOTPEmail({
        email,
        otp,
        userName: 'User', // In production, get this from user data
        expiryMinutes: 10
      });
      
      // Store OTP temporarily (in production, this would be stored on the backend)
      sessionStorage.setItem('resetOTP', otp);
      sessionStorage.setItem('resetEmail', email);
      sessionStorage.setItem('otpTimestamp', Date.now().toString());
      
      // Start countdown timer
      setOtpTimer(60);
      const timer = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      toast.success(`OTP sent to ${email}!`);
      setCurrentStep('otp');
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify OTP
  const verifyOTP = async (otp: string) => {
    try {
      setIsSubmitting(true);
      
      const storedOTP = sessionStorage.getItem('resetOTP');
      const otpTimestamp = sessionStorage.getItem('otpTimestamp');
      
      if (!storedOTP || !otpTimestamp) {
        toast.error('OTP has expired. Please request a new one.');
        return;
      }
      
      // Check if OTP has expired (10 minutes)
      const now = Date.now();
      const otpAge = now - parseInt(otpTimestamp);
      const maxAge = 10 * 60 * 1000; // 10 minutes in milliseconds
      
      if (otpAge > maxAge) {
        sessionStorage.removeItem('resetOTP');
        sessionStorage.removeItem('otpTimestamp');
        toast.error('OTP has expired. Please request a new one.');
        setCurrentStep('email');
        return;
      }
      
      if (otp === storedOTP) {
        toast.success('OTP verified successfully!');
        setCurrentStep('newPassword');
      } else {
        toast.error('Invalid OTP. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to verify OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset password
  const resetPassword = async (newPassword: string) => {
    try {
      setIsSubmitting(true);
      
      // Simulate API call to reset password
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, you would call your backend API here with the new password
      console.log('New password set:', newPassword.replace(/./g, '*'));
      
      // Clear stored data
      sessionStorage.removeItem('resetOTP');
      sessionStorage.removeItem('resetEmail');
      sessionStorage.removeItem('otpTimestamp');
      
      toast.success('Password reset successfully!');
      setCurrentStep('success');
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        onBackToLogin();
        handleReset();
      }, 3000);
    } catch (error) {
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    switch (currentStep) {
      case 'email':
        if (!formData.email) {
          toast.error('Please enter your email address');
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          toast.error('Please enter a valid email address');
          return;
        }
        await sendOTP(formData.email);
        break;
        
      case 'otp':
        if (!formData.otp || formData.otp.length !== 6) {
          toast.error('Please enter the 6-digit OTP');
          return;
        }
        await verifyOTP(formData.otp);
        break;
        
      case 'newPassword':
        if (!formData.newPassword || formData.newPassword.length < 6) {
          toast.error('Password must be at least 6 characters long');
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }
        await resetPassword(formData.newPassword);
        break;
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
    setFormData({
      email: '',
      otp: '',
      newPassword: '',
      confirmPassword: ''
    });
    setOtpTimer(0);
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
                Enter your email address and we'll send you an OTP to reset your password
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
                {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>
          </>
        );

      case 'otp':
        return (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Enter OTP</h2>
              <p className="text-white/80">
                We've sent a 6-digit OTP to {formData.email}
              </p>
              {otpTimer > 0 && (
                <p className="text-blue-300 text-sm mt-2">
                  Resend OTP in {otpTimer}s
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter 6-digit OTP"
                  value={formData.otp}
                  onChange={handleInputChange}
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 backdrop-blur-sm text-center text-lg tracking-widest"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setCurrentStep('email')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="glass"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                </Button>
              </div>

              {otpTimer === 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => sendOTP(formData.email)}
                >
                  Resend OTP
                </Button>
              )}
            </form>
          </>
        );

      case 'newPassword':
        return (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">New Password</h2>
              <p className="text-white/80">
                Create a new password for your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  placeholder="New password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 backdrop-blur-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 backdrop-blur-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setCurrentStep('otp')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="glass"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </Button>
              </div>
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
            <h2 className="text-2xl font-bold text-white mb-2">Password Reset Successful!</h2>
            <p className="text-white/80 mb-6">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
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
                    className="text-white/60 hover:text-white text-sm"
                  >
                    Remember your password? Sign in
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
