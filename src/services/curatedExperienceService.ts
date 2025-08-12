import { 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  updateDoc, 
  deleteDoc,
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  runTransaction,
  onSnapshot,
  Timestamp,
  FirestoreError,
  where
} from 'firebase/firestore';
import { auth } from '../config/firebase';
import { db } from '../config/firebase';
import { CuratedExperience, CuratedBooking, AdminStats } from '../types/curatedExperience';
import toast from 'react-hot-toast';

class CuratedExperienceService {
  private readonly EXPERIENCES_COLLECTION = 'curatedExperiences';
  private readonly BOOKINGS_COLLECTION = 'curatedBookings';
  private readonly USER_TRIPS_COLLECTION = 'userTrips';
  private readonly ADMIN_STATS_DOC = 'adminStats/general';

  // Get all curated experiences
  async getCuratedExperiences(): Promise<CuratedExperience[]> {
    try {
      const experiencesRef = collection(db, this.EXPERIENCES_COLLECTION);
      const snapshot = await getDocs(experiencesRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CuratedExperience[];
    } catch (error) {
      console.error('Error fetching curated experiences:', error);
      toast.error('Failed to load experiences');
      return [];
    }
  }

  // Subscribe to curated experiences in real time (for Admin)
  subscribeToCuratedExperiences(callback: (items: CuratedExperience[]) => void): () => void {
    const ref = collection(db, this.EXPERIENCES_COLLECTION);
    return onSnapshot(ref, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as CuratedExperience[];
      callback(items);
    }, () => callback([]));
  }

  // Create curated experience
  async createExperience(data: Omit<CuratedExperience, 'id'>): Promise<string> {
    const ref = await addDoc(collection(db, this.EXPERIENCES_COLLECTION), {
      ...data,
      createdAt: Timestamp.now()
    } as any);
    return ref.id;
  }

  // Update curated experience
  async updateExperience(id: string, updates: Partial<CuratedExperience>): Promise<void> {
    const ref = doc(db, this.EXPERIENCES_COLLECTION, id);
    await updateDoc(ref, { ...updates });
  }

  // Delete curated experience
  async deleteExperience(id: string): Promise<void> {
    const ref = doc(db, this.EXPERIENCES_COLLECTION, id);
    await deleteDoc(ref);
  }

  // Get single experience by ID
  async getExperienceById(id: string): Promise<CuratedExperience | null> {
    try {
      const docRef = doc(db, this.EXPERIENCES_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as CuratedExperience;
      }
      return null;
    } catch (error) {
      console.error('Error fetching experience:', error);
      return null;
    }
  }

  // Create booking with Firestore transaction
  async createCuratedBooking(
    bookingData: Omit<CuratedBooking, 'id' | 'createdAt'>
  ): Promise<{ success: boolean; bookingId?: string; error?: string }> {
    try {
      const result = await runTransaction(db, async (transaction) => {
        // Generate booking ID
        const bookingId = doc(collection(db, this.BOOKINGS_COLLECTION)).id;
        
        // Document references
        const bookingRef = doc(db, this.BOOKINGS_COLLECTION, bookingId);
        const userTripRef = doc(db, this.USER_TRIPS_COLLECTION, bookingId);
        const adminStatsRef = doc(db, this.ADMIN_STATS_DOC);

        // READ FIRST: Get current admin stats (all reads before writes in Firestore)
        const adminStatsDoc = await transaction.get(adminStatsRef);
        const currentStats: AdminStats = adminStatsDoc.exists()
          ? adminStatsDoc.data() as AdminStats
          : {
              totalRevenue: 0,
              totalBookings: 0,
              totalCuratedBookings: 0,
              curatedRevenue: 0,
              lastBookingTime: new Date(),
              recentCuratedBookings: []
            };

        // Prepare booking data
        const completeBooking: CuratedBooking = {
          ...bookingData,
          id: bookingId,
          createdAt: new Date()
        };

        // Prepare user trip data (simplified for "Your Trips" page)
        const userTrip = {
          id: bookingId,
          uid: bookingData.uid,
          tripId: bookingData.experienceId,
          type: 'curated',
          experienceDetails: bookingData.experienceDetails,
          payment: bookingData.payment,
          status: bookingData.status,
          createdAt: new Date(),
          startDate: bookingData.bookingInfo.startDate,
          endDate: bookingData.bookingInfo.endDate
        };

        // Update admin stats
        const updatedRecentBookings = [
          {
            id: bookingId,
            customerName: bookingData.userInfo.name,
            experienceName: bookingData.experienceDetails.title,
            amount: bookingData.payment.amount,
            date: new Date()
          },
          ...currentStats.recentCuratedBookings.slice(0, 4) // Keep last 5
        ];

        const updatedStats: AdminStats = {
          totalRevenue: currentStats.totalRevenue + bookingData.payment.amount,
          totalBookings: currentStats.totalBookings + 1,
          totalCuratedBookings: currentStats.totalCuratedBookings + 1,
          curatedRevenue: currentStats.curatedRevenue + bookingData.payment.amount,
          lastBookingTime: new Date(),
          recentCuratedBookings: updatedRecentBookings
        };

        // WRITE: All database writes
        transaction.set(bookingRef, completeBooking);
        transaction.set(userTripRef, userTrip);
        transaction.set(adminStatsRef, updatedStats);

        return bookingId;
      });

      return { success: true, bookingId: result };

    } catch (error) {
      console.error('Error creating curated booking:', error);
      const errorMessage = error instanceof FirestoreError 
        ? `Booking failed: ${error.message}` 
        : 'Failed to create booking. Please try again.';
      
      return { success: false, error: errorMessage };
    }
  }

