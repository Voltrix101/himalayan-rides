import { 
  collection, 
  onSnapshot, 
  getDocs,
  query,
  where,
  orderBy 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ExplorePlan } from '../types';
import toast from 'react-hot-toast';

export class ExplorePlansService {
  private static instance: ExplorePlansService;
  private explorePlansCollection = collection(db, 'explorePlans');

  public static getInstance(): ExplorePlansService {
    if (!ExplorePlansService.instance) {
      ExplorePlansService.instance = new ExplorePlansService();
    }
    return ExplorePlansService.instance;
  }

  // Real-time subscription for explore plans
  public subscribeToExplorePlans(callback: (plans: ExplorePlan[]) => void): () => void {
    try {
      const q = query(this.explorePlansCollection, orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const plans: ExplorePlan[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as ExplorePlan));
          console.log('Explore plans loaded:', plans.length);
          callback(plans);
        },
        (error) => {
          console.error('Error fetching explore plans:', error);
          console.log('Firestore may not be configured yet. Returning empty array.');
          callback([]); // Return empty array instead of showing error
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up explore plans subscription:', error);
      callback([]); // Return empty array if subscription fails
      return () => {}; // Return empty unsubscribe function
    }
  }

  // Get plans by region
  public subscribeToExplorePlansByRegion(
    regionId: string, 
    callback: (plans: ExplorePlan[]) => void
  ): () => void {
    const q = query(
      this.explorePlansCollection, 
      where('region', '==', regionId),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const plans: ExplorePlan[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ExplorePlan));
        callback(plans);
      },
      (error) => {
        console.error('Error fetching explore plans by region:', error);
        toast.error('Failed to load explore plans');
      }
    );

    return unsubscribe;
  }

  // Get featured plans
  public subscribeToFeaturedPlans(callback: (plans: ExplorePlan[]) => void): () => void {
    const q = query(
      this.explorePlansCollection, 
      where('isFeatured', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const plans: ExplorePlan[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ExplorePlan));
        callback(plans);
      },
      (error) => {
        console.error('Error fetching featured plans:', error);
        toast.error('Failed to load featured plans');
      }
    );

    return unsubscribe;
  }

  // Get all explore plans (one-time fetch)
  public async getAllExplorePlans(): Promise<ExplorePlan[]> {
    try {
      const snapshot = await getDocs(this.explorePlansCollection);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ExplorePlan));
    } catch (error) {
      console.error('Error getting explore plans:', error);
      toast.error('Failed to load explore plans');
      return [];
    }
  }
}

export const explorePlansService = ExplorePlansService.getInstance();
