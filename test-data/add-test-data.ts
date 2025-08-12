import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../src/config/firebase';
import testItineraries from './5-day-itineraries.json';

/**
 * Script to add test itineraries to Firebase
 * Run this in browser console or as a Node script
 */

export const addTestItineraries = async () => {
  console.log('🚀 Adding test itineraries to Firebase...');
  
  try {
    const tripPlansCollection = collection(db, 'tripPlans');
    
    for (const itinerary of testItineraries) {
      // Convert string dates to Firestore Timestamps
      const firestoreData = {
        ...itinerary,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const docRef = await addDoc(tripPlansCollection, firestoreData);
      console.log(`✅ Added: ${itinerary.title} (ID: ${docRef.id})`);
    }
    
    console.log('🎉 All test itineraries added successfully!');
    console.log('📍 Check your admin panel Trip Plans page to see them.');
    
  } catch (error) {
    console.error('❌ Error adding test data:', error);
  }
};

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
  console.log('🧪 Test data ready! Run addTestItineraries() to add to Firebase.');
  // Expose function globally for easy access
  (window as any).addTestItineraries = addTestItineraries;
}
