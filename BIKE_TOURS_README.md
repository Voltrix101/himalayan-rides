# 🏍️ Himalayan Rides - Bike Tour Planning System

A comprehensive bike tour planning platform for Ladakh adventures with real-time Firebase sync, admin CRUD operations, and Google Sign-In authentication.

## 🚀 Features Implemented

### ✅ Bike Tour Planning System
- **7, 10, and 15-day Ladakh bike tour plans** with detailed itineraries
- **Real-time Firebase sync** for live updates across all users
- **Comprehensive tour data** including difficulty levels, pricing, highlights, and day-by-day breakdowns
- **Permit requirements** and inclusions/exclusions for each tour
- **Interactive tour selector** with filtering by duration and difficulty

### ✅ Firebase Integration
- **Real-time database sync** using Firestore
- **Automatic data initialization** with default tour plans
- **CRUD operations** for tour plan management
- **Search and filtering** capabilities
- **Bulk operations** for efficient data management

### ✅ Authentication System
- **Google Sign-In** integration
- **Email/password authentication**
- **User profile management** with Firestore sync
- **Admin role management** and permissions
- **Password reset functionality**

### ✅ Admin Panel
- **Complete CRUD operations** for bike tour plans
- **Real-time tour plan management** with live updates
- **Search and filtering** tools for administrators
- **Tour plan creation/editing** with comprehensive forms
- **Admin-only access control** with role-based permissions

### ✅ Performance Optimizations
- **Lazy loading** for all components
- **Optimized renders** with React.memo and useCallback
- **Intersection Observer** for scroll optimizations
- **Image optimization** with progressive loading
- **Performance monitoring** hooks

## 🏗️ System Architecture

### Frontend Components
```
src/
├── components/
│   ├── bike-tours/
│   │   └── BikeTourPlanSelector.tsx     # Main tour selection interface
│   ├── admin/
│   │   └── AdminBikeTourPanel.tsx       # Admin CRUD operations
│   ├── explore/
│   │   └── OptimizedExploreLadakh.tsx   # Enhanced explore component
│   └── ui/
│       ├── UniversalModal.tsx           # Centralized modal system
│       └── GlassCard.tsx               # Reusable glass morphism cards
├── data/
│   └── bikeTourPlans.ts                # Comprehensive tour data structure
├── services/
│   ├── bikeTourPlanService.ts          # Firebase CRUD operations
│   └── authService.ts                  # Authentication management
├── context/
│   └── AuthContext.tsx                 # Authentication state management
└── utils/
    └── firebase.ts                     # Firebase configuration
```

### Data Structure
```typescript
interface BikeTourPlan {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  price: number;
  highlights: string[];
  itinerary: BikeItineraryDay[];
  includes: string[];
  excludes: string[];
  permits: string[];
  created_at?: any;
  updated_at?: any;
}

interface BikeItineraryDay {
  day: number;
  title: string;
  description: string;
  accommodation: string;
  meals: string[];
  activities: string[];
  distance?: string;
  altitude?: string;
}
```

## 🛠️ Setup Instructions

### 1. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Add your Firebase configuration
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

### 2. Firebase Setup
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** with Google Sign-In provider
3. Enable **Firestore Database** in production mode
4. Configure **Security Rules** for Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone can read bike tour plans
    match /bikeTourPlans/{planId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Admin-only collections
    match /{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

### 3. Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎯 Usage Guide

### For Users
1. **Browse Tours**: Visit `/bike-tours` to explore available Ladakh bike tour plans
2. **Filter Options**: Use duration (7/10/15 days) and difficulty filters
3. **Tour Details**: View comprehensive itineraries, pricing, and inclusions
4. **Authentication**: Sign in with Google or email to book tours
5. **Booking**: Select a tour plan to proceed with booking

### For Administrators
1. **Admin Access**: Navigate to `/admin/bike-tours` (admin access required)
2. **Tour Management**: Create, edit, view, and delete bike tour plans
3. **Real-time Updates**: Changes sync instantly across all users
4. **Search & Filter**: Use advanced search and filtering tools
5. **Bulk Operations**: Initialize default plans or perform bulk updates

## 🔧 API Services

### BikeTourPlanService
```typescript
// Real-time subscription
BikeTourPlanService.subscribeToBikeTourPlans(callback)

// CRUD operations
BikeTourPlanService.createBikeTourPlan(plan)
BikeTourPlanService.updateBikeTourPlan(id, updates)
BikeTourPlanService.deleteBikeTourPlan(id)
BikeTourPlanService.getAllBikeTourPlans()

// Advanced queries
BikeTourPlanService.searchBikeTourPlans(searchTerm)
BikeTourPlanService.getPlansByDifficulty(difficulty)
BikeTourPlanService.getPlansByDuration(minDays, maxDays)
```

### AuthService
```typescript
// Authentication
authService.signInWithGoogle()
authService.signInWithAutoCreate(email, password, userData)
authService.signOut()

// User management
authService.getCurrentUser()
authService.onAuthStateChange(callback)
authService.resetPassword(email)
```

## 🎨 UI Components

### BikeTourPlanSelector
- **Responsive grid layout** with filter controls
- **Interactive cards** with tour details and selection
- **Real-time updates** from Firebase
- **Loading states** and error handling

### AdminBikeTourPanel
- **Complete admin interface** for tour management
- **Search and filtering** capabilities
- **Inline editing** and deletion with confirmation
- **Real-time data sync** with live updates

## 📱 Responsive Design
- **Mobile-first approach** with responsive breakpoints
- **Touch-friendly interface** for mobile devices
- **Glass morphism design** with modern aesthetics
- **Smooth animations** and transitions

## 🔒 Security Features
- **Role-based access control** for admin functions
- **Firebase security rules** for data protection
- **Input validation** and sanitization
- **Secure authentication** with Google OAuth

## 🚀 Performance Optimizations
- **Lazy loading** for code splitting
- **Memoized components** to prevent unnecessary re-renders
- **Optimized Firebase queries** with pagination and caching
- **Image optimization** with progressive loading
- **Real-time performance monitoring**

## 📈 Future Enhancements
- [ ] Payment integration for tour bookings
- [ ] Tour availability calendar system
- [ ] Customer review and rating system
- [ ] Tour guide assignment and management
- [ ] Multi-language support
- [ ] Mobile app development
- [ ] Advanced analytics dashboard

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for Himalayan Adventures**

*Experience the thrill of Ladakh's majestic landscapes with our expertly crafted bike tour plans.*
