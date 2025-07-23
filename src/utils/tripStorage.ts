import { authService, TripBooking } from '../services/authService';
import toast from 'react-hot-toast';

export async function saveTripBooking(tripBooking: Omit<TripBooking, 'id' | 'createdAt'>): Promise<void> {
  try {
    // Save to Firebase Firestore
    await authService.saveTrip(tripBooking);
    
    // Also save to localStorage for backwards compatibility and offline access
    const existingTrips = JSON.parse(localStorage.getItem(`trips_${tripBooking.userId}`) || '[]');
    const localTrip: TripBooking = {
      ...tripBooking,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    existingTrips.push(localTrip);
    localStorage.setItem(`trips_${tripBooking.userId}`, JSON.stringify(existingTrips));
    
    toast.success('Trip booking saved successfully!');
  } catch (error) {
    console.error('Error saving trip booking:', error);
    
    // Fallback to localStorage only if Firebase fails
    try {
      const existingTrips = JSON.parse(localStorage.getItem(`trips_${tripBooking.userId}`) || '[]');
      const localTrip: TripBooking = {
        ...tripBooking,
        id: Date.now().toString(),
        createdAt: new Date()
      };
      existingTrips.push(localTrip);
      localStorage.setItem(`trips_${tripBooking.userId}`, JSON.stringify(existingTrips));
      
      toast.success('Trip booking saved locally!');
    } catch (localError) {
      console.error('Error saving to localStorage:', localError);
      toast.error('Failed to save trip booking');
      throw localError;
    }
  }
}
