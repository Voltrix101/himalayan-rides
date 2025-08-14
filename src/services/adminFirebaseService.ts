import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where, 
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

// Types for admin CRUD operations
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  region?: string;
  totalBookings: number;
  totalSpent?: number;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: Timestamp;
  preferences?: {
    preferredVehicleType?: string;
    preferredRegions?: string[];
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'bike' | 'car' | 'suv';
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  features: string[];
  image: string;
  isAvailable: boolean;
  fuelType: 'petrol' | 'diesel' | 'electric';
  seatingCapacity: number;
  transmission: 'manual' | 'automatic';
  location: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Destination {
  id: string;
  name: string;
  description: string;
  image: string;
  altitude: string;
  bestTime: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  highlights: string[];
  distance: string;
  price: number;
  rating: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  accommodation: string;
  meals: string[];
  distance?: string;
  altitude?: string;
}

export interface BikeTour {
  id: string;
  name: string;
  description: string;
  region: string;
  duration: number; // in days
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Extreme';
  pricePerPerson: number;
  maxGroupSize: number;
  startLocation: string;
  endLocation: string;
  image: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  bestTime: string;
  termsAndConditions?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Experience {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string; // e.g., "2 Days", "5 Days"
  price: number;
  rating: number;
  category: 'Adventure' | 'Cultural' | 'Spiritual' | 'Photography';
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  maxGroupSize: number;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  bestTime: string;
  location: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'vehicle' | 'destination' | 'bikeTour';
  itemId: string;
  itemName: string;
  startDate: Timestamp;
  endDate: Timestamp;
  guests: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  specialRequests?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

class AdminFirebaseService {
  // Real-time listeners storage
  private listeners: Array<() => void> = [];

  // =============================================================================
  // USER MANAGEMENT
  // =============================================================================

  async getUsers(callback: (users: User[]) => void) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('👥 Fetched users snapshot, size:', snapshot.size);
        const users: User[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log('👤 User data:', { id: doc.id, ...data });
          users.push({ id: doc.id, ...data } as User);
        });
        console.log('👥 Total users processed:', users.length);
        callback(users);
      }, (error) => {
        console.error('❌ Error fetching users:', error);
        toast.error('Failed to fetch users');
      });

      this.listeners.push(unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error setting up users listener:', error);
      toast.error('Failed to setup users listener');
    }
  }

  async updateUser(userId: string, data: Partial<User>) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
      throw error;
    }
  }

  // =============================================================================
  // VEHICLE MANAGEMENT
  // =============================================================================

  async getVehicles(callback: (vehicles: Vehicle[]) => void) {
    try {
      const vehiclesRef = collection(db, 'vehicles');
      const q = query(vehiclesRef, orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('🚗 Fetched vehicles snapshot, size:', snapshot.size);
        const vehicles: Vehicle[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          vehicles.push({ id: doc.id, ...data } as Vehicle);
        });
        console.log('🚗 Total vehicles processed:', vehicles.length);
        callback(vehicles);
      }, (error) => {
        console.error('❌ Error fetching vehicles:', error);
        toast.error('Failed to fetch vehicles');
      });

      this.listeners.push(unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error setting up vehicles listener:', error);
      toast.error('Failed to setup vehicles listener');
    }
  }

  async createVehicle(vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const vehiclesRef = collection(db, 'vehicles');
      const docRef = await addDoc(vehiclesRef, {
        ...vehicleData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      toast.success('Vehicle created successfully');
      return docRef.id;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      toast.error('Failed to create vehicle');
      throw error;
    }
  }

  async updateVehicle(vehicleId: string, data: Partial<Vehicle>) {
    try {
      const vehicleRef = doc(db, 'vehicles', vehicleId);
      await updateDoc(vehicleRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      toast.success('Vehicle updated successfully');
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast.error('Failed to update vehicle');
      throw error;
    }
  }

  async deleteVehicle(vehicleId: string) {
    try {
      const vehicleRef = doc(db, 'vehicles', vehicleId);
      await deleteDoc(vehicleRef);
      toast.success('Vehicle deleted successfully');
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Failed to delete vehicle');
      throw error;
    }
  }

  // =============================================================================
  // DESTINATION MANAGEMENT
  // =============================================================================

  async getDestinations(callback: (destinations: Destination[]) => void) {
    const destinationsRef = collection(db, 'destinations');
    const q = query(destinationsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const destinations: Destination[] = [];
      snapshot.forEach((doc) => {
        destinations.push({ id: doc.id, ...doc.data() } as Destination);
      });
      callback(destinations);
    }, (error) => {
      console.error('Error fetching destinations:', error);
      toast.error('Failed to fetch destinations');
    });

    this.listeners.push(unsubscribe);
    return unsubscribe;
  }

  async createDestination(destinationData: Omit<Destination, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const destinationsRef = collection(db, 'destinations');
      const docRef = await addDoc(destinationsRef, {
        ...destinationData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      toast.success('Destination created successfully');
      return docRef.id;
    } catch (error) {
      console.error('Error creating destination:', error);
      toast.error('Failed to create destination');
      throw error;
    }
  }

  async updateDestination(destinationId: string, data: Partial<Destination>) {
    try {
      const destinationRef = doc(db, 'destinations', destinationId);
      await updateDoc(destinationRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      toast.success('Destination updated successfully');
    } catch (error) {
      console.error('Error updating destination:', error);
      toast.error('Failed to update destination');
      throw error;
    }
  }

  async deleteDestination(destinationId: string) {
    try {
      const destinationRef = doc(db, 'destinations', destinationId);
      await deleteDoc(destinationRef);
      toast.success('Destination deleted successfully');
    } catch (error) {
      console.error('Error deleting destination:', error);
      toast.error('Failed to delete destination');
      throw error;
    }
  }

  // =============================================================================
  // BIKE TOUR MANAGEMENT
  // =============================================================================

  async getBikeTours(callback: (tours: BikeTour[]) => void) {
    const toursRef = collection(db, 'bikeTours');
    const q = query(toursRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tours: BikeTour[] = [];
      snapshot.forEach((doc) => {
        tours.push({ id: doc.id, ...doc.data() } as BikeTour);
      });
      callback(tours);
    }, (error) => {
      console.error('Error fetching bike tours:', error);
      toast.error('Failed to fetch bike tours');
    });

    this.listeners.push(unsubscribe);
    return unsubscribe;
  }

  async createBikeTour(tourData: Omit<BikeTour, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const toursRef = collection(db, 'bikeTours');
      const docRef = await addDoc(toursRef, {
        ...tourData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      toast.success('Bike tour created successfully');
      return docRef.id;
    } catch (error) {
      console.error('Error creating bike tour:', error);
      toast.error('Failed to create bike tour');
      throw error;
    }
  }

  async updateBikeTour(tourId: string, data: Partial<BikeTour>) {
    try {
      const tourRef = doc(db, 'bikeTours', tourId);
      await updateDoc(tourRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      toast.success('Bike tour updated successfully');
    } catch (error) {
      console.error('Error updating bike tour:', error);
      toast.error('Failed to update bike tour');
      throw error;
    }
  }

  async deleteBikeTour(tourId: string) {
    try {
      const tourRef = doc(db, 'bikeTours', tourId);
      await deleteDoc(tourRef);
      toast.success('Bike tour deleted successfully');
    } catch (error) {
      console.error('Error deleting bike tour:', error);
      toast.error('Failed to delete bike tour');
      throw error;
    }
  }

  // =============================================================================
  // EXPERIENCE MANAGEMENT
  // =============================================================================

  async getExperiences(callback: (experiences: Experience[]) => void) {
    const experiencesRef = collection(db, 'experiences');
    const q = query(experiencesRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const experiences: Experience[] = [];
      snapshot.forEach((doc) => {
        experiences.push({ id: doc.id, ...doc.data() } as Experience);
      });
      callback(experiences);
    }, (error) => {
      console.error('Error fetching experiences:', error);
      toast.error('Failed to fetch experiences');
    });

    this.listeners.push(unsubscribe);
    return unsubscribe;
  }

  async createExperience(experienceData: Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const experiencesRef = collection(db, 'experiences');
      const newExperience = {
        ...experienceData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const docRef = await addDoc(experiencesRef, newExperience);
      toast.success('Experience created successfully');
      return docRef.id;
    } catch (error) {
      console.error('Error creating experience:', error);
      toast.error('Failed to create experience');
      throw error;
    }
  }

  async updateExperience(experienceId: string, experienceData: Partial<Experience>) {
    try {
      const experienceRef = doc(db, 'experiences', experienceId);
      const updateData = {
        ...experienceData,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(experienceRef, updateData);
      toast.success('Experience updated successfully');
    } catch (error) {
      console.error('Error updating experience:', error);
      toast.error('Failed to update experience');
      throw error;
    }
  }

  async deleteExperience(experienceId: string) {
    try {
      const experienceRef = doc(db, 'experiences', experienceId);
      await deleteDoc(experienceRef);
      toast.success('Experience deleted successfully');
    } catch (error) {
      console.error('Error deleting experience:', error);
      toast.error('Failed to delete experience');
      throw error;
    }
  }

  // =============================================================================
  // BOOKING MANAGEMENT
  // =============================================================================

  async getBookings(callback: (bookings: Booking[]) => void) {
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookings: Booking[] = [];
      snapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ...doc.data() } as Booking);
      });
      callback(bookings);
    }, (error) => {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
    });

    this.listeners.push(unsubscribe);
    return unsubscribe;
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const bookings: Booking[] = [];
      snapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ...doc.data() } as Booking);
      });
      
      return bookings;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  }

  async updateBooking(bookingId: string, data: Partial<Booking>) {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      toast.success('Booking updated successfully');
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
      throw error;
    }
  }

  // =============================================================================
  // DASHBOARD STATS
  // =============================================================================

  async getDashboardStats(callback: (stats: any) => void) {
    try {
      console.log('📊 Setting up dashboard stats listeners...');
      // Get real-time counts from all collections
      const usersRef = collection(db, 'users');
      const vehiclesRef = collection(db, 'vehicles');
      const bookingsRef = collection(db, 'bookings');

      const unsubscribeUsers = onSnapshot(usersRef, async () => {
        try {
          console.log('📊 Calculating dashboard stats...');
          const [usersSnap, vehiclesSnap, bookingsSnap] = await Promise.all([
            getDocs(usersRef),
            getDocs(vehiclesRef),
            getDocs(bookingsRef)
          ]);

          console.log('📊 Collection sizes - Users:', usersSnap.size, 'Vehicles:', vehiclesSnap.size, 'Bookings:', bookingsSnap.size);

          // Calculate revenue from bookings
          let totalRevenue = 0;
          let activeTrips = 0;
          
          bookingsSnap.forEach((doc) => {
            const booking = doc.data() as Booking;
            if (booking.paymentStatus === 'paid') {
              totalRevenue += booking.totalAmount;
            }
            if (booking.status === 'confirmed') {
              activeTrips++;
            }
          });

          const stats = {
            totalUsers: usersSnap.size,
            totalVehicles: vehiclesSnap.size,
            totalBookings: bookingsSnap.size,
            revenue: totalRevenue,
            activeTrips: activeTrips
          };

          console.log('📊 Calculated stats:', stats);
          callback(stats);
        } catch (error) {
          console.error('❌ Error calculating stats:', error);
          // Provide default stats on error
          callback({
            totalUsers: 0,
            totalVehicles: 0,
            totalBookings: 0,
            revenue: 0,
            activeTrips: 0
          });
        }
      }, (error) => {
        console.error('❌ Error in stats listener:', error);
        callback({
          totalUsers: 0,
          totalVehicles: 0,
          totalBookings: 0,
          revenue: 0,
          activeTrips: 0
        });
      });

      this.listeners.push(unsubscribeUsers);
      return unsubscribeUsers;
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      toast.error('Failed to fetch dashboard stats');
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  // Bulk operations
  async bulkUpdateStatus(collection: string, ids: string[], status: any) {
    try {
      const batch = writeBatch(db);
      
      ids.forEach((id) => {
        const docRef = doc(db, collection, id);
        batch.update(docRef, { 
          status, 
          updatedAt: Timestamp.now() 
        });
      });

      await batch.commit();
      toast.success(`${ids.length} items updated successfully`);
    } catch (error) {
      console.error('Error in bulk update:', error);
      toast.error('Failed to update items');
      throw error;
    }
  }

  // Cleanup all listeners
  cleanup() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners = [];
  }

  // Export data for reports
  async exportData(collectionName: string) {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      const data: any[] = [];
      
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });

      // Convert to CSV or JSON for download
      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
      throw error;
    }
  }
}

export const adminFirebaseService = new AdminFirebaseService();
