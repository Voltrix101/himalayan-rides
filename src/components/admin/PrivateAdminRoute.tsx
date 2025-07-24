import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, LogIn } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useAuth } from '../../hooks/useAuth';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';

interface PrivateAdminRouteProps {
  children: React.ReactNode;
}

export function PrivateAdminRoute({ children }: PrivateAdminRouteProps) {
  const { adminUser, isAdminLoading, accessDenied } = useAdminAuth();
  const { user, login } = useAuth();

  // Loading state
  if (isAdminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Verifying admin access...</p>
        </motion.div>
      </div>
    );
  }

  // Not logged in at all
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <GlassCard className="text-center">
            <div className="p-8">
              <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
                <LogIn className="w-8 h-8 text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Admin Login Required</h1>
              <p className="text-white/80 mb-6">
                Please sign in with your admin account to access the dashboard.
              </p>
              <Button onClick={login} className="w-full">
                Sign In
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  // Access denied for non-admin users
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <GlassCard className="text-center border-red-500/20">
            <div className="p-8">
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
              <p className="text-white/80 mb-4">
                You don't have permission to access the admin dashboard.
              </p>
              <p className="text-red-300 text-sm mb-6">
                Signed in as: <span className="font-mono">{user.email}</span>
              </p>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                <p className="text-red-200 text-sm">
                  Only authorized administrators can access this area. If you believe this is an error, please contact support.
                </p>
              </div>
              <Button 
                variant="secondary"
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Go to Main Site
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  // Admin user authenticated - show admin content
  if (adminUser) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    );
  }

  // Fallback loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
    </div>
  );
}
