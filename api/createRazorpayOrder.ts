import { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';
import { db, enableCors, handleOptions, errorResponse, successResponse } from '../_lib/firebase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  enableCors(res);
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  try {
    const { bookingData, userId } = req.body;
    
    if (!bookingData || !userId) {
      return errorResponse(res, 400, 'Booking data and user ID are required');
    }

    // Validate required booking data
    if (!bookingData.totalAmount || bookingData.totalAmount <= 0) {
      return errorResponse(res, 400, 'Invalid amount');
    }

    console.log('Creating Razorpay order for booking:', {
      experienceTitle: bookingData.experienceTitle,
      customerName: bookingData.customerName,
      startDate: bookingData.startDate,
      totalAmount: bookingData.totalAmount,
      userId
    });

    // Initialize Razorpay with environment variables
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!razorpayKeyId || !razorpayKeySecret) {
      return errorResponse(res, 500, 'Razorpay configuration not found');
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    // Create booking in Firestore first
    const bookingRef = db.collection('bookings').doc();
    const newBookingId = bookingRef.id;

    const bookingDoc = {
      ...bookingData,
      id: newBookingId,
      userId,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await bookingRef.set(bookingDoc);

    // Create Razorpay order
    const orderOptions = {
      amount: Math.round(bookingData.totalAmount * 100), // Convert to paise
      currency: 'INR',
      receipt: `booking_${newBookingId}`,
      payment_capture: 1,
      notes: {
        bookingId: newBookingId,
        userId,
        experienceTitle: bookingData.experienceTitle,
        customerName: bookingData.customerName,
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    // Store order details in Firestore
    await db.collection('payments').doc(order.id).set({
      orderId: order.id,
      bookingId: newBookingId,
      userId,
      amount: orderOptions.amount,
      currency: orderOptions.currency,
      status: 'created',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Update booking with order ID
    await bookingRef.update({
      orderId: order.id,
      updatedAt: new Date(),
    });

    console.log(`Razorpay order created: ${order.id} for new booking: ${newBookingId}`);

    // Return order details for frontend
    return successResponse(res, {
      orderId: order.id,
      bookingId: newBookingId,
      amount: orderOptions.amount,
      currency: orderOptions.currency,
      key: razorpayKeyId,
      name: 'Himalayan Rides',
      description: `Booking for ${bookingData.experienceTitle}`,
    });

  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return errorResponse(res, 500, 'Failed to create order', error);
  }
}
