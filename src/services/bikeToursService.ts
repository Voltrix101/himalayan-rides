import { 
  collection, 
  onSnapshot, 
  getDocs,
  query,
  where,
  orderBy 
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
}

export const bikeToursService = BikeToursService.getInstance();
