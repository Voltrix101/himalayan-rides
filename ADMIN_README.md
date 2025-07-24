# 🛡️ Himalayan Rides - Admin Dashboard

A secure, feature-rich admin panel for managing the Himalayan Rides tourism booking platform.

## 🔐 Security & Access

### Admin Authentication
- **Secure Firebase Authentication** integration
- **Email Whitelist Protection** - Only specific Gmail addresses allowed
- **Authorized Admin Emails:**
  - `amritob0327.roy@gmail.com`
  - `amritoballavroy@gmail.com`

### Access Control
- All admin routes protected with `PrivateAdminRoute` wrapper
- Unauthorized users see full-screen "Access Denied" page
- Automatic redirect for non-admin users
- Session management with Firebase Auth

## 🚀 Quick Start

### Accessing Admin Dashboard
1. **Navigate to**: `http://localhost:5174/admin`
2. **Sign in** with authorized admin email
3. **Access** full admin functionality

### Alternative Access Method
1. Sign in to main application
2. Click **"Admin"** button in top navigation
3. Automatic redirect to admin dashboard

## 📊 Dashboard Features

### 🏠 Dashboard Home
- **Real-time Statistics**: Total bookings, users, active trips, revenue
- **Recent Bookings Table**: Latest customer bookings
- **Quick Overview**: Today's check-ins/check-outs
- **Performance Metrics**: Growth indicators

### 📋 Bookings Management
- **View All Bookings**: Comprehensive booking list
- **Search & Filter**: By customer, trip, or status
- **Status Management**: Update booking status (Pending/Confirmed/Active/Completed/Cancelled)
- **Download Vouchers**: Generate booking vouchers
- **Detailed View**: Full booking information modal

### 👥 Users Management
- **User Directory**: All registered users
- **User Statistics**: Total users, active users, booking counts
- **Search Functionality**: Find users by name, email, phone, region
- **User Actions**: View details, block/unblock users
- **User Analytics**: Booking history and spending

### 🚗 Vehicles Management
- **Fleet Overview**: All vehicles with images and specs
- **Add/Edit/Delete**: Full CRUD operations for vehicles
- **Vehicle Details**: Name, type, region, pricing, features
- **Availability Control**: Set vehicle availability status
- **Feature Management**: Add/remove vehicle features
- **Image Management**: Vehicle photo URLs

### 💰 Revenue Analytics
- **Total Revenue**: Real-time revenue tracking
- **Monthly Trends**: 6-month revenue charts
- **Growth Rate**: Month-over-month growth calculation
- **Top Destinations**: Revenue by destination
- **Recent Payments**: Latest transactions
- **Export Reports**: Download revenue data as CSV

## 🎨 Design & UX

### Glassmorphic UI
- **Translucent Cards**: Frosted glass effects with backdrop blur
- **Gradient Overlays**: Beautiful color transitions
- **Modern Aesthetics**: Professional admin interface

### Responsive Design
- **Mobile-First**: Fully responsive across all devices
- **Sidebar Navigation**: Collapsible on mobile
- **Touch-Friendly**: Optimized for touch interactions

### Animations
- **Framer Motion**: Smooth page transitions
- **Loading States**: Skeleton screens and animations
- **Interactive Elements**: Hover effects and micro-interactions

## 🛠️ Technical Architecture

### Frontend Stack
- **React 18**: Modern functional components
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Animation library

### Backend Integration
- **Firebase Firestore**: Real-time database
- **Firebase Auth**: Secure authentication
- **localStorage Fallback**: Offline functionality

### State Management
- **React Hooks**: useState, useEffect
- **Custom Hooks**: useAdminAuth for admin-specific logic
- **Context API**: Global state management

## 🔧 Configuration

### Firebase Setup
```typescript
// Admin email whitelist in useAdminAuth.ts
const ALLOWED_ADMIN_EMAILS = [
  'amritob0327.roy@gmail.com',
  'amritoballavroy@gmail.com'
];
```

### Firestore Security Rules
```javascript
// Recommended Firestore rules for admin access
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin-only collections
    match /bookings/{document} {
      allow read, write: if request.auth != null && 
        request.auth.token.email in [
          'amritob0327.roy@gmail.com',
          'amritoballavroy@gmail.com'
        ];
    }
    
    match /users/{document} {
      allow read, write: if request.auth != null && 
        request.auth.token.email in [
          'amritob0327.roy@gmail.com',
          'amritoballavroy@gmail.com'
        ];
    }
    
    match /vehicles/{document} {
      allow read: if true; // Public read for main app
      allow write: if request.auth != null && 
        request.auth.token.email in [
          'amritob0327.roy@gmail.com',
          'amritoballavroy@gmail.com'
        ];
    }
  }
}
```

## 📱 Usage Examples

### Adding a New Vehicle
1. Navigate to **Vehicles** page
2. Click **"Add Vehicle"** button
3. Fill in vehicle details form
4. Add features and specifications
5. Set availability status
6. Save to database

### Managing Bookings
1. Go to **Bookings** page
2. Use search/filter to find specific bookings
3. Click status dropdown to update booking status
4. Use **"View Details"** for complete booking info
5. **"Download Voucher"** for customer documentation

### Revenue Analysis
1. Open **Revenue** page
2. View real-time revenue statistics
3. Analyze monthly trends chart
4. Check top-performing destinations
5. Export data for external analysis

## 🔒 Security Best Practices

### Authentication
- ✅ Firebase Authentication integration
- ✅ Email whitelist validation
- ✅ Session management
- ✅ Automatic logout on unauthorized access

### Authorization
- ✅ Route-level protection
- ✅ Component-level access control
- ✅ API request validation
- ✅ Role-based permissions

### Data Protection
- ✅ Secure Firestore rules
- ✅ Input validation
- ✅ XSS prevention
- ✅ CSRF protection via Firebase

## 🎯 Future Enhancements

### Planned Features
- [ ] Advanced analytics dashboard
- [ ] Bulk operations for bookings
- [ ] Email notification system
- [ ] Advanced user role management
- [ ] API rate limiting
- [ ] Audit logs and activity tracking

### Performance Improvements
- [ ] Data pagination for large datasets
- [ ] Caching strategies
- [ ] Lazy loading for images
- [ ] Virtual scrolling for tables

## 📞 Support

For admin dashboard issues or access requests:
- **Email**: Contact authorized administrators
- **Documentation**: Refer to this README
- **Firebase Console**: Check authentication logs

---

**🏔️ Himalayan Rides Admin Dashboard** - Secure, Modern, Comprehensive Tourism Management Platform
