/**
 * Admin utility functions for role-based access control
 */
import { ALLOWED_ADMIN_EMAILS, isAdminEmail } from '../constants/admin';

/**
 * Check if a user email is an admin
 * @param email - User email to check
 * @returns boolean indicating if user is admin
 */
export const isAdminUser = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return isAdminEmail(email.toLowerCase());
};

/**
 * Check if current authenticated user is admin
 * @param user - User object with email property
 * @returns boolean indicating if user is admin
 */
export const isCurrentUserAdmin = (user: any): boolean => {
  // Check temporary admin access for testing
  if (sessionStorage.getItem('tempAdminAccess') === 'true') {
    return true;
  }
  
  // Check email-based admin access using Firebase admin emails
  return user?.email ? isAdminUser(user.email) : false;
};

/**
 * Get list of admin emails (for debugging purposes)
 * @returns Array of admin email addresses
 */
export const getAdminEmails = (): string[] => {
  return [...ALLOWED_ADMIN_EMAILS];
};

/**
 * Clear temporary admin access
 */
export const clearTempAdminAccess = (): void => {
  sessionStorage.removeItem('tempAdminAccess');
};
