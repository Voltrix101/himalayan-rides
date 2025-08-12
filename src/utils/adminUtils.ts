/**
 * Admin utility functions for role-based access control
 */

const ADMIN_EMAILS = [
  import.meta.env.VITE_ADMIN_EMAIL_1,
  import.meta.env.VITE_ADMIN_EMAIL_2,
].filter(Boolean); // Remove any undefined values

/**
 * Check if a user email is an admin
 * @param email - User email to check
 * @returns boolean indicating if user is admin
 */
export const isAdminUser = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

/**
 * Check if current authenticated user is admin
 * @param user - User object with email property
 * @returns boolean indicating if user is admin
 */
export const isCurrentUserAdmin = (user: any): boolean => {
  return user?.email ? isAdminUser(user.email) : false;
};

/**
 * Get list of admin emails (for debugging purposes)
 * @returns Array of admin email addresses
 */
export const getAdminEmails = (): string[] => {
  return [...ADMIN_EMAILS];
};