  // Get user's curated bookings
  async getUserCuratedBookings(uid: string): Promise<CuratedBooking[]> {
    try {
      // Check if user is authenticated
      if (!auth.currentUser) {
        console.log('User not authenticated for curated bookings');
        return [];
      }

      // Only allow users to access their own bookings
      if (auth.currentUser.uid !== uid) {
        console.log('User can only access their own bookings');
        return [];
      }

      const bookingsRef = collection(db, this.BOOKINGS_COLLECTION);
      const q = query(
        bookingsRef,
        where('uid', '==', uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        bookingInfo: {
          ...doc.data().bookingInfo,
          startDate: doc.data().bookingInfo.startDate?.toDate(),
          endDate: doc.data().bookingInfo.endDate?.toDate()
        },
        payment: {
          ...doc.data().payment,
          timestamp: doc.data().payment.timestamp?.toDate()
        }
      })) as CuratedBooking[];
    } catch (error) {
      console.error('Error fetching user curated bookings:', error);
      return [];
    }
  }

  // Real-time listener for admin stats
  subscribeToAdminStats(callback: (stats: AdminStats | null) => void): () => void {
    const statsRef = doc(db, this.ADMIN_STATS_DOC);
    
    return onSnapshot(statsRef, (doc) => {
      if (doc.exists()) {
        const stats = {
          ...doc.data(),
          lastBookingTime: doc.data().lastBookingTime?.toDate(),
          recentCuratedBookings: doc.data().recentCuratedBookings?.map((booking: any) => ({
            ...booking,
            date: booking.date?.toDate()
          }))
        } as AdminStats;
        callback(stats);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error listening to admin stats:', error);
      callback(null);
    });
  }

  // Real-time listener for user trips
  subscribeToUserTrips(uid: string, callback: (trips: any[]) => void): () => void {
    const tripsRef = collection(db, this.USER_TRIPS_COLLECTION);
    const q = query(
      tripsRef,
      where('uid', '==', uid),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const trips = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate()
      }));
      callback(trips);
    }, (error) => {
      console.error('Error listening to user trips:', error);
      callback([]);
    });
  }

  // Update booking with PDF URL after generation
  async updateBookingWithPdf(bookingId: string, pdfUrl: string): Promise<boolean> {
    try {
      const bookingRef = doc(db, this.BOOKINGS_COLLECTION, bookingId);
      await updateDoc(bookingRef, { pdfUrl });
      
      // Also update in user trips
      const userTripRef = doc(db, this.USER_TRIPS_COLLECTION, bookingId);
      await updateDoc(userTripRef, { pdfUrl });
      
      return true;
    } catch (error) {
      console.error('Error updating booking with PDF:', error);
      return false;
    }
  }

  // Seed curated experiences (call once to populate Firestore)
  async seedCuratedExperiences(): Promise<void> {
    const experiences: CuratedExperience[] = [
      {
        id: 'monastery-spiritual-trail',
        title: 'Ancient Monasteries Spiritual Trail',
        description: 'Embark on a transformative spiritual journey through centuries-old Buddhist monasteries, meditation centers, and sacred sites nestled in the heart of Ladakh.',
        price: 8500,
        days: 3,
        highlights: [
          'Visit 5 ancient monasteries including Hemis and Thiksey',
          'Guided meditation sessions with Buddhist monks',
          'Traditional prayer wheel ceremonies',
          'Sunrise prayers at 4000m altitude',
          'Sacred manuscript viewing'
        ],
        image: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800',
        category: 'Spiritual',
        rating: 4.7,
        inclusions: ['Monastery entrance fees', 'Local guide', 'Traditional meals', 'Transportation'],
        exclusions: ['Personal expenses', 'Tips', 'Photography fees'],
        difficulty: 'Easy',
        maxParticipants: 12,
        itinerary: [
          {
            day: 1,
            title: 'Hemis Monastery & Thiksey Gompa',
            activities: ['Morning prayers at Hemis', 'Thiksey sunset meditation', 'Traditional butter tea'],
            accommodation: 'Monastery guesthouse',
            meals: 'Breakfast, Lunch, Dinner'
          },
          {
            day: 2,
            title: 'Shey Palace & Stok Monastery',
            activities: ['Ancient Buddha statue viewing', 'Royal palace exploration', 'Manuscript library'],
            accommodation: 'Monastery guesthouse',
            meals: 'Breakfast, Lunch, Dinner'
          },
          {
            day: 3,
            title: 'Spituk & Phyang Monasteries',
            activities: ['Morning chanting ceremony', 'Sacred artifact viewing', 'Blessing ceremony'],
            accommodation: 'Return to Leh',
            meals: 'Breakfast, Lunch'
          }
        ]
      },
      {
        id: 'himalayan-photography-expedition',
        title: 'Himalayan Photography Masterclass',
        description: 'Capture the raw, untamed beauty of Ladakh with professional photography guidance from award-winning landscape photographers.',
        price: 18000,
        days: 5,
        highlights: [
          'Professional DSLR techniques training',
          'Golden hour shoots at iconic locations',
          'Astrophotography sessions under clear skies',
          'Portrait photography with local communities',
          'Post-processing workshops'
        ],
        image: 'https://images.pexels.com/photos/1049298/pexels-photo-1049298.jpeg?auto=compress&cs=tinysrgb&w=800',
        category: 'Photography',
        rating: 4.8,
        inclusions: ['Professional guide', 'Photography equipment', 'Editing software', 'Print vouchers'],
        exclusions: ['Camera rental', 'Memory cards', 'Personal gear'],
        difficulty: 'Moderate',
        maxParticipants: 8,
        itinerary: [
          {
            day: 1,
            title: 'Pangong Lake Golden Hour',
            activities: ['Sunrise photography', 'Composition techniques', 'Water reflection shots'],
            accommodation: 'Lake-side camp',
            meals: 'All meals included'
          },
          {
            day: 2,
            title: 'Nubra Valley Landscapes',
            activities: ['Sand dune photography', 'Camel silhouettes', 'Desert sunset'],
            accommodation: 'Desert camp',
            meals: 'All meals included'
          },
          {
            day: 3,
            title: 'Tso Moriri Wilderness',
            activities: ['Wildlife photography', 'Mountain reflections', 'Nomadic life portraits'],
            accommodation: 'High-altitude camp',
            meals: 'All meals included'
          },
          {
            day: 4,
            title: 'Khardung La Pass',
            activities: ['High-altitude landscapes', 'Prayer flag photography', 'Panoramic shots'],
            accommodation: 'Mountain lodge',
            meals: 'All meals included'
          },
          {
            day: 5,
            title: 'Astrophotography Night',
            activities: ['Milky Way photography', 'Star trail techniques', 'Portfolio review'],
            accommodation: 'Return to Leh',
            meals: 'Breakfast, Lunch'
          }
        ]
      },
      {
        id: 'ladakhi-cultural-immersion',
        title: 'Authentic Ladakhi Cultural Immersion',
        description: 'Live with local families, learn traditional crafts, and experience the authentic culture of Ladakh through immersive community-based tourism.',
        price: 12000,
        days: 4,
        highlights: [
          'Homestay with traditional Ladakhi families',
          'Traditional weaving and pottery workshops',
          'Local cooking classes with organic ingredients',
          'Folk music and dance sessions',
          'Traditional archery and games'
        ],
        image: 'https://images.pexels.com/photos/2325446/pexels-photo-2325446.jpeg?auto=compress&cs=tinysrgb&w=800',
        category: 'Cultural',
        rating: 4.6,
        inclusions: ['Homestay accommodation', 'All meals', 'Workshop materials', 'Cultural guide'],
        exclusions: ['Shopping', 'Additional activities', 'Alcohol'],
        difficulty: 'Easy',
        maxParticipants: 10,
        itinerary: [
          {
            day: 1,
            title: 'Village Welcome & Orientation',
            activities: ['Traditional welcome ceremony', 'Village tour', 'Meet host family'],
            accommodation: 'Traditional homestay',
            meals: 'Lunch, Dinner'
          },
          {
            day: 2,
            title: 'Traditional Crafts Workshop',
            activities: ['Pashmina weaving', 'Pottery making', 'Traditional painting'],
            accommodation: 'Traditional homestay',
            meals: 'All meals included'
          },
          {
            day: 3,
            title: 'Culinary & Music Experience',
            activities: ['Cooking traditional dishes', 'Folk music lessons', 'Dance performances'],
            accommodation: 'Traditional homestay',
            meals: 'All meals included'
          },
          {
            day: 4,
            title: 'Festival & Farewell',
            activities: ['Local festival participation', 'Archery competition', 'Farewell ceremony'],
            accommodation: 'Return to Leh',
            meals: 'Breakfast, Lunch'
          }
        ]
      }
    ];

    try {
      for (const experience of experiences) {
        const docRef = doc(db, this.EXPERIENCES_COLLECTION, experience.id);
        await setDoc(docRef, experience);
      }
      console.log('Curated experiences seeded successfully');
    } catch (error) {
      console.error('Error seeding curated experiences:', error);
    }
  }
}

export const curatedExperienceService = new CuratedExperienceService();
