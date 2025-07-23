# 🔥 Firebase Setup Guide for Himalayan Rides

## Step 1: Create Firebase Project

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Click "Create a project"**
3. **Project name**: `Himalayan Rides` (or your preferred name)
4. **Enable Google Analytics**: Optional (recommended for analytics)
5. **Click "Create project"**

## Step 2: Enable Authentication

1. **Go to Authentication** → **Get started**
2. **Sign-in method** tab
3. **Enable Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

## Step 3: Enable Firestore Database

1. **Go to Firestore Database** → **Create database**
2. **Security rules**: Start in **test mode** for now
3. **Location**: Choose closest to your region (e.g., `asia-south1` for India)
4. **Click "Done"**

## Step 4: Get Firebase Configuration

1. **Go to Project Settings** (gear icon) → **General** tab
2. **Your apps** section → **Add app** → **Web** (</> icon)
3. **App nickname**: `Himalayan Rides Web`
4. **Also set up Firebase Hosting**: Leave unchecked for now
5. **Click "Register app"**
6. **Copy the Firebase config object**

## Step 5: Update Your Firebase Config

Replace the config in `src/config/firebase.ts`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDYk-cCgU4FY1lzR9HZ7mJpuf_P7ikXAXI",
  authDomain: "himalayan-rides-1e0ef.firebaseapp.com",
  projectId: "himalayan-rides-1e0ef",
  storageBucket: "himalayan-rides-1e0ef.firebasestorage.app",
  messagingSenderId: "1008189932805",
  appId: "1:1008189932805:web:e99e87b64154208b62a36c",
  measurementId: "G-SC1RVCKTX9"
};
```

✅ **DONE! Your Firebase config has been updated!**

## Step 6: Configure Firestore Security Rules

1. **Go to Firestore Database** → **Rules** tab
2. **Replace the rules** with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own trips
    match /trips/{tripId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Allow users to read/write their own user data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to create trips
    match /trips/{tripId} {
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

3. **Click "Publish"**

## Step 7: Test the Setup

1. **Start your development server**: `npm run dev`
2. **Open your app**: http://localhost:5176
3. **Try to sign up/login**:
   - Click "Sign In" button
   - Enter any email and password
   - The system will auto-create an account
4. **Test booking flow**:
   - Browse tours/vehicles
   - Make a test booking
   - Check "Your Trips" page

## Step 8: Production Security (Important!)

Before going live, update Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Trips: Users can only access their own trips
    match /trips/{tripId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Users: Can only access their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

## Current Features Working:

✅ **Auto Account Creation**: No manual signup needed  
✅ **Trip Booking**: Complete booking flow with Firebase storage  
✅ **Payment Integration**: Razorpay with demo mode fallback  
✅ **Your Trips**: View all bookings with PDF download  
✅ **Authentication**: Proper login/logout functionality  
✅ **Data Persistence**: All trips stored in Firestore  

## Troubleshooting:

### Authentication Issues
- Check if Email/Password is enabled in Firebase Console
- Verify firebaseConfig is correctly set

### Database Issues  
- Ensure Firestore is created and rules are published
- Check browser console for permission errors

### Payment Issues
- Razorpay will work in demo mode without setup
- For production, get real Razorpay credentials

## Next Steps:

1. **Update Firebase config** with your project details
2. **Test the complete flow** from booking to trip viewing
3. **Customize the app** (branding, content, pricing)
4. **Set up production Razorpay** for real payments
5. **Deploy to production** when ready

---

**🎯 Your app is now a fully functional booking platform!**
