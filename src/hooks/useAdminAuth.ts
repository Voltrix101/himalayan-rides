import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { isAdminEmail } from '../constants/admin';

export function useAdminAuth() {
  const { state } = useApp();

  const adminUser = useMemo(() => {
    if (!state.user) return null;
    
    // Check if current user is admin
    if (isAdminEmail(state.user.email)) {
      return {
        ...state.user,
        isAdmin: true,
        permissions: ['read', 'write', 'delete', 'admin']
      };
    }
    
    return null;
  }, [state.user]);

  const isAuthenticated = !!adminUser;
  const isLoading = state.isLoading;

  return {
    adminUser,
    isAuthenticated,
    isLoading
  };
}
