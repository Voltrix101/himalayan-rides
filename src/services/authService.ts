import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
  AuthErrorCodes
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  addDoc
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import toast from 'react-hot-toast';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  region: string;
  isAuthenticated: boolean;
  createdAt?: Date;
  lastLoginAt?: Date;
}

export interface TripBooking {
  id: string;
  tripPlanId: string;
  userId: string;
  tripDetails: {
    id: string;
    title: string;
    type: 'tour' | 'vehicle' | 'experience';
    price: number;
    duration?: string;
    image?: string;
    description?: string;
  };
  paymentInfo: {
    paymentId: string;
    orderId?: string;
    amount: number;
    currency: string;
    status: string;
    paidAt: Date;
  };
  bookingDetails: {
    startDate: Date;
    endDate?: Date;
    participantCount: number;
    participants: Array<{
      name: string;
      age: string;
      phone: string;
      email: string;
      idType: string;
      idNumber: string;
    }>;
    primaryContact: {
      name: string;
      phone: string;
      email: string;
    };
    emergencyContact: {
      name: string;
      phone: string;
    };
    specialRequests?: string;
  };
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: Date;
}

class AuthService {
  // Sign in with automatic account creation for new users
  async signInWithAutoCreate(email: string, password: string, userData?: {
    name: string;
    phone: string;
    region: string;
  }): Promise<User> {
    try {
      // First, try to sign in existing user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Update last login time
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          lastLoginAt: serverTimestamp()
        }, { merge: true });
        
        toast.success(`Welcome back, ${userData.name}!`);
        
        return {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: userData.name,
          phone: userData.phone,
          region: userData.region,
          isAuthenticated: true,
          lastLoginAt: new Date()
        };
      } else {
        throw new Error('User data not found in database');
      }
    } catch (error: any) {
      // If user doesn't exist, create a new account
      if (error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/invalid-credential' ||
          error.code === AuthErrorCodes.INVALID_EMAIL) {
        
        if (!userData) {
          throw new Error('User data required for account creation');
        }
        
        return await this.createAccount(email, password, userData);
      }
      
      // Re-throw other errors
      throw error;
    }
  }

  // Create new account
  async createAccount(email: string, password: string, userData: {
    name: string;
    phone: string;
    region: string;
  }): Promise<User> {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update display name
      await updateProfile(firebaseUser, {
        displayName: userData.name
      });
      
      // Create user document in Firestore
      const user: Omit<User, 'isAuthenticated'> = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: userData.name,
        phone: userData.phone,
        region: userData.region,
        createdAt: new Date(),
        lastLoginAt: new Date()
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...user,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      });
      
      toast.success(`Welcome to Himalayan Rides, ${userData.name}!`);
      
      return {
        ...user,
        isAuthenticated: true
      };
    } catch (error: any) {
      console.error('Error creating account:', error);
      
      let errorMessage = 'Failed to create account';
      if (error.code === AuthErrorCodes.EMAIL_EXISTS) {
        errorMessage = 'An account with this email already exists';
      } else if (error.code === AuthErrorCodes.WEAK_PASSWORD) {
        errorMessage = 'Password should be at least 6 characters';
      } else if (error.code === AuthErrorCodes.INVALID_EMAIL) {
        errorMessage = 'Invalid email address';
      }
      
      throw new Error(errorMessage);
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      throw new Error('Failed to sign out');
    }
  }

  // Get current user
  getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        unsubscribe();
        
        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              resolve({
                id: firebaseUser.uid,
                email: firebaseUser.email!,
                name: userData.name,
                phone: userData.phone,
                region: userData.region,
                isAuthenticated: true,
                createdAt: userData.createdAt?.toDate(),
                lastLoginAt: userData.lastLoginAt?.toDate()
              });
            } else {
              resolve(null);
            }
          } catch (error) {
            console.error('Error getting user data:', error);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            callback({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: userData.name,
              phone: userData.phone,
              region: userData.region,
              isAuthenticated: true,
              createdAt: userData.createdAt?.toDate(),
              lastLoginAt: userData.lastLoginAt?.toDate()
            });
          } else {
            callback(null);
          }
        } catch (error) {
          console.error('Error getting user data:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  // Save trip booking to Firestore
  async saveTrip(tripBooking: Omit<TripBooking, 'id' | 'createdAt'>): Promise<string> {
    try {
      const tripRef = await addDoc(collection(db, 'trips'), {
        ...tripBooking,
        createdAt: serverTimestamp(),
        bookingDetails: {
          ...tripBooking.bookingDetails,
          startDate: tripBooking.bookingDetails.startDate,
          endDate: tripBooking.bookingDetails.endDate || null
        },
        paymentInfo: {
          ...tripBooking.paymentInfo,
          paidAt: tripBooking.paymentInfo.paidAt
        }
      });
      
      return tripRef.id;
    } catch (error) {
      console.error('Error saving trip:', error);
      throw new Error('Failed to save trip booking');
    }
  }

  // Get user trips from Firestore
  async getUserTrips(userId: string): Promise<TripBooking[]> {
    try {
      const tripsQuery = query(
        collection(db, 'trips'),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(tripsQuery);
      const trips: TripBooking[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        trips.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          paymentInfo: {
            ...data.paymentInfo,
            paidAt: data.paymentInfo.paidAt?.toDate() || new Date()
          },
          bookingDetails: {
            ...data.bookingDetails,
            startDate: data.bookingDetails.startDate?.toDate() || new Date(),
            endDate: data.bookingDetails.endDate?.toDate() || null
          }
        } as TripBooking);
      });
      
      // Sort by creation date (newest first)
      trips.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return trips;
    } catch (error) {
      console.error('Error getting user trips:', error);
      throw new Error('Failed to load trips');
    }
  }

  // Send password reset email
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent');
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      
      let errorMessage = 'Failed to send password reset email';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address';
      } else if (error.code === AuthErrorCodes.INVALID_EMAIL) {
        errorMessage = 'Invalid email address';
      }
      
      throw new Error(errorMessage);
    }
  }
}

export const authService = new AuthService();
