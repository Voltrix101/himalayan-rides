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
    const { paymentId, refundAmount, reason } = req.body;
    
    if (!paymentId) {
      return errorResponse(res, 400, 'Payment ID is required');
    }

    // Initialize Razorpay
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!razorpayKeyId || !razorpayKeySecret) {
      return errorResponse(res, 500, 'Razorpay configuration not found');
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    // Get payment details from Razorpay
    const payment = await razorpay.payments.fetch(paymentId);
    
    if (!payment) {
      return errorResponse(res, 404, 'Payment not found');
    }

    // Calculate refund amount (default to full amount if not specified)
    const refundAmountInPaise = refundAmount ? Math.round(refundAmount * 100) : payment.amount;

    // Create refund
    const refund = await razorpay.payments.refund(paymentId, {
      amount: refundAmountInPaise,
      notes: {
        reason: reason || 'Customer requested refund',
        refund_initiated_at: new Date().toISOString(),
      },
    });

    // Find and update the payment record
    const paymentQuery = await db
      .collection('payments')
      .where('paymentId', '==', paymentId)
      .limit(1)
      .get();
    
    if (!paymentQuery.empty) {
      const paymentDoc = paymentQuery.docs[0];
      const paymentData = paymentDoc.data();
      
      // Update payment status
      await paymentDoc.ref.update({
        refundStatus: 'processed',
        refundId: refund.id,
        refundAmount: refundAmountInPaise,
        refundReason: reason,
        updatedAt: new Date(),
      });

      // Update booking status
      if (paymentData.bookingId) {
        await db.collection('bookings').doc(paymentData.bookingId).update({
          status: 'refunded',
          refundStatus: 'processed',
          refundId: refund.id,
          refundAmount: refundAmountInPaise,
          updatedAt: new Date(),
        });
      }
    }

    console.log(`Refund processed: ${refund.id} for payment: ${paymentId}`);

    return successResponse(res, {
      success: true,
      refundId: refund.id,
      refundAmount: refundAmountInPaise / 100, // Convert back to rupees
      status: refund.status,
      message: 'Refund processed successfully',
    });

  } catch (error: any) {
    console.error('Error processing refund:', error);
    return errorResponse(res, 500, 'Failed to process refund', error);
  }
}
