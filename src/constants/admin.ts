// Admin email whitelist - centralized configuration
export const ALLOWED_ADMIN_EMAILS = [
  'amritob0327.roy@gmail.com',
  'amritoballavroy@gmail.com'
];

// Check if an email is in the admin whitelist
export const isAdminEmail = (email?: string): boolean => {
  return ALLOWED_ADMIN_EMAILS.includes(email || '');
};
