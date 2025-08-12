import { 
  collection, 
  onSnapshot, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  query,
  where,
  orderBy 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Vehicle } from '../types';
import toast from 'react-hot-toast';

export class VehiclesService {
  private static instance: VehiclesService;
  private vehiclesCollection = collection(db, 'vehicles');

  public static getInstance(): VehiclesService {
    if (!VehiclesService.instance) {
      VehiclesService.instance = new VehiclesService();
    }
    return VehiclesService.instance;
  }

  // Real-time subscription for vehicles
  public subscribeToVehicles(callback: (vehicles: Vehicle[]) => void): () => void {
    try {
      // Don't order by createdAt since existing vehicles might not have it
      const q = query(this.vehiclesCollection);
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const vehicles: Vehicle[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Vehicle));
          console.log('Vehicles loaded:', vehicles.length);
          callback(vehicles);
        },
        (error) => {
          console.error('Error fetching vehicles:', error);
          console.log('Firestore may not be configured yet. Returning empty array.');
          callback([]); // Return empty array instead of showing error
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up vehicles subscription:', error);
      callback([]); // Return empty array if subscription fails
      return () => {}; // Return empty unsubscribe function
    }
  }

  // Get vehicles by region
  public subscribeToVehiclesByRegion(
    regionId: string, 
    callback: (vehicles: Vehicle[]) => void
  ): () => void {
    const q = query(
      this.vehiclesCollection, 
      where('region', '==', regionId),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const vehicles: Vehicle[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Vehicle));
        callback(vehicles);
      },
      (error) => {
        console.error('Error fetching vehicles by region:', error);
        toast.error('Failed to load vehicles');
      }
    );

    return unsubscribe;
  }

  // Get all vehicles (one-time fetch)
  public async getAllVehicles(): Promise<Vehicle[]> {
    try {
      const snapshot = await getDocs(this.vehiclesCollection);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Vehicle));
    } catch (error) {
      console.error('Error getting vehicles:', error);
      toast.error('Failed to load vehicles');
      return [];
    }
  }

  // Add new vehicle
  public async addVehicle(vehicleData: Omit<Vehicle, 'id'>): Promise<string | null> {
    try {
      const docRef = await addDoc(this.vehiclesCollection, {
        ...vehicleData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      toast.success('Vehicle added successfully');
      return docRef.id;
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast.error('Failed to add vehicle');
      return null;
    }
  }

  // Update vehicle
  public async updateVehicle(vehicleId: string, updates: Partial<Vehicle>): Promise<boolean> {
    try {
      const vehicleRef = doc(this.vehiclesCollection, vehicleId);
      await updateDoc(vehicleRef, {
        ...updates,
        updatedAt: new Date()
      });
      toast.success('Vehicle updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast.error('Failed to update vehicle');
      return false;
    }
  }

  // Delete vehicle
  public async deleteVehicle(vehicleId: string): Promise<boolean> {
    try {
      const vehicleRef = doc(this.vehiclesCollection, vehicleId);
      await deleteDoc(vehicleRef);
      toast.success('Vehicle deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Failed to delete vehicle');
      return false;
    }
  }

  // Toggle vehicle availability
  public async toggleAvailability(vehicleId: string, isAvailable: boolean): Promise<boolean> {
    try {
      const vehicleRef = doc(this.vehiclesCollection, vehicleId);
      await updateDoc(vehicleRef, {
        isAvailable,
        updatedAt: new Date()
      });
      toast.success(`Vehicle ${isAvailable ? 'enabled' : 'disabled'} successfully`);
      return true;
    } catch (error) {
      console.error('Error toggling vehicle availability:', error);
      toast.error('Failed to update vehicle availability');
      return false;
    }
  }
}

export const vehiclesService = VehiclesService.getInstance();
