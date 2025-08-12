import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { isCurrentUserAdmin } from '../utils/adminUtils';

/**
 * Admin Status Indicator Component
 * Shows current admin status for debugging purposes
 */
export const AdminStatusIndicator: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = isCurrentUserAdmin(user);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 backdrop-blur-md rounded-lg p-3 text-white text-xs z-50">
      <div className="font-bold mb-1">User Status</div>
      <div>Email: {user?.email || 'Not logged in'}</div>
      <div className={`font-bold ${isAdmin ? 'text-green-400' : 'text-gray-400'}`}>
        Admin: {isAdmin ? '✅ Yes' : '❌ No'}
      </div>
      {isAdmin && (
        <div className="text-xs text-green-300 mt-1">
          Performance monitor visible
        </div>
      )}
    </div>
  );
};
