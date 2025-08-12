# 🔥 Firebase Setup Guide for Himalayan Rides Admin Dashboard

This guide covers the complete Firebase setup required for your admin dashboard to work properly.

## 📋 Prerequisites

1. **Firebase Project**: `himalayan-rides-1e0ef` (already configured)
2. **Firebase Services**: Authentication, Firestore Database
3. **Admin Emails**: `amritob0327.roy@gmail.com`, `amritoballavroy@gmail.com`

## 🏗️ Firebase Console Setup

### 1. Authentication Setup

#### Enable Email/Password Authentication:
1. Go to [Firebase Console](https://console.firebase.google.com/project/himalayan-rides-1e0ef)
2. Navigate to **Authentication** → **Sign-in method**
3. Enable **Email/Password** provider
4. **Important**: Enable "Email link (passwordless sign-in)" if you want
5. Set **Authorized domains** (add your deployment domain when ready)

#### Email Templates (Optional but Recommended):
1. Go to **Authentication** → **Templates**
2. Customize **Password reset** email template
3. Customize **Email address verification** template
4. Set your app name: "Himalayan Rides"

### 2. Firestore Database Setup

#### Create Database:
1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** (recommended for live app)
4. Select your preferred location (asia-south1 for India)

#### Required Collections Structure:
```
firestore/
├── users/                    # User profiles and data
│   └── {userId}/
│       ├── email: string
│       ├── name: string
│       ├── phone: string
│       ├── region: string
│       ├── createdAt: timestamp
│       └── isBlocked: boolean
│
├── bookings/                 # All booking data
│   └── {bookingId}/
│       ├── userId: string
│       ├── vehicleId: string
│       ├── customerName: string
│       ├── customerEmail: string
│       ├── customerPhone: string
│       ├── startDate: timestamp
│       ├── endDate: timestamp
│       ├── totalAmount: number
│       ├── status: string    # pending, confirmed, active, completed, cancelled
│       ├── paymentId: string
│       ├── createdAt: timestamp
│       └── notes: string
│
├── vehicles/                 # Vehicle fleet data
│   └── {vehicleId}/
│       ├── name: string
│       ├── type: string      # bike, car, suv
│       ├── region: string
│       ├── pricePerDay: number
│       ├── image: string
│       ├── features: array
│       ├── specifications: object
│       ├── isAvailable: boolean
│       └── createdAt: timestamp
│
└── revenue/                  # Revenue and payment tracking
    └── {revenueId}/
        ├── bookingId: string
        ├── amount: number
        ├── paymentId: string
        ├── paymentMethod: string
        ├── status: string
        ├── date: timestamp
        └── destination: string
```

## 🔐 Firestore Security Rules

**CRITICAL**: Set up proper security rules to protect admin data.

Go to **Firestore Database** → **Rules** and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin emails whitelist
    function isAdmin() {
      return request.auth != null && 
        request.auth.token.email in [
          'amritob0327.roy@gmail.com',
          'amritoballavroy@gmail.com'
        ];
    }
    
    // Users collection - admin full access, users can read/write their own data
    match /users/{userId} {
      allow read, write: if isAdmin();
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Bookings collection - admin full access, users can read their bookings
    match /bookings/{bookingId} {
      allow read, write: if isAdmin();
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    // Vehicles collection - admin full access, all users can read
    match /vehicles/{vehicleId} {
      allow read: if true; // Public read for vehicle listings
      allow write: if isAdmin();
    }
    
    // Revenue collection - admin only
    match /revenue/{revenueId} {
      allow read, write: if isAdmin();
    }
    
    // Admin-specific collections (add as needed)
    match /admin/{document=**} {
      allow read, write: if isAdmin();
    }
  }
}
```

## 🚀 Environment Variables

Create a `.env` file in your project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyDYk-cCgU4FY1lzR9HZ7mJpuf_P7ikXAXI
VITE_FIREBASE_AUTH_DOMAIN=himalayan-rides-1e0ef.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=himalayan-rides-1e0ef
VITE_FIREBASE_STORAGE_BUCKET=himalayan-rides-1e0ef.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1008189932805
VITE_FIREBASE_APP_ID=1:1008189932805:web:e99e87b64154208b62a36c
VITE_FIREBASE_MEASUREMENT_ID=G-SC1RVCKTX9

# Admin Configuration
VITE_ADMIN_EMAIL_1=amritob0327.roy@gmail.com
VITE_ADMIN_EMAIL_2=amritoballavroy@gmail.com

# Payment Configuration (if using Razorpay)
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

## 📊 Sample Data Setup

### Create Admin User Accounts:

1. **Register Admin Accounts**:
   - Go to your app: `http://localhost:5174`
   - Register with `amritob0327.roy@gmail.com`
   - Register with `amritoballavroy@gmail.com`
   - Both will automatically redirect to admin dashboard

### Add Sample Data (Optional):

#### Sample Vehicles:
```javascript
// Add to Firestore vehicles collection
{
  name: "Royal Enfield Classic 350",
  type: "bike",
  region: "Leh-Ladakh",
  pricePerDay: 1500,
  image: "https://example.com/bike1.jpg",
  features: ["ABS", "Electric Start", "USB Charging"],
  specifications: {
    engine: "349cc",
    mileage: "35-40 kmpl",
    fuelCapacity: "13.5L"
  },
  isAvailable: true,
  createdAt: new Date()
}
```

#### Sample Bookings:
```javascript
// Add to Firestore bookings collection
{
  userId: "user123",
  vehicleId: "vehicle123",
  customerName: "John Doe",
  customerEmail: "john@example.com",
  customerPhone: "+91-9876543210",
  startDate: new Date("2025-08-01"),
  endDate: new Date("2025-08-07"),
  totalAmount: 10500,
  status: "confirmed",
  paymentId: "pay_123456",
  createdAt: new Date(),
  notes: "6-day Ladakh tour"
}
```

## 🔧 Admin Dashboard Features Data Requirements

### For Dashboard Stats:
- **Total Bookings**: Count from `bookings` collection
- **Total Users**: Count from `users` collection  
- **Total Revenue**: Sum from `revenue` collection
- **Active Trips**: Count where `status = 'active'`

### For Bookings Management:
- **All Bookings**: Read from `bookings` collection
- **Update Status**: Write to `bookings/{id}`
- **Customer Details**: Join with `users` collection

### For User Management:
- **All Users**: Read from `users` collection
- **Block/Unblock**: Update `isBlocked` field
- **User Stats**: Count user bookings

### For Vehicle Management:
- **Fleet Data**: Read/Write `vehicles` collection
- **Add/Edit/Delete**: Full CRUD on vehicles
- **Availability**: Toggle `isAvailable` field

### For Revenue Analytics:
- **Payment Data**: Read from `revenue` collection
- **Monthly Stats**: Query by date ranges
- **Top Destinations**: Group by destination field

## 🎯 Testing Checklist

### ✅ Authentication Tests:
- [ ] Admin emails can log in and access dashboard
- [ ] Non-admin emails get "Access Denied"
- [ ] Auto-redirect works after admin login
- [ ] Session persistence works

### ✅ Firestore Tests:
- [ ] Can read/write bookings data
- [ ] Can read/write vehicles data
- [ ] Can read/write users data
- [ ] Security rules block unauthorized access

### ✅ Admin Dashboard Tests:
- [ ] Dashboard loads with correct stats
- [ ] Bookings page shows data
- [ ] Users page shows user list
- [ ] Vehicles page allows CRUD operations
- [ ] Revenue page shows financial data

## 🚨 Security Best Practices

1. **Never expose Firebase config in client**: Use environment variables
2. **Implement proper Firestore rules**: Restrict admin-only operations
3. **Use HTTPS in production**: Secure data transmission
4. **Regular security audits**: Check Firebase security tab
5. **Monitor usage**: Watch for unusual activity in Firebase console

## 🎛️ Production Deployment

### Before going live:
1. **Update Firestore rules** for production
2. **Add production domain** to Firebase authorized domains
3. **Set up Firebase hosting** (optional)
4. **Configure environment variables** for production
5. **Test with real payment gateway** (Razorpay)

## 📞 Support Resources

- **Firebase Console**: https://console.firebase.google.com/project/himalayan-rides-1e0ef
- **Firebase Documentation**: https://firebase.google.com/docs
- **Firestore Security Rules**: https://firebase.google.com/docs/firestore/security/get-started
- **Firebase Auth Guide**: https://firebase.google.com/docs/auth

---

**🎯 Your Firebase setup is ready!** 
The admin dashboard will work seamlessly with this configuration.

**Next Steps:**
1. Set up Firestore security rules
2. Create admin user accounts
3. Add sample data (optional)
4. Test all admin features

*Built for Himalayan Rides - Secure, Scalable, Professional* 🏔️
