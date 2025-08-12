import { collection, onSnapshot, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Destination } from '../types';
import toast from 'react-hot-toast';

export class DestinationsService {
  private static instance: DestinationsService;
  private destinationsCollection = collection(db, 'destinations');

  public static getInstance(): DestinationsService {
    if (!DestinationsService.instance) {
      DestinationsService.instance = new DestinationsService();
    }
    return DestinationsService.instance;
  }

  // Real-time subscription for destinations
  public subscribeToDestinations(callback: (destinations: Destination[]) => void): () => void {
    try {
      const q = query(this.destinationsCollection, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const destinations: Destination[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Destination));
          callback(destinations);
        },
        (error) => {
          console.error('Error fetching destinations:', error);
          callback([]);
        }
      );
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up destinations subscription:', error);
      callback([]);
      return () => {};
    }
  }

  // CRUD methods
  public async getAllDestinations(): Promise<Destination[]> {
    try {
      const snapshot = await getDocs(this.destinationsCollection);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Destination));
    } catch (error) {
      console.error('Error getting destinations:', error);
      toast.error('Failed to load destinations');
      return [];
    }
  }

  public async addDestination(data: Omit<Destination, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(this.destinationsCollection, {
        ...data,
        createdAt: now,
        updatedAt: now
      });
      toast.success('Destination added successfully!');
      return docRef.id;
    } catch (error) {
      console.error('Error adding destination:', error);
      toast.error('Failed to add destination');
      throw error;
    }
  }

  public async updateDestination(id: string, updates: Partial<Destination>): Promise<void> {
    try {
      const docRef = doc(db, 'destinations', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      toast.success('Destination updated successfully!');
    } catch (error) {
      console.error('Error updating destination:', error);
      toast.error('Failed to update destination');
      throw error;
    }
  }

  public async deleteDestination(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'destinations', id));
      toast.success('Destination deleted successfully!');
    } catch (error) {
      console.error('Error deleting destination:', error);
      toast.error('Failed to delete destination');
      throw error;
    }
  }
}

export const destinationsService = DestinationsService.getInstance(); 