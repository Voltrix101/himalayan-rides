import React from 'react';
import { motion } from 'framer-motion';
import { Shield, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { isCurrentUserAdmin } from '../utils/adminUtils';

export const AdminStatusIndicator: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user ? isCurrentUserAdmin(user) : false;

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-4 right-4 z-50"
    >
      <div className={`
        px-3 py-2 rounded-lg backdrop-blur-sm border
        ${isAdmin 
          ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300' 
          : 'bg-blue-500/20 border-blue-400/30 text-blue-300'
        }
      `}>
        <div className="flex items-center gap-2 text-sm font-medium">
          {isAdmin ? (
            <>
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </>
          ) : (
            <>
              <User className="w-4 h-4" />
              <span>User</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};
