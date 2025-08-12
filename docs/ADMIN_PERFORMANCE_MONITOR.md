# Admin Performance Monitor Setup

## Overview
The Performance Monitor is now restricted to admin users only for security and performance reasons.

## Admin Configuration

### Environment Variables
Admin emails are configured in the `.env` file:
```env
VITE_ADMIN_EMAIL_1=amritob0327.roy@gmail.com
VITE_ADMIN_EMAIL_2=amritoballavroy@gmail.com
```

### How It Works

1. **Admin Detection**: The `adminUtils.ts` utility checks if the current user's email matches any of the configured admin emails.

2. **Performance Monitor Display**: The `PerformanceDisplay` component only renders when:
   - The app is in development mode (`process.env.NODE_ENV === 'development'`)
   - The current user is authenticated and is an admin (`isCurrentUserAdmin(user)`)

3. **Components Updated**:
   - `App.tsx` - Main app component
   - `App-clean.tsx` - Clean version of app
   - `AdminStatusIndicator.tsx` - Development helper to show admin status

### Admin Login

To see the performance monitor:

1. **Log in as admin** using one of the configured admin emails:
   - `amritob0327.roy@gmail.com`
   - `amritoballavroy@gmail.com`

2. **Use the AdminLoginHelper** component if you need to create/login admin accounts

3. **Check the bottom-right corner** - Performance monitor will appear only for admin users

### Development Status Indicator

In development mode, an `AdminStatusIndicator` appears in the bottom-left corner showing:
- Current user email
- Admin status (Yes/No)
- Whether performance monitor is visible

### Security Benefits

- **Reduced Performance Impact**: Only admin users see the performance overlay
- **Cleaner UI**: Regular users don't see debug information
- **Role-Based Access**: Clear separation between admin and user features
- **Environment Awareness**: Only works in development mode

### Files Modified

```
src/
├── utils/adminUtils.ts              # New: Admin utility functions
├── components/AdminStatusIndicator.tsx  # New: Development status indicator
├── App.tsx                          # Updated: Admin-only performance monitor
└── App-clean.tsx                    # Updated: Admin-only performance monitor
```

### Testing

1. **Without Admin Login**: Performance monitor hidden
2. **With Admin Login**: Performance monitor visible in bottom-right
3. **Status Check**: Bottom-left indicator shows admin status

This ensures that only authorized users can access performance debugging tools while maintaining a clean experience for regular users.
