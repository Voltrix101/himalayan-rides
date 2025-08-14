import { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';
// Update the import path if your firebase utilities are located elsewhere, for example:
import { db, enableCors, handleOptions, errorResponse, successResponse } from '../lib/firebase';
// Or create the file '../_lib/firebase.ts' with the required exports if it does not exist.

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  enableCors(res);
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const body = JSON.stringify(req.body);

    if (!signature || !body) {
      console.warn('Invalid webhook request - missing signature or body');
      return errorResponse(res, 400, 'Invalid webhook request');
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_webhook_secret';
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.warn('Webhook signature verification failed');
      return errorResponse(res, 400, 'Invalid signature');
    }

    // Process webhook event
    const event = req.body;
    const eventId = event.payload?.payment?.entity?.id || 'unknown';
    
    console.log(`Processing webhook event: ${eventId}`);

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;

      // Find the booking associated with this order
      const paymentDoc = await db.collection('payments').doc(orderId).get();
      
      if (!paymentDoc.exists) {
        console.warn(`Payment document not found for order: ${orderId}`);
        return successResponse(res, { status: 'ignored' });
      }

      const paymentData = paymentDoc.data()!;
      const bookingId = paymentData.bookingId;

      // Update payment status
      await db.collection('payments').doc(orderId).update({
        status: 'captured',
        paymentId: payment.id,
        updatedAt: new Date(),
        paymentDetails: payment,
      });

      // Update booking status
      await db.collection('bookings').doc(bookingId).update({
        paymentStatus: 'captured',
        status: 'confirmed',
        paymentId: payment.id,
        updatedAt: new Date(),
      });

      console.log(`Payment captured and booking confirmed: ${bookingId}`);

      // Note: Email sending will be triggered by a separate endpoint or client-side call
      // since Firestore triggers don't exist in Vercel

      return successResponse(res, { status: 'success' });
    }

    // Handle other events
    console.log(`Unhandled webhook event: ${event.event}`);
    return successResponse(res, { status: 'ignored' });

  } catch (error: unknown) {
    console.error('Error processing webhook:', error);
    return errorResponse(res, 500, 'Webhook processing failed', error);
  }
}
