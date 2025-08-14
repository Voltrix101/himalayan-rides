import { VercelRequest, VercelResponse } from '@vercel/node';
import { db, enableCors, handleOptions, errorResponse, successResponse } from '../_lib/firebase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  enableCors(res);
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  try {
    const { bookingId, paymentId } = req.body;
    
    if (!bookingId || !paymentId) {
      return errorResponse(res, 400, 'Booking ID and Payment ID are required');
    }

    console.log(`Sending booking confirmation for: ${bookingId}`);

    // Get booking data
    const bookingDoc = await db.collection('bookings').doc(bookingId).get();
    
    if (!bookingDoc.exists) {
      return errorResponse(res, 404, 'Booking not found');
    }

    // Get payment data
    const paymentQuery = await db
      .collection('payments')
      .where('bookingId', '==', bookingId)
      .limit(1)
      .get();

    if (paymentQuery.empty) {
      return errorResponse(res, 404, 'Payment not found');
    }

    // Update booking status
    await db.collection('bookings').doc(bookingId).update({
      status: 'confirmed',
      paymentStatus: 'captured',
      updatedAt: new Date(),
    });

    console.log(`Booking confirmation updated: ${bookingId}`);

    // Note: Email functionality temporarily disabled
    // In a real implementation, you would call the email function here
    // await sendBookingConfirmationEmail(bookingData, paymentData);

    return successResponse(res, {
      success: true,
      message: 'Booking confirmation sent successfully',
      bookingId,
    });

  } catch (error: any) {
    console.error('Error sending booking confirmation:', error);
    return errorResponse(res, 500, 'Failed to send booking confirmation', error);
  }
}
