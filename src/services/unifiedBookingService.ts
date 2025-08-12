import { 
  collection, 
  doc, 
  updateDoc, 
  increment,
  runTransaction,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
  FieldValue
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Booking } from '../types/booking';
import { PremiumPDFGenerator, transformToUniversalBooking } from '../utils/premiumPdfGenerator';
import { PerformanceMonitor } from '../utils/performanceMonitor';

export class UnifiedBookingService {
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  private static generateBookingId(type: string): string {
    const prefix = {
      'tour': 'BT',
      'curated': 'CE', 
      'vehicle': 'VR',
      'experience': 'EX'
    }[type] || 'GN';
    
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    
    return `HR-${prefix}-${timestamp}-${random}`;
  }
  
  static async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    PerformanceMonitor.startProfile('booking-creation');
    
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to create booking');
    }

    const bookingId = this.generateBookingId(bookingData.type);
    
    const booking: Omit<Booking, 'createdAt' | 'updatedAt'> & {
      createdAt: FieldValue;
      updatedAt: FieldValue;
    } = {
      ...bookingData,
      id: bookingId,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    try {
      await runTransaction(db, async (transaction) => {
        // Create booking document
        const bookingRef = doc(db, 'bookings', bookingId);
        transaction.set(bookingRef, booking);
        
        // Update analytics atomically
        const analyticsRef = doc(db, 'analytics', 'main');
        transaction.update(analyticsRef, {
          totalBookings: increment(1),
          totalRevenue: increment(booking.paymentInfo.amount),
          [`bookingsByType.${booking.type}`]: increment(1),
          [`revenueByType.${booking.type}`]: increment(booking.paymentInfo.amount),
          lastUpdated: serverTimestamp()
        });
        
        // Add to user trips collection for fast queries
        const userTripRef = doc(db, 'users', booking.userId, 'trips', bookingId);
        transaction.set(userTripRef, {
          id: bookingId,
          userId: booking.userId,
          type: booking.type,
          title: booking.item.title,
          coverImage: booking.item.coverImage,
          startDate: booking.bookingDetails.startDate,
          endDate: booking.bookingDetails.endDate,
          status: booking.status,
          totalAmount: booking.paymentInfo.amount,
          createdAt: booking.createdAt
        });
      });
      
      // Clear cache for this user
      this.cache.delete(`user-bookings-${user.uid}`);
      
      PerformanceMonitor.endProfile('booking-creation');
      console.log(`✅ Booking ${bookingId} created successfully`);
      return bookingId;
    } catch (error) {
      PerformanceMonitor.endProfile('booking-creation');
      console.error('Error creating booking:', error);
      throw new Error('Failed to create booking. Please try again.');
    }
  }
  
  static async generateBookingPDF(booking: Booking): Promise<void> {
    PerformanceMonitor.startProfile('pdf-generation');
    
    try {
      // Transform booking to universal format
      const universalBooking = transformToUniversalBooking({
        id: booking.id,
        type: booking.type,
        title: booking.item.title,
        duration: '7 days', // Default, could be dynamic
        user: booking.userInfo,
        participants: booking.bookingDetails.participants.map(p => ({
          name: p.name,
          age: parseInt(p.age) || 25,
          gender: 'N/A',
          contact: p.phone
        })),
        billing: {
          perPerson: Math.round(booking.paymentInfo.amount / booking.bookingDetails.participantCount),
          total: booking.paymentInfo.amount,
          tax: Math.round(booking.paymentInfo.amount * 0.18),
          finalAmount: booking.paymentInfo.amount
        },
        dates: {
          startDate: booking.bookingDetails.startDate instanceof Date 
            ? booking.bookingDetails.startDate.toLocaleDateString() 
            : new Date(booking.bookingDetails.startDate.seconds * 1000).toLocaleDateString(),
          endDate: booking.bookingDetails.endDate 
            ? (booking.bookingDetails.endDate instanceof Date 
                ? booking.bookingDetails.endDate.toLocaleDateString() 
                : new Date(booking.bookingDetails.endDate.seconds * 1000).toLocaleDateString())
            : undefined
        }
      });
      
      const pdfGenerator = new PremiumPDFGenerator(universalBooking);
      await pdfGenerator.generateBookingConfirmation();
      
      PerformanceMonitor.endProfile('pdf-generation');
    } catch (error) {
      PerformanceMonitor.endProfile('pdf-generation');
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }
  
  static async updateBookingStatus(
    bookingId: string, 
    status: Booking['status'], 
    additionalData?: Partial<Booking>
  ): Promise<void> {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status,
        updatedAt: serverTimestamp(),
        ...additionalData
      });
      
      // Clear related cache entries
      this.cache.forEach((_, key) => {
        if (key.includes('bookings')) {
          this.cache.delete(key);
        }
      });
      
      console.log(`✅ Booking ${bookingId} status updated to ${status}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw new Error('Failed to update booking status');
    }
  }
  
  static async getUserBookings(userId: string): Promise<Booking[]> {
    PerformanceMonitor.startProfile('fetch-user-bookings');
    
    const cacheKey = `user-bookings-${userId}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      PerformanceMonitor.endProfile('fetch-user-bookings');
      return cached.data;
    }
    
    try {
      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: bookings,
        timestamp: Date.now()
      });
      
      PerformanceMonitor.endProfile('fetch-user-bookings');
      return bookings;
    } catch (error) {
      PerformanceMonitor.endProfile('fetch-user-bookings');
      console.error('Error fetching user bookings:', error);
      throw new Error('Failed to fetch bookings');
    }
  }
  
  // Real-time subscription with throttling
  static subscribeToUserBookings(
    userId: string, 
    callback: (bookings: Booking[]) => void,
    throttleMs: number = 1000
  ): Unsubscribe {
    let lastUpdate = 0;
    
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    return onSnapshot(q, (snapshot) => {
      const now = Date.now();
      if (now - lastUpdate < throttleMs) return;
      lastUpdate = now;
      
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
      
      // Update cache
      const cacheKey = `user-bookings-${userId}`;
      this.cache.set(cacheKey, {
        data: bookings,
        timestamp: now
      });
      
      callback(bookings);
    });
  }
  
  // Analytics queries with caching
  static async getAnalytics(): Promise<any> {
    const cacheKey = 'analytics-main';
    const cached = this.cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }
    
    try {
      const snapshot = await getDocs(query(collection(db, 'analytics')));
      
      const analytics = snapshot.docs.reduce((acc, doc) => ({
        ...acc,
        [doc.id]: doc.data()
      }), {});
      
      this.cache.set(cacheKey, {
        data: analytics,
        timestamp: Date.now()
      });
      
      return analytics;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw new Error('Failed to fetch analytics');
    }
  }
  
  // Clear all caches
  static clearCache(): void {
    this.cache.clear();
  }
}
