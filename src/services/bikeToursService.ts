import { 
  collection, 
  onSnapshot, 
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { BikeTourPlan } from '../types';
import toast from 'react-hot-toast';

export class BikeToursService {
  private static instance: BikeToursService;
  private bikeToursCollection = collection(db, 'bikeTours');

  public static getInstance(): BikeToursService {
    if (!BikeToursService.instance) {
      BikeToursService.instance = new BikeToursService();
    }
    return BikeToursService.instance;
  }

  // Real-time subscription for bike tours
  public subscribeToBikeTours(callback: (tours: BikeTourPlan[]) => void): () => void {
    try {
      const q = query(this.bikeToursCollection, orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const tours: BikeTourPlan[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as BikeTourPlan));
          console.log('Bike tours loaded:', tours.length);
          callback(tours);
        },
        (error) => {
          console.error('Error fetching bike tours:', error);
          console.log('Firestore may not be configured yet. Returning empty array.');
          callback([]); // Return empty array instead of showing error
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up bike tours subscription:', error);
      callback([]); // Return empty array if subscription fails
      return () => {}; // Return empty unsubscribe function
    }
  }

  // Get featured tours
  public subscribeToFeaturedTours(callback: (tours: BikeTourPlan[]) => void): () => void {
    const q = query(
      this.bikeToursCollection, 
      where('isFeatured', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tours: BikeTourPlan[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as BikeTourPlan));
        callback(tours);
      },
      (error) => {
        console.error('Error fetching featured tours:', error);
        toast.error('Failed to load featured tours');
      }
    );

    return unsubscribe;
  }

  // Get all bike tours (one-time fetch)
  public async getAllBikeTours(): Promise<BikeTourPlan[]> {
    try {
      const snapshot = await getDocs(this.bikeToursCollection);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as BikeTourPlan));
    } catch (error) {
      console.error('Error getting bike tours:', error);
      toast.error('Failed to load bike tours');
      return [];
    }
  }

  // Add a new bike tour
  public async addBikeTour(tour: Omit<BikeTourPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(this.bikeToursCollection, {
        ...tour,
        createdAt: now,
        updatedAt: now
      });
      toast.success('Bike tour added successfully!');
      return docRef.id;
    } catch (error) {
      console.error('Error adding bike tour:', error);
      toast.error('Failed to add bike tour');
      throw error;
    }
  }

  // Update a bike tour
  public async updateBikeTour(id: string, updates: Partial<BikeTourPlan>): Promise<void> {
    try {
      const tourDoc = doc(db, 'bikeTours', id);
      await updateDoc(tourDoc, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      toast.success('Bike tour updated successfully!');
    } catch (error) {
      console.error('Error updating bike tour:', error);
      toast.error('Failed to update bike tour');
      throw error;
    }
  }

  // Delete a bike tour
  public async deleteBikeTour(id: string): Promise<void> {
    try {
      const tourDoc = doc(db, 'bikeTours', id);
      await deleteDoc(tourDoc);
      toast.success('Bike tour deleted successfully!');
    } catch (error) {
      console.error('Error deleting bike tour:', error);
      toast.error('Failed to delete bike tour');
      throw error;
    }
  }

  // Backward compatibility aliases for existing components
  public async addBikeTourPlan(tour: Omit<BikeTourPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.addBikeTour(tour);
  }

  public async updateBikeTourPlan(id: string, updates: Partial<BikeTourPlan>): Promise<void> {
    return this.updateBikeTour(id, updates);
  }

  public async deleteBikeTourPlan(id: string): Promise<void> {
    return this.deleteBikeTour(id);
  }
}

export const bikeToursService = BikeToursService.getInstance();
