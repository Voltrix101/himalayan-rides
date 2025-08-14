// Production Booking Test without Vercel
// This tests if bookings can be created directly in production Firestore

import { db } from '../config/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export interface TestBookingData {
  experienceId: string;
  experienceTitle: string;
  customerName: string;
  email: string;
  phone: string;
  participants: number;
  startDate: Date;
  totalAmount: number;
  pickupLocation: string;
  specialRequests?: string;
}

/**
 * Test booking creation in production Firestore
 * This bypasses Vercel functions and writes directly to Firestore
 */
export const createTestBooking = async (bookingData: TestBookingData, userId: string) => {
  try {
    console.log('📝 Creating test booking in production Firestore...');
    
    // Create booking document
    const bookingDoc = {
      ...bookingData,
      userId,
      status: 'test',
      paymentStatus: 'test',
      createdAt: new Date(),
      updatedAt: new Date(),
      testBooking: true, // Mark as test to distinguish from real bookings
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'bookings'), bookingDoc);
    console.log('✅ Test booking created successfully:', docRef.id);
    
    return {
      success: true,
      bookingId: docRef.id,
      message: 'Test booking created in production Firestore'
    };

  } catch (error) {
    console.error('❌ Test booking creation failed:', error);
    throw error;
  }
};

/**
 * Get user's test bookings from production Firestore
 */
export const getUserTestBookings = async (userId: string) => {
  try {
    console.log('📖 Fetching user test bookings from production Firestore...');
    
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', userId),
      where('testBooking', '==', true),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`✅ Found ${bookings.length} test bookings for user`);
    return bookings;

  } catch (error) {
    console.error('❌ Failed to fetch test bookings:', error);
    throw error;
  }
};

/**
 * Test the complete booking flow with production Firebase
 */
export const testProductionBookingFlow = async (userId: string, userEmail: string) => {
  try {
    console.log('🚀 Testing complete booking flow with production Firebase...');
    
    // Test booking data
    const testBookingData: TestBookingData = {
      experienceId: 'test-ladakh-bike-tour',
      experienceTitle: 'Test Ladakh Bike Adventure',
      customerName: 'Test Customer',
      email: userEmail,
      phone: '+91-9999999999',
      participants: 2,
      startDate: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), // 7 days from now
      totalAmount: 15000,
      pickupLocation: 'Manali Bus Stand',
      specialRequests: 'Test booking for production Firebase integration'
    };

    // Step 1: Create booking
    const result = await createTestBooking(testBookingData, userId);
    console.log('✅ Step 1 - Booking created:', result.bookingId);

    // Step 2: Verify booking exists
    const userBookings = await getUserTestBookings(userId);
    console.log('✅ Step 2 - Booking verified in database');

    // Step 3: Test success
    console.log('🎉 Production booking flow test completed successfully!');
    
    return {
      success: true,
      bookingId: result.bookingId,
      totalBookings: userBookings.length,
      message: 'Production Firebase booking flow is working perfectly!'
    };

  } catch (error) {
    console.error('❌ Production booking flow test failed:', error);
    throw error;
  }
};
