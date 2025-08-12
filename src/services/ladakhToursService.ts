import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  onSnapshot,
  serverTimestamp,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface LadakhTour {
  id?: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  image: string;
  highlights: string[];
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  category: 'Adventure' | 'Cultural' | 'Spiritual' | 'Photography';
  rating: number;
  maxGroupSize: number;
  isPopular?: boolean;
  isNew?: boolean;
  isActive?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

class LadakhToursService {
  private static collectionName = 'ladakhTours';

  // Real-time listener for tours
  static subscribeToTours(
    callback: (tours: LadakhTour[]) => void,
    errorCallback?: (error: Error) => void
  ) {
    const toursQuery = query(
      collection(db, this.collectionName),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(
      toursQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const tours: LadakhTour[] = [];
        snapshot.forEach((doc) => {
          tours.push({
            id: doc.id,
            ...doc.data()
          } as LadakhTour);
        });
        callback(tours);
      },
      (error) => {
        console.error('Error listening to tours:', error);
        if (errorCallback) errorCallback(error);
      }
    );
  }

  // Admin functions for CRUD operations
  static async createTour(tourData: Omit<LadakhTour, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...tourData,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating tour:', error);
      throw error;
    }
  }

  static async updateTour(tourId: string, updates: Partial<LadakhTour>): Promise<void> {
    try {
      const tourRef = doc(db, this.collectionName, tourId);
      await updateDoc(tourRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating tour:', error);
      throw error;
    }
  }

  static async deleteTour(tourId: string): Promise<void> {
    try {
      // Soft delete by setting isActive to false
      await this.updateTour(tourId, { isActive: false });
    } catch (error) {
      console.error('Error deleting tour:', error);
      throw error;
    }
  }

  static async getAllTours(): Promise<LadakhTour[]> {
    try {
      const toursQuery = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(toursQuery);
      const tours: LadakhTour[] = [];
      snapshot.forEach((doc) => {
        tours.push({
          id: doc.id,
          ...doc.data()
        } as LadakhTour);
      });
      return tours;
    } catch (error) {
      console.error('Error getting all tours:', error);
      throw error;
    }
  }

  // Utility functions
  static async seedSampleData(): Promise<void> {
    const sampleTours: Omit<LadakhTour, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        title: 'Khardung La Pass Expedition',
        description: 'Conquer the world\'s highest motorable pass at 18,380 feet. Experience breathtaking views, challenging terrain, and the thrill of high-altitude adventure.',
        duration: '2 Days',
        price: 15000,
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
        highlights: ['World\'s Highest Pass', 'Scenic Mountain Views', 'High Altitude Adventure', 'Photo Opportunities'],
        difficulty: 'Challenging',
        category: 'Adventure',
        rating: 4.8,
        maxGroupSize: 8,
        isPopular: true,
        isNew: false,
        isActive: true
      },
      {
        title: 'Pangong Lake Photography Tour',
        description: 'Capture the mesmerizing blue waters of Pangong Lake, featured in countless Bollywood movies. Perfect for photography enthusiasts.',
        duration: '3 Days',
        price: 18000,
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
        highlights: ['Crystal Blue Waters', 'Movie Locations', 'Lakeside Camping', 'Golden Hour Shots'],
        difficulty: 'Moderate',
        category: 'Photography',
        rating: 4.9,
        maxGroupSize: 12,
        isPopular: true,
        isNew: true,
        isActive: true
      },
      {
        title: 'Nubra Valley Desert Safari',
        description: 'Explore the unique cold desert of Nubra Valley with its sand dunes, Bactrian camels, and stunning landscapes.',
        duration: '2 Days',
        price: 12000,
        image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
        highlights: ['Cold Desert', 'Bactrian Camels', 'Sand Dunes', 'Diskit Monastery'],
        difficulty: 'Easy',
        category: 'Adventure',
        rating: 4.6,
        maxGroupSize: 15,
        isPopular: false,
        isNew: false,
        isActive: true
      },
      {
        title: 'Hemis Monastery Cultural Journey',
        description: 'Immerse yourself in Buddhist culture at one of Ladakh\'s most important monasteries. Experience ancient traditions and spiritual practices.',
        duration: '1 Day',
        price: 8000,
        image: 'https://images.unsplash.com/photo-1555400082-6ad1b8532ae0?auto=format&fit=crop&w=800&q=80',
        highlights: ['Ancient Monastery', 'Buddhist Culture', 'Sacred Art', 'Spiritual Experience'],
        difficulty: 'Easy',
        category: 'Cultural',
        rating: 4.7,
        maxGroupSize: 20,
        isPopular: false,
        isNew: false,
        isActive: true
      },
      {
        title: 'Tso Moriri Wildlife Expedition',
        description: 'Discover the pristine wilderness around Tso Moriri Lake. Spot rare wildlife and experience untouched natural beauty.',
        duration: '4 Days',
        price: 25000,
        image: 'https://images.unsplash.com/photo-1542662565-7e4b66bae529?auto=format&fit=crop&w=800&q=80',
        highlights: ['High Altitude Lake', 'Wildlife Spotting', 'Pristine Nature', 'Photography'],
        difficulty: 'Challenging',
        category: 'Photography',
        rating: 4.8,
        maxGroupSize: 6,
        isPopular: false,
        isNew: true,
        isActive: true
      },
      {
        title: 'Shanti Stupa Sunrise Trek',
        description: 'Start your day with a peaceful trek to Shanti Stupa for breathtaking sunrise views over Leh valley.',
        duration: 'Half Day',
        price: 3000,
        image: 'https://images.unsplash.com/photo-1574870111867-089730e5a72b?auto=format&fit=crop&w=800&q=80',
        highlights: ['Sunrise Views', 'Peace Pagoda', 'City Panorama', 'Easy Trek'],
        difficulty: 'Easy',
        category: 'Spiritual',
        rating: 4.5,
        maxGroupSize: 25,
        isPopular: false,
        isNew: false,
        isActive: true
      }
    ];

    try {
      for (const tour of sampleTours) {
        await this.createTour(tour);
      }
      console.log('Sample tours seeded successfully!');
    } catch (error) {
      console.error('Error seeding sample data:', error);
      throw error;
    }
  }

  // Performance optimized query for categories
  static async getPopularTours(limitCount: number = 6): Promise<LadakhTour[]> {
    try {
      const popularQuery = query(
        collection(db, this.collectionName),
        where('isActive', '==', true),
        where('isPopular', '==', true),
        orderBy('rating', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(popularQuery);
      const tours: LadakhTour[] = [];
      snapshot.forEach((doc) => {
        tours.push({
          id: doc.id,
          ...doc.data()
        } as LadakhTour);
      });
      return tours;
    } catch (error) {
      console.error('Error getting popular tours:', error);
      throw error;
    }
  }

  static async getToursByCategory(category: string): Promise<LadakhTour[]> {
    try {
      const categoryQuery = query(
        collection(db, this.collectionName),
        where('isActive', '==', true),
        where('category', '==', category),
        orderBy('rating', 'desc')
      );
      
      const snapshot = await getDocs(categoryQuery);
      const tours: LadakhTour[] = [];
      snapshot.forEach((doc) => {
        tours.push({
          id: doc.id,
          ...doc.data()
        } as LadakhTour);
      });
      return tours;
    } catch (error) {
      console.error('Error getting tours by category:', error);
      throw error;
    }
  }
}

export default LadakhToursService;
