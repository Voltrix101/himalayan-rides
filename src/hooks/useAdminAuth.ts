import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { isAdminEmail, ALLOWED_ADMIN_EMAILS } from '../constants/admin';
import { User } from '../types';

export interface AdminUser extends User {
  isAdmin: boolean;
}

export function useAdminAuth() {
  const { user, isLoading } = useAuth();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setIsAdminLoading(true);
      return;
    }

    if (!user) {
      setAdminUser(null);
      setAccessDenied(false);
      setIsAdminLoading(false);
      return;
    }

    // Check if user email is in admin whitelist
    const isAdmin = isAdminEmail(user.email);
    
    if (isAdmin) {
      setAdminUser({
        ...user,
        isAdmin: true
      });
      setAccessDenied(false);
    } else {
      setAdminUser(null);
      setAccessDenied(true);
    }
    
    setIsAdminLoading(false);
  }, [user, isLoading]);

  return {
    adminUser,
    isAdminLoading,
    accessDenied,
    isAuthenticated: !!adminUser,
    allowedEmails: ALLOWED_ADMIN_EMAILS
  };
}
