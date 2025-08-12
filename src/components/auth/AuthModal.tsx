import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, User, MapPin, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { FluidButton } from '../ui/FluidButton';
import { LiquidGlass } from '../ui/LiquidGlass';
import { NeonText } from '../ui/NeonText';
import { FloatingParticles } from '../ui/FloatingParticles';
import { useTouchInteraction } from '../../hooks/useTouchInteraction';
import { FirebaseForgotPasswordModal } from './FirebaseForgotPasswordModal';
import toast from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    region: ''
  });
  const { signIn, signInWithGoogle, resetPassword } = useAuth();
  const { touchProps } = useTouchInteraction();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      await signInWithGoogle();
      onClose();
      onAuthSuccess?.();
    } catch (error) {
      // Error is already handled in signInWithGoogle
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl"
          style={{ 
            background: 'radial-gradient(circle at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%)',
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Enhanced Background with Particles */}
          <div className="absolute inset-0">
            <FloatingParticles count={12} color="cyan" className="z-0" />
            <FloatingParticles count={8} color="purple" className="z-0" />
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-blue-500/5" />
          </div>
          
          {/* Click Outside Area */}
          <div 
            className="absolute inset-0 z-10" 
            onClick={onClose}
          />
          
          {/* Modal Container */}
          <div className="flex items-center justify-center min-h-full w-full relative z-20 p-4 overflow-y-auto">
            <div className="w-full max-w-md mx-auto my-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 25,
                  duration: 0.4
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full relative"
              >
              <LiquidGlass 
                variant="floating"
                glow
                className="w-full p-8 relative overflow-visible"
              >
                {/* Enhanced Background Gradients */}
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-blue-500/10" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
                  <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl" />
                  <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Close Button */}
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="absolute -top-2 -right-2 w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-all duration-300 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 shadow-lg"
                    {...touchProps}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>

                  {/* Header Section */}
                  <motion.div 
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <NeonText 
                      className="text-3xl md:text-4xl font-bold mb-4"
                      variant="rainbow"
                      size="2xl"
                    >
                      {isLogin ? 'Welcome Back' : 'Join the Adventure'}
                    </NeonText>
                    <motion.p 
                      className="text-white/80 text-lg leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {isLogin ? 'Sign in to continue your Himalayan journey' : 'Create your account to explore the majestic Himalayas'}
                    </motion.p>
                  </motion.div>

                  {/* Form Section */}
                  <motion.form 
                    onSubmit={handleSubmit} 
                    className="space-y-6 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {/* Email Field */}
                    <motion.div 
                      className="relative group"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300" />
                      <motion.input
                        whileFocus={{ scale: 1.02, y: -2 }}
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-14 pr-6 py-4 bg-white/10 border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 focus:bg-white/15 focus:shadow-lg focus:shadow-cyan-400/20 transition-all duration-300 backdrop-blur-sm group-hover:border-white/40"
                        required
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/10 via-transparent to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </motion.div>

                    {/* Password Field */}
                    
                      <motion.div 
                        className="relative group"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
                        <motion.input
                          whileFocus={{ scale: 1.02, y: -2 }}
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full pl-14 pr-14 py-4 bg-white/10 border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:bg-white/15 focus:shadow-lg focus:shadow-purple-400/20 transition-all duration-300 backdrop-blur-sm group-hover:border-white/40"
                          required
                          minLength={6}
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-300"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </motion.button>
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/10 via-transparent to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </motion.div>
                    

                    {/* Sign Up Additional Fields */}
                    {!isLogin && (
                      <>
                        <motion.div 
                          className="relative group"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400 group-hover:text-green-300 transition-colors duration-300" />
                          <motion.input
                            whileFocus={{ scale: 1.02, y: -2 }}
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full pl-14 pr-6 py-4 bg-white/10 border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-green-400 focus:bg-white/15 focus:shadow-lg focus:shadow-green-400/20 transition-all duration-300 backdrop-blur-sm group-hover:border-white/40"
                            required
                          />
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400/10 via-transparent to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </motion.div>

                        <motion.div 
                          className="relative group"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-400 group-hover:text-orange-300 transition-colors duration-300" />
                          <motion.input
                            whileFocus={{ scale: 1.02, y: -2 }}
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full pl-14 pr-6 py-4 bg-white/10 border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-orange-400 focus:bg-white/15 focus:shadow-lg focus:shadow-orange-400/20 transition-all duration-300 backdrop-blur-sm group-hover:border-white/40"
                            required
                          />
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400/10 via-transparent to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </motion.div>

                        <motion.div 
                          className="relative group"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-400 group-hover:text-pink-300 transition-colors duration-300" />
                          <motion.select
                            whileFocus={{ scale: 1.02, y: -2 }}
                            name="region"
                            value={formData.region}
                            onChange={handleInputChange}
                            className="w-full pl-14 pr-6 py-4 bg-white/10 border border-white/30 rounded-2xl text-white focus:outline-none focus:border-pink-400 focus:bg-white/15 focus:shadow-lg focus:shadow-pink-400/20 transition-all duration-300 backdrop-blur-sm group-hover:border-white/40"
                            required
                          >
                            <option value="" className="bg-gray-800 text-white">Select Your Region</option>
                            
                            {/* Northern India */}
                            <option value="jammu-kashmir" className="bg-gray-800 text-white">Jammu & Kashmir</option>
                            <option value="ladakh" className="bg-gray-800 text-white">Ladakh</option>
                            <option value="himachal-pradesh" className="bg-gray-800 text-white">Himachal Pradesh</option>
                            <option value="uttarakhand" className="bg-gray-800 text-white">Uttarakhand</option>
                            <option value="punjab" className="bg-gray-800 text-white">Punjab</option>
                            <option value="haryana" className="bg-gray-800 text-white">Haryana</option>
                            <option value="delhi" className="bg-gray-800 text-white">Delhi</option>
                            <option value="uttar-pradesh" className="bg-gray-800 text-white">Uttar Pradesh</option>
                            
                            {/* Western India */}
                            <option value="rajasthan" className="bg-gray-800 text-white">Rajasthan</option>
                            <option value="gujarat" className="bg-gray-800 text-white">Gujarat</option>
                            <option value="maharashtra" className="bg-gray-800 text-white">Maharashtra</option>
                            <option value="goa" className="bg-gray-800 text-white">Goa</option>
                            
                            {/* Central India */}
                            <option value="madhya-pradesh" className="bg-gray-800 text-white">Madhya Pradesh</option>
                            <option value="chhattisgarh" className="bg-gray-800 text-white">Chhattisgarh</option>
                            
                            {/* Eastern India */}
                            <option value="west-bengal" className="bg-gray-800 text-white">West Bengal</option>
                            <option value="bihar" className="bg-gray-800 text-white">Bihar</option>
                            <option value="jharkhand" className="bg-gray-800 text-white">Jharkhand</option>
                            <option value="odisha" className="bg-gray-800 text-white">Odisha</option>
                            
                            {/* Northeastern India */}
                            <option value="assam" className="bg-gray-800 text-white">Assam</option>
                            <option value="arunachal-pradesh" className="bg-gray-800 text-white">Arunachal Pradesh</option>
                            <option value="manipur" className="bg-gray-800 text-white">Manipur</option>
                            <option value="meghalaya" className="bg-gray-800 text-white">Meghalaya</option>
                            <option value="mizoram" className="bg-gray-800 text-white">Mizoram</option>
                            <option value="nagaland" className="bg-gray-800 text-white">Nagaland</option>
                            <option value="sikkim" className="bg-gray-800 text-white">Sikkim</option>
                            <option value="tripura" className="bg-gray-800 text-white">Tripura</option>
                            
                            {/* Southern India */}
                            <option value="andhra-pradesh" className="bg-gray-800 text-white">Andhra Pradesh</option>
                            <option value="telangana" className="bg-gray-800 text-white">Telangana</option>
                            <option value="karnataka" className="bg-gray-800 text-white">Karnataka</option>
                            <option value="kerala" className="bg-gray-800 text-white">Kerala</option>
                            <option value="tamil-nadu" className="bg-gray-800 text-white">Tamil Nadu</option>
                            
                            {/* Union Territories */}
                            <option value="andaman-nicobar" className="bg-gray-800 text-white">Andaman & Nicobar Islands</option>
                            <option value="chandigarh" className="bg-gray-800 text-white">Chandigarh</option>
                            <option value="dadra-nagar-haveli" className="bg-gray-800 text-white">Dadra & Nagar Haveli</option>
                            <option value="daman-diu" className="bg-gray-800 text-white">Daman & Diu</option>
                            <option value="lakshadweep" className="bg-gray-800 text-white">Lakshadweep</option>
                            <option value="puducherry" className="bg-gray-800 text-white">Puducherry</option>
                            
                            {/* International */}
                            <option value="international" className="bg-gray-800 text-white">International</option>
                          </motion.select>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-400/10 via-transparent to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </motion.div>
                  </>
                )}

                    {/* Submit Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="pt-4 pb-2"
                    >
                      <FluidButton
                        variant="glow"
                        size="lg"
                        className="w-full h-14 text-lg font-medium bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 shadow-xl shadow-cyan-500/25 transition-all duration-300"
                        disabled={isSubmitting}
                        type="submit"
                        glow
                      >
                        <motion.span 
                          className="relative z-10 flex items-center justify-center gap-2"
                          animate={isSubmitting ? { opacity: [1, 0.5, 1] } : {}}
                          transition={{ duration: 1, repeat: isSubmitting ? Infinity : 0 }}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Please wait...
                            </>
                          ) : (
                            <>
                              {isLogin ? 'Sign In' : 'Create Account'}
                            </>
                          )}
                        </motion.span>
                      </FluidButton>
                    </motion.div>
                  </motion.form>
                  {/* OR Separator */}
                  <div className="my-6 flex items-center justify-center">
                    <span className="h-px w-full bg-white/20"></span>
                    <span className="mx-4 text-sm text-white/60">OR</span>
                    <span className="h-px w-full bg-white/20"></span>
                  </div>

                  {/* Google Sign-In Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <FluidButton
                      variant="outlined"
                      size="lg"
                      className="w-full h-14 text-lg font-medium border-white/30 hover:border-white/50 hover:bg-white/10 transition-all duration-300"
                      onClick={handleGoogleSignIn}
                      disabled={isSubmitting}
                    >
                      <motion.span className="flex items-center justify-center gap-3">
                        <FcGoogle size={24} />
                        Sign in with Google
                      </motion.span>
                    </FluidButton>
                  </motion.div>

                  {/* Forgot Password Link */}
                  {isLogin && (
                    <motion.div 
                      className="text-center mt-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <motion.button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-white/60 hover:text-cyan-400 text-sm transition-all duration-300 underline decoration-dotted underline-offset-4 hover:decoration-solid hover:underline-offset-2"
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Forgot your password?
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Toggle Auth Mode */}
                  <motion.div 
                    className="text-center mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                   
                      <motion.button
                        onClick={() => {
                          setIsLogin(!isLogin);
                          setFormData(prev => ({ ...prev, password: '', name: '', phone: '', region: '' }));
                        }}
                        className="text-white/80 hover:text-cyan-400 transition-all duration-300 font-medium"
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                      </motion.button>
                  </motion.div>
                </div>
              </LiquidGlass>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Firebase Forgot Password Modal */}
      <FirebaseForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        onBackToLogin={() => {
          setShowForgotModal(false);
          // Modal will remain open for login
        }}
      />
    </AnimatePresence>
  );
}