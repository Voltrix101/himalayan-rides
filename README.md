# 🏔️ Himalayan Rides - Adventure Booking Platform

A modern, full-stack web application for booking adventure tours, vehicles, and experiences in the Himalayas. Built with React, TypeScript, Firebase, and modern web technologies.

![Himalayan Rides](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Firebase](https://img.shields.io/badge/Firebase-10.x-orange)
![Vite](https://img.shields.io/badge/Vite-5.x-purple)

## 🌟 Features

### 🎯 **Core Functionality**
- **Multi-category Booking**: Tours, vehicles, and experiences
- **Smart Authentication**: Auto-account creation with Firebase
- **Payment Integration**: Razorpay with demo mode fallback
- **Trip Management**: View, track, and download trip vouchers
- **PDF Generation**: Professional trip vouchers with company branding

### 🎨 **User Experience**
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Smooth Animations**: Framer Motion for seamless transitions
- **Glass Morphism UI**: Modern design with transparency effects
- **Real-time Notifications**: Toast notifications for user feedback
- **Progressive Enhancement**: Works offline with localStorage fallback

### 🔧 **Technical Features**
- **TypeScript**: Full type safety and better developer experience
- **Firebase Integration**: Authentication, Firestore database, real-time updates
- **Modern React**: Hooks, Context API, and functional components
- **Hot Module Replacement**: Instant development feedback with Vite
- **ESLint & Prettier**: Code quality and formatting

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Firebase Project** (free tier sufficient)
- **Modern web browser**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Voltrix101/himalayan-rides.git
cd himalayan-rides
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Firebase** (see [Firebase Setup Guide](./FIREBASE_SETUP.md))
   - Create Firebase project
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Update `src/config/firebase.ts` with your config

4. **Start development server**
```bash
npm run dev
```

5. **Open your browser**
```
http://localhost:5173
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── booking/        # Booking flow components
│   ├── dashboard/      # User dashboard
│   ├── explore/        # Tour exploration
│   ├── fleet/          # Vehicle fleet
│   ├── home/           # Homepage components
│   ├── layout/         # Layout components
│   ├── tours/          # Tour components
│   ├── trips/          # Trip management
│   └── ui/             # Reusable UI components
├── config/             # Configuration files
│   └── firebase.ts     # Firebase configuration
├── context/            # React Context providers
├── data/               # Mock data and constants
├── hooks/              # Custom React hooks
├── services/           # API services and utilities
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🔥 Firebase Setup

### Quick Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project: "Himalayan Rides"
3. Enable Authentication → Email/Password
4. Create Firestore Database → Start in test mode
5. Get Firebase config from Project Settings
6. Update `src/config/firebase.ts`

For detailed instructions, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript compiler |

## 🎮 Usage Guide

### For Users
1. **Sign Up**: Create account with email, password, and region
2. **Explore**: Browse tours, vehicles, and experiences
3. **Book**: Complete 3-step booking process
4. **Pay**: Secure payment with Razorpay (demo mode available)
5. **Manage**: View all trips in "Your Trips" section
6. **Download**: Get PDF vouchers for confirmed bookings

### For Developers
1. **Authentication**: Firebase handles user management
2. **Data Storage**: Trips stored in Firestore with local fallback
3. **Payments**: Razorpay integration with error handling
4. **PDF Generation**: jsPDF + html2canvas for voucher creation
5. **Responsive**: Mobile-first design with Tailwind CSS

## 🔌 Integrations

### 🔐 **Authentication**
- Firebase Authentication
- Auto-account creation
- Password reset functionality
- Session management

### 💳 **Payments**
- Razorpay payment gateway
- Demo mode for testing
- Secure transaction handling
- Payment status tracking

### 🗄️ **Database**
- Firestore for production data
- localStorage for offline functionality
- Real-time data synchronization
- User-specific data isolation

### 📄 **PDF Generation**
- Professional trip vouchers
- Company branding
- Trip details and QR codes
- Download and print ready

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Framer Motion** for animations

### Backend
- **Firebase Functions** (ready for expansion)
- **Firestore** for data storage
- **Firebase Auth** for user management
- **Firebase Hosting** (deployment ready)

### State Management
- **React Context** for global state
- **Custom hooks** for logic separation
- **Local storage** for persistence
- **Firebase listeners** for real-time updates

## 🌍 Supported Regions

The platform supports users from all Indian states and union territories:

**Northern India**: Jammu & Kashmir, Ladakh, Himachal Pradesh, Uttarakhand, Punjab, Haryana, Delhi, Uttar Pradesh

**Western India**: Rajasthan, Gujarat, Maharashtra, Goa

**Central India**: Madhya Pradesh, Chhattisgarh

**Eastern India**: West Bengal, Bihar, Jharkhand, Odisha

**Northeastern India**: All 8 northeastern states

**Southern India**: Andhra Pradesh, Telangana, Karnataka, Kerala, Tamil Nadu

**Union Territories**: All UTs including Andaman & Nicobar, Puducherry

**International**: Option for international users

## 🔒 Security

- **Firebase Security Rules**: User data isolation
- **Input Validation**: Client and server-side validation
- **HTTPS Only**: Secure data transmission
- **Authentication Required**: Protected routes and data
- **Payment Security**: PCI compliant payment processing

## 📱 Responsive Design

- **Mobile First**: Optimized for smartphones
- **Tablet Friendly**: Perfect iPad and tablet experience
- **Desktop Enhanced**: Full desktop functionality
- **Cross Browser**: Works on all modern browsers

## 🚀 Deployment

### Firebase Hosting (Recommended)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

### Other Platforms
- **Vercel**: Connect GitHub repo for auto-deployment
- **Netlify**: Drag and drop build folder
- **GitHub Pages**: Use GitHub Actions workflow

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Voltrix101**
- GitHub: [@Voltrix101](https://github.com/Voltrix101)
- Project: [Himalayan Rides](https://github.com/Voltrix101/himalayan-rides)

## 🎯 Future Enhancements

- [ ] **Real-time Chat**: Customer support integration
- [ ] **Multi-language**: Hindi and regional language support
- [ ] **Weather Integration**: Real-time weather updates
- [ ] **Map Integration**: Google Maps for route planning
- [ ] **Social Features**: Trip sharing and reviews
- [ ] **Mobile App**: React Native mobile application
- [ ] **Admin Dashboard**: Tour operator management panel
- [ ] **Analytics**: User behavior and booking insights

## 🆘 Support

For support and questions:

1. **Documentation**: Check [Firebase Setup Guide](./FIREBASE_SETUP.md)
2. **Issues**: Open GitHub issue for bugs
3. **Discussions**: Use GitHub Discussions for questions
4. **Email**: Contact through GitHub profile

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/Voltrix101/himalayan-rides)
![GitHub forks](https://img.shields.io/github/forks/Voltrix101/himalayan-rides)
![GitHub issues](https://img.shields.io/github/issues/Voltrix101/himalayan-rides)
![GitHub license](https://img.shields.io/github/license/Voltrix101/himalayan-rides)

---

**Made with ❤️ for adventure enthusiasts exploring the majestic Himalayas**

*Experience the mountains like never before with Himalayan Rides - your gateway to unforgettable adventures!*
