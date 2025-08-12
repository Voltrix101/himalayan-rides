import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { BikeTourPlan, allBikeTourPlans } from '../data/bikeTourPlans';

const COLLECTION_NAME = 'bikeTourPlans';

export class BikeTourPlanService {
  // Real-time listener for bike tour plans
  static subscribeToBikeTourPlans(callback: (plans: BikeTourPlan[]) => void) {
    const q = query(collection(db, COLLECTION_NAME), orderBy('created_at', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const plans: BikeTourPlan[] = [];
      snapshot.forEach((doc) => {
        plans.push({ id: doc.id, ...doc.data() } as BikeTourPlan);
      });
      callback(plans);
    }, (error) => {
      console.error('Error subscribing to bike tour plans:', error);
      callback([]);
    });
  }

  // Get all bike tour plans
  static async getAllBikeTourPlans(): Promise<BikeTourPlan[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      
      const plans: BikeTourPlan[] = [];
      snapshot.forEach((doc) => {
        plans.push({ id: doc.id, ...doc.data() } as BikeTourPlan);
      });
      
      return plans;
    } catch (error) {
      console.error('Error fetching bike tour plans:', error);
      return [];
    }
  }

  // Get single bike tour plan by ID
  static async getBikeTourPlanById(id: string): Promise<BikeTourPlan | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as BikeTourPlan;
      }
      return null;
    } catch (error) {
      console.error('Error fetching bike tour plan:', error);
      return null;
    }
  }

  // Create new bike tour plan
  static async createBikeTourPlan(plan: Omit<BikeTourPlan, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    try {
      const planData = {
        ...plan,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), planData);
      console.log('Bike tour plan created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating bike tour plan:', error);
      return null;
    }
  }

  // Update existing bike tour plan
  static async updateBikeTourPlan(id: string, updates: Partial<BikeTourPlan>): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const updateData = {
        ...updates,
        updated_at: serverTimestamp()
      };
      
      await updateDoc(docRef, updateData);
      console.log('Bike tour plan updated:', id);
      return true;
    } catch (error) {
      console.error('Error updating bike tour plan:', error);
      return false;
    }
  }

  // Delete bike tour plan
  static async deleteBikeTourPlan(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      console.log('Bike tour plan deleted:', id);
      return true;
    } catch (error) {
      console.error('Error deleting bike tour plan:', error);
      return false;
    }
  }

  // Bulk create bike tour plans
  static async bulkCreateBikeTourPlans(plans: Omit<BikeTourPlan, 'id' | 'created_at' | 'updated_at'>[]): Promise<boolean> {
    try {
      const batch = writeBatch(db);
      const collectionRef = collection(db, COLLECTION_NAME);
      
      plans.forEach((plan) => {
        const docRef = doc(collectionRef);
        const planData = {
          ...plan,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        };
        batch.set(docRef, planData);
      });
      
      await batch.commit();
      console.log('Bulk bike tour plans created successfully');
      return true;
    } catch (error) {
      console.error('Error bulk creating bike tour plans:', error);
      return false;
    }
  }

  // Check if collection is empty
  static async isCollectionEmpty(): Promise<boolean> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION_NAME));
      return snapshot.empty;
    } catch (error) {
      console.error('Error checking collection:', error);
      return true;
    }
  }

  // Initialize with default bike tour plans
  static async initializeDefaultPlans(): Promise<boolean> {
    try {
      const isEmpty = await this.isCollectionEmpty();
      
      if (isEmpty) {
        console.log('Initializing default bike tour plans...');
        const plansToCreate = allBikeTourPlans.map(plan => {
          const { id, created_at, updated_at, ...planData } = plan;
          return planData;
        });
        
        return await this.bulkCreateBikeTourPlans(plansToCreate);
      }
      
      console.log('Bike tour plans already exist in Firestore');
      return true;
    } catch (error) {
      console.error('Error initializing default plans:', error);
      return false;
    }
  }

  // Search bike tour plans
  static async searchBikeTourPlans(searchTerm: string): Promise<BikeTourPlan[]> {
    try {
      const allPlans = await this.getAllBikeTourPlans();
      
      return allPlans.filter(plan =>
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.highlights.some(highlight => 
          highlight.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } catch (error) {
      console.error('Error searching bike tour plans:', error);
      return [];
    }
  }

  // Get plans by difficulty
  static async getPlansByDifficulty(difficulty: BikeTourPlan['difficulty']): Promise<BikeTourPlan[]> {
    try {
      const allPlans = await this.getAllBikeTourPlans();
      return allPlans.filter(plan => plan.difficulty === difficulty);
    } catch (error) {
      console.error('Error fetching plans by difficulty:', error);
      return [];
    }
  }

  // Get plans by duration
  static async getPlansByDuration(minDays: number, maxDays: number): Promise<BikeTourPlan[]> {
    try {
      const allPlans = await this.getAllBikeTourPlans();
      return allPlans.filter(plan => {
        const duration = parseInt(plan.duration.split(' ')[0]);
        return duration >= minDays && duration <= maxDays;
      });
    } catch (error) {
      console.error('Error fetching plans by duration:', error);
      return [];
    }
  }

  // Get plans by price range
  static async getPlansByPriceRange(minPrice: number, maxPrice: number): Promise<BikeTourPlan[]> {
    try {
      const allPlans = await this.getAllBikeTourPlans();
      return allPlans.filter(plan => plan.price >= minPrice && plan.price <= maxPrice);
    } catch (error) {
      console.error('Error fetching plans by price range:', error);
      return [];
    }
  }

  // Auto-sync default plans if collection is empty
  static async autoSyncIfEmpty(): Promise<void> {
    try {
      await this.initializeDefaultPlans();
    } catch (error) {
      console.error('Error in auto-sync:', error);
    }
  }
}

// Export for easy access
export const {
  subscribeToBikeTourPlans,
  getAllBikeTourPlans,
  getBikeTourPlanById,
  createBikeTourPlan,
  updateBikeTourPlan,
  deleteBikeTourPlan,
  bulkCreateBikeTourPlans,
  isCollectionEmpty,
  initializeDefaultPlans,
  searchBikeTourPlans,
  getPlansByDifficulty,
  getPlansByDuration,
  getPlansByPriceRange,
  autoSyncIfEmpty
} = BikeTourPlanService;

export default BikeTourPlanService;
