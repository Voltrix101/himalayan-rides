import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Vehicle, BikeTourPlan, TripPlan, ExplorePlan } from '../types';
import toast from 'react-hot-toast';

export class AdminContentService {
  // ===== EXPLORE PLANS (Bike Tours) =====
  
  static async getAllExplorePlans(): Promise<ExplorePlan[]> {
    try {
      const q = query(collection(db, 'explorePlans'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as ExplorePlan[];
    } catch (error) {
      console.error('Error fetching explore plans:', error);
      toast.error('Failed to fetch explore plans');
      return [];
    }
  }

  static async addExplorePlan(plan: Omit<ExplorePlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'explorePlans'), {
        ...plan,
        createdAt: now,
        updatedAt: now
      });
      toast.success('Explore plan added successfully!');
      return docRef.id;
    } catch (error) {
      console.error('Error adding explore plan:', error);
      toast.error('Failed to add explore plan');
      throw error;
    }
  }

  static async updateExplorePlan(id: string, updates: Partial<ExplorePlan>): Promise<void> {
    try {
      const docRef = doc(db, 'explorePlans', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      toast.success('Explore plan updated successfully!');
    } catch (error) {
      console.error('Error updating explore plan:', error);
      toast.error('Failed to update explore plan');
      throw error;
    }
  }

  static async deleteExplorePlan(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'explorePlans', id));
      toast.success('Explore plan deleted successfully!');
    } catch (error) {
      console.error('Error deleting explore plan:', error);
      toast.error('Failed to delete explore plan');
      throw error;
    }
  }

  // ===== VEHICLES (Fleet Management) =====
  
  static async getAllVehicles(): Promise<Vehicle[]> {
    try {
      const q = query(collection(db, 'vehicles'), orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vehicle[];
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to fetch vehicles');
      return [];
    }
  }

  static async addVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'vehicles'), {
        ...vehicle,
        createdAt: now,
        updatedAt: now
      });
      toast.success('Vehicle added successfully!');
      return docRef.id;
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast.error('Failed to add vehicle');
      throw error;
    }
  }

  static async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<void> {
    try {
      const docRef = doc(db, 'vehicles', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      toast.success('Vehicle updated successfully!');
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast.error('Failed to update vehicle');
      throw error;
    }
  }

  static async deleteVehicle(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'vehicles', id));
      toast.success('Vehicle deleted successfully!');
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Failed to delete vehicle');
      throw error;
    }
  }

  // ===== TRIP PLANS =====
  
  static async getAllTripPlans(): Promise<TripPlan[]> {
    try {
      const q = query(collection(db, 'tripPlans'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as TripPlan[];
    } catch (error) {
      console.error('Error fetching trip plans:', error);
      toast.error('Failed to fetch trip plans');
      return [];
    }
  }

  static async addTripPlan(plan: Omit<TripPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'tripPlans'), {
        ...plan,
        createdAt: now,
        updatedAt: now
      });
      toast.success('Trip plan added successfully!');
      return docRef.id;
    } catch (error) {
      console.error('Error adding trip plan:', error);
      toast.error('Failed to add trip plan');
      throw error;
    }
  }

  static async updateTripPlan(id: string, updates: Partial<TripPlan>): Promise<void> {
    try {
      const docRef = doc(db, 'tripPlans', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      toast.success('Trip plan updated successfully!');
    } catch (error) {
      console.error('Error updating trip plan:', error);
      toast.error('Failed to update trip plan');
      throw error;
    }
  }

  static async deleteTripPlan(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'tripPlans', id));
      toast.success('Trip plan deleted successfully!');
    } catch (error) {
      console.error('Error deleting trip plan:', error);
      toast.error('Failed to delete trip plan');
      throw error;
    }
  }

  // ===== BIKE TOUR PLANS (Legacy Support) =====
  
  static async getAllBikeTourPlans(): Promise<BikeTourPlan[]> {
    try {
      const q = query(collection(db, 'bikeTours'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as BikeTourPlan[];
    } catch (error) {
      console.error('Error fetching bike tour plans:', error);
      toast.error('Failed to fetch bike tour plans');
      return [];
    }
  }

  static async addBikeTourPlan(plan: Omit<BikeTourPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'bikeTours'), {
        ...plan,
        createdAt: now,
        updatedAt: now
      });
      toast.success('Bike tour plan added successfully!');
      return docRef.id;
    } catch (error) {
      console.error('Error adding bike tour plan:', error);
      toast.error('Failed to add bike tour plan');
      throw error;
    }
  }

  static async updateBikeTourPlan(id: string, updates: Partial<BikeTourPlan>): Promise<void> {
    try {
      const docRef = doc(db, 'bikeTours', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      toast.success('Bike tour plan updated successfully!');
    } catch (error) {
      console.error('Error updating bike tour plan:', error);
      toast.error('Failed to update bike tour plan');
      throw error;
    }
  }

  static async deleteBikeTourPlan(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'bikeTours', id));
      toast.success('Bike tour plan deleted successfully!');
    } catch (error) {
      console.error('Error deleting bike tour plan:', error);
      toast.error('Failed to delete bike tour plan');
      throw error;
    }
  }

  // ===== UTILITY METHODS =====
  
  static async getFeaturedContent() {
    try {
      const [explorePlans, tripPlans] = await Promise.all([
        this.getAllExplorePlans(),
        this.getAllTripPlans()
      ]);
      
      return {
        featuredExplorePlans: explorePlans.filter(plan => plan.isFeatured),
        featuredTripPlans: tripPlans.filter(plan => plan.isFeatured)
      };
    } catch (error) {
      console.error('Error fetching featured content:', error);
      return { featuredExplorePlans: [], featuredTripPlans: [] };
    }
  }

  static async getContentByRegion(region: string) {
    try {
      const vehicles = await this.getAllVehicles();
      return vehicles.filter(vehicle => vehicle.region.toLowerCase() === region.toLowerCase());
    } catch (error) {
      console.error('Error fetching content by region:', error);
      return [];
    }
  }
}
