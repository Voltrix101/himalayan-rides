import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, User, MapPin, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';
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
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    region: ''
  });
  const { signIn, resetPassword, hideAuthModal, isLoading } = useAuth();

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
      } catch (error) {
        // Error is already handled in resetPassword
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (isLogin) {
      // Login - only email and password required
      if (!formData.email || !formData.password) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      try {
        setIsSubmitting(true);
        await signIn(formData.email, formData.password);
        onClose();
        onAuthSuccess?.();
      } catch (error) {
        // Error is already handled in signIn
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Sign up - all fields required
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
      } catch (error) {
        // Error is already handled in signIn
      } finally {
        setIsSubmitting(false);
      }
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
              className="w-full max-w-md p-6 relative my-8"
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
                      {/* Northern India */}
                      <option value="jammu-kashmir">Jammu & Kashmir</option>
                      <option value="ladakh">Ladakh</option>
                      <option value="himachal-pradesh">Himachal Pradesh</option>
                      <option value="uttarakhand">Uttarakhand</option>
                      <option value="punjab">Punjab</option>
                      <option value="haryana">Haryana</option>
                      <option value="delhi">Delhi</option>
                      <option value="uttar-pradesh">Uttar Pradesh</option>
                      
                      {/* Western India */}
                      <option value="rajasthan">Rajasthan</option>
                      <option value="gujarat">Gujarat</option>
                      <option value="maharashtra">Maharashtra</option>
                      <option value="goa">Goa</option>
                      
                      {/* Central India */}
                      <option value="madhya-pradesh">Madhya Pradesh</option>
                      <option value="chhattisgarh">Chhattisgarh</option>
                      
                      {/* Eastern India */}
                      <option value="west-bengal">West Bengal</option>
                      <option value="bihar">Bihar</option>
                      <option value="jharkhand">Jharkhand</option>
                      <option value="odisha">Odisha</option>
                      
                      {/* Northeastern India */}
                      <option value="assam">Assam</option>
                      <option value="arunachal-pradesh">Arunachal Pradesh</option>
                      <option value="manipur">Manipur</option>
                      <option value="meghalaya">Meghalaya</option>
                      <option value="mizoram">Mizoram</option>
                      <option value="nagaland">Nagaland</option>
                      <option value="sikkim">Sikkim</option>
                      <option value="tripura">Tripura</option>
                      
                      {/* Southern India */}
                      <option value="andhra-pradesh">Andhra Pradesh</option>
                      <option value="telangana">Telangana</option>
                      <option value="karnataka">Karnataka</option>
                      <option value="kerala">Kerala</option>
                      <option value="tamil-nadu">Tamil Nadu</option>
                      
                      {/* Union Territories */}
                      <option value="andaman-nicobar">Andaman & Nicobar Islands</option>
                      <option value="chandigarh">Chandigarh</option>
                      <option value="dadra-nagar-haveli">Dadra & Nagar Haveli</option>
                      <option value="daman-diu">Daman & Diu</option>
                      <option value="lakshadweep">Lakshadweep</option>
                      <option value="puducherry">Puducherry</option>
                      
                      {/* International */}
                      <option value="international">International</option>
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

            {!showForgotPassword && (
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
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
    </AnimatePresence>
  );
}