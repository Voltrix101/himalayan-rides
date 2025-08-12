import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, User, MapPin, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';
import { FirebaseForgotPasswordModal } from './FirebaseForgotPasswordModal';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    region: ''
  });
  const { signIn, resetPassword, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (showForgotPassword) {
      if (!formData.email) {
        toast.error('Please enter your email address');
        return;
      }
      try {
        setIsSubmitting(true);
        await resetPassword(formData.email);
        setShowForgotPassword(false);
        toast.success('Password reset email sent!');
      } catch {
        // already handled in resetPassword
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (isLogin) {
      if (!formData.email || !formData.password) {
        toast.error('Please fill in all required fields');
        return;
      }
      try {
        setIsSubmitting(true);
        await signIn(formData.email, formData.password);
        onClose();
        onAuthSuccess?.();
      } catch {
        // handled in signIn
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!formData.email || !formData.password || !formData.name || !formData.phone || !formData.region) {
        toast.error('Please fill in all required fields including region');
        return;
      }
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }
      try {
        setIsSubmitting(true);
        await signIn(formData.email, formData.password, {
          name: formData.name,
          phone: formData.phone,
          region: formData.region
        });
        onClose();
        onAuthSuccess?.();
      } catch {
        // handled in signIn
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      await signInWithGoogle();
      onClose();
      onAuthSuccess?.();
    } catch {
      // handled in signInWithGoogle
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
              className="w-full max-w-md p-6 relative my-8 max-h-screen overflow-y-auto"
              hover={false}
              onClick={handleModalClick}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {showForgotPassword ? 'Reset Password' :
                    isLogin ? 'Welcome Back' : 'Join Himalayan Rides'}
                </h2>
                <p className="text-white/80">
                  {showForgotPassword ? 'Enter your email to reset password' :
                    isLogin ? 'Sign in to your account' : 'Create your account to explore the Himalayas'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                    required
                  />
                </div>

                {!showForgotPassword && (
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                      required={!showForgotPassword}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                )}

                {!isLogin && !showForgotPassword && (
                  <>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                        required
                      />
                    </div>

                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                      <select
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                        required
                      >
                        <option value="">Select Your Region</option>
                        {/* Add all region options here */}
                      </select>
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Please wait...' :
                    showForgotPassword ? 'Send Reset Email' :
                      isLogin ? 'Sign In' : 'Create Account'}
                </Button>
              </form>

              {/* Google Sign-In: always show in login mode */}
              {isLogin && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-transparent text-white/70">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                    className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {isSubmitting ? 'Signing in...' : 'Sign in with Google'}
                  </Button>
                </>
              )}

              {isLogin && !showForgotPassword && (
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              <div className="text-center mt-6">
                {showForgotPassword ? (
                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setFormData(prev => ({ ...prev, password: '' }));
                    }}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Back to sign in
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setFormData(prev => ({ ...prev, password: '', name: '', phone: '' }));
                    }}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                  </button>
                )}
              </div>
            </GlassCard>
          </div>
        </motion.div>
      )}

      {/* Firebase Forgot Password Modal */}
      <FirebaseForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        onBackToLogin={() => {
          setShowForgotModal(false);
        }}
      />
    </AnimatePresence>
  );
}
