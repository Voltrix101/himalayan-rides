import { collection, onSnapshot, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Experience } from '../types';
import toast from 'react-hot-toast';

export class ExperiencesService {
  private static instance: ExperiencesService;
  private experiencesCollection = collection(db, 'experiences');

  public static getInstance(): ExperiencesService {
    if (!ExperiencesService.instance) {
      ExperiencesService.instance = new ExperiencesService();
    }
    return ExperiencesService.instance;
  }

  // Real-time subscription for experiences
  public subscribeToExperiences(callback: (experiences: Experience[]) => void): () => void {
    try {
      const q = query(this.experiencesCollection, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const experiences: Experience[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Experience));
          callback(experiences);
        },
        (error) => {
          console.error('Error fetching experiences:', error);
          callback([]);
        }
      );
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up experiences subscription:', error);
      callback([]);
      return () => {};
    }
  }

  // CRUD methods
  public async getAllExperiences(): Promise<Experience[]> {
    try {
      const snapshot = await getDocs(this.experiencesCollection);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Experience));
    } catch (error) {
      console.error('Error getting experiences:', error);
      toast.error('Failed to load experiences');
      return [];
    }
  }

  public async addExperience(data: Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(this.experiencesCollection, {
        ...data,
        createdAt: now,
        updatedAt: now
      });
      toast.success('Experience added successfully!');
      return docRef.id;
    } catch (error) {
      console.error('Error adding experience:', error);
      toast.error('Failed to add experience');
      throw error;
    }
  }

  public async updateExperience(id: string, updates: Partial<Experience>): Promise<void> {
    try {
      const docRef = doc(db, 'experiences', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      toast.success('Experience updated successfully!');
    } catch (error) {
      console.error('Error updating experience:', error);
      toast.error('Failed to update experience');
      throw error;
    }
  }

  public async deleteExperience(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'experiences', id));
      toast.success('Experience deleted successfully!');
    } catch (error) {
      console.error('Error deleting experience:', error);
      toast.error('Failed to delete experience');
      throw error;
    }
  }
}

export const experiencesService = ExperiencesService.getInstance(); 