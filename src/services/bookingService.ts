import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy,
  getDoc,
  updateDoc,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import toast from 'react-hot-toast';
import { Booking, UserTrip, MainAnalytics } from '../types/booking';

/**
 * A unified service to handle all types of bookings (tours, vehicles, curated experiences).
 * This service centralizes booking logic, including transactional updates to analytics.
 */
class BookingService {
  private static instance: BookingService;
  private bookingsCollection = collection(db, 'bookings');
  private usersCollection = collection(db, 'users');
  private analyticsDoc = doc(db, 'analytics', 'main');

  public static getInstance(): BookingService {
    if (!BookingService.instance) {
      BookingService.instance = new BookingService();
    }
    return BookingService.instance;
  }

  /**
   * Creates a new booking and atomically updates analytics and user data in a single transaction.
   * @param bookingData - The booking data, conforming to the unified Booking type.
   * @returns The ID of the newly created booking.
   */
  public async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error('You must be logged in to make a booking.');
      throw new Error('User not authenticated');
    }

    // Ensure the booking's userId matches the authenticated user
    if (bookingData.userId !== currentUser.uid) {
      toast.error('Booking user does not match logged-in user.');
      throw new Error('User ID mismatch');
    }

    try {
      const bookingId = await runTransaction(db, async (transaction) => {
        // 1. Define all document references
        const newBookingRef = doc(this.bookingsCollection);
        const userTripRef = doc(this.usersCollection, currentUser.uid, 'trips', newBookingRef.id);
        const analyticsRef = this.analyticsDoc;

        // 2. Prepare the data objects
        const completeBooking: Omit<Booking, 'id'> = {
          ...bookingData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        const userTrip: UserTrip = {
          id: newBookingRef.id,
          userId: currentUser.uid,
          type: bookingData.type,
          title: bookingData.item.title,
          coverImage: bookingData.item.coverImage,
          startDate: bookingData.bookingDetails.startDate,
          endDate: bookingData.bookingDetails.endDate,
          status: bookingData.status,
          totalAmount: bookingData.paymentInfo.amount,
          createdAt: serverTimestamp(),
        };

        // 3. Perform all writes in the transaction
        transaction.set(newBookingRef, completeBooking);
        transaction.set(userTripRef, userTrip);
        transaction.update(analyticsRef, {
          totalRevenue: increment(bookingData.paymentInfo.amount),
          totalBookings: increment(1),
          [`bookingsByType.${bookingData.type}`]: increment(1),
          [`revenueByType.${bookingData.type}`]: increment(1),
          lastUpdated: serverTimestamp(),
        });

        return newBookingRef.id;
      });

      toast.success('🎉 Booking confirmed successfully!');
      return bookingId;
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
      throw error;
    }
  }

  /**
   * Subscribes to the main analytics document for real-time updates.
   * @param callback - Function to call with the analytics data.
   */
  public subscribeToAnalytics(callback: (stats: MainAnalytics | null) => void): () => void {
    return onSnapshot(this.analyticsDoc, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as MainAnalytics);
      } else {
        callback(null);
      }
    });
  }

  /**
   * Fetches a single booking by its ID.
   * @param bookingId - The ID of the booking to fetch.
   */
  public async getBookingById(bookingId: string): Promise<Booking | null> {
    try {
      const bookingRef = doc(this.bookingsCollection, bookingId);
      const bookingSnapshot = await getDoc(bookingRef);

      if (bookingSnapshot.exists()) {
        return { id: bookingSnapshot.id, ...bookingSnapshot.data() } as Booking;
      }
      return null;
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Failed to fetch booking details.');
      throw error;
    }
  }

  /**
   * Updates the status of a specific booking.
   * @param bookingId - The ID of the booking to update.
   * @param status - The new status for the booking.
   */
  public async updateBookingStatus(bookingId: string, status: Booking['status']): Promise<void> {
    try {
      const bookingRef = doc(this.bookingsCollection, bookingId);
      await updateDoc(bookingRef, {
        status,
        updatedAt: serverTimestamp(),
      });
      toast.success(`Booking status updated to ${status}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
      throw error;
    }
  }


      // Convert to CSV
      const headers = [
        'Booking ID',
        'Customer Name',
        'Email',
        'Phone',
        'Trip Name',
        'Trip Type',
        'Start Date',
        'End Date',
        'Participants',
        'Amount',
        'Payment ID',
        'Status',
        'Created At'
      ];

      const csvContent = [
        headers.join(','),
        ...bookings.map(booking => [
          booking.id,
          booking.userInfo.name,
          booking.userInfo.email,
          booking.userInfo.phone,
          booking.tripDetails.title,
          booking.tripDetails.type,
          booking.bookingDetails.startDate.toISOString().split('T')[0],
          booking.bookingDetails.endDate?.toISOString().split('T')[0] || '',
          booking.bookingDetails.participantCount,
          booking.paymentInfo.amount,
          booking.paymentInfo.paymentId,
          booking.status,
          booking.createdAt.toISOString()
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `himalayan-rides-bookings-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success('📊 Bookings exported successfully!');
    } catch (error) {
      console.error('Error exporting bookings:', error);
      toast.error('Failed to export bookings');
    }
  }
}

export const bookingService = new BookingService();
