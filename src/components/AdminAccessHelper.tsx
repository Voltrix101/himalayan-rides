import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Key, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { getAdminEmails, isAdminUser } from '../utils/adminUtils';
import toast from 'react-hot-toast';

export const AdminAccessHelper: React.FC = () => {
  const [showHelper, setShowHelper] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Simple admin codes for testing
  const ADMIN_CODES = ['HIMALAYA2025', 'ADMIN123', 'TESTADMIN'];

  const handleAdminAccess = () => {
    if (ADMIN_CODES.includes(adminCode.toUpperCase())) {
      // Temporarily set admin flag for testing
      sessionStorage.setItem('tempAdminAccess', 'true');
      toast.success('Admin access granted!');
      navigate('/admin');
      setShowHelper(false);
      setAdminCode('');
    } else {
      toast.error('Invalid admin code');
    }
  };

  const isLoggedIn = !!user;

  return (
    <>
      {/* Admin Helper Toggle Button */}
      <motion.button
        onClick={() => setShowHelper(true)}
        className="fixed bottom-4 right-4 z-40 p-3 bg-purple-600/20 backdrop-blur-sm border border-purple-500/30 rounded-lg hover:bg-purple-600/30 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Admin Access"
      >
        <Key className="w-5 h-5 text-purple-400" />
      </motion.button>

      {/* Admin Access Modal */}
      {showHelper && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowHelper(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-bold text-white">Admin Access</h3>
            </div>

            <div className="space-y-4">
              {/* User Status */}
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Current User:</span>
                </div>
                <p className="text-white font-medium">
                  {isLoggedIn ? user.email || 'Logged in' : 'Not logged in'}
                </p>
                {isLoggedIn && user.email && (
                  <p className="text-xs text-gray-400 mt-1">
                    Admin Status: {isAdminUser(user.email) ? '✅ Admin' : '❌ Regular User'}
                  </p>
                )}
              </div>

              {/* Admin Email List */}
              <div className="p-3 bg-gray-800 rounded-lg">
                <h4 className="text-sm text-gray-300 mb-2">Authorized Admin Emails:</h4>
                <div className="space-y-1">
                  {getAdminEmails().map((email, index) => (
                    <p key={index} className="text-xs text-purple-300 font-mono">
                      {email}
                    </p>
                  ))}
                </div>
              </div>

              {/* Admin Code Input */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Admin Access Code:
                </label>
                <input
                  type="password"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="Enter admin code"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminAccess()}
                />
              </div>

              {/* Hint */}
              <div className="text-xs text-gray-400 bg-gray-800/50 p-2 rounded">
                💡 Test codes: HIMALAYA2025, ADMIN123, TESTADMIN
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleAdminAccess}
                  disabled={!adminCode.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Access Admin
                </Button>
                <Button
                  onClick={() => setShowHelper(false)}
                  variant="ghost"
                  className="px-6"
                >
                  Cancel
                </Button>
              </div>

              {/* Direct Access for Testing */}
              {process.env.NODE_ENV === 'development' && (
                <div className="pt-3 border-t border-gray-700">
                  <Button
                    onClick={() => {
                      sessionStorage.setItem('tempAdminAccess', 'true');
                      navigate('/admin');
                      setShowHelper(false);
                      toast.success('Dev admin access granted!');
                    }}
                    className="w-full text-sm bg-yellow-600 hover:bg-yellow-700"
                  >
                    🔧 Dev: Direct Admin Access
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};
