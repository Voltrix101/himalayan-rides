import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Get the Firestore instance
const db = admin.firestore();

// Import function modules
import { 
  createRazorpayOrder as createOrder, 
  razorpayWebhook as webhookHandler, 
  refundPayment as processRefund,
  sendBookingConfirmation as sendConfirmation
} from './razorpay';
import { sendBookingConfirmationEmail } from './email';

// Export HTTP Cloud Functions
export const createRazorpayOrder = createOrder(db);
export const razorpayWebhook = webhookHandler(db);
export const refundPayment = processRefund(db);
export const sendBookingConfirmation = sendConfirmation(db);

// Export Firestore triggered functions
export const onBookingConfirmed = functions.firestore
  .document('bookings/{bookingId}')
  .onUpdate(async (change, context) => {
    const bookingId = context.params.bookingId;
    const beforeData = change.before.data();
    const afterData = change.after.data();
    
    // Check if payment status changed to 'captured'
    if (beforeData.paymentStatus !== 'captured' && afterData.paymentStatus === 'captured') {
      functions.logger.info(`Payment captured for booking: ${bookingId}`);
      
      try {
        // Get payment data
        const paymentsSnapshot = await db
          .collection('payments')
          .where('orderId', '==', afterData.orderId)
          .limit(1)
          .get();
        
        if (!paymentsSnapshot.empty) {
          const paymentData = paymentsSnapshot.docs[0].data();
          
          // Send confirmation email with PDFs
          await sendBookingConfirmationEmail(afterData, paymentData);
          
          functions.logger.info(`Confirmation email sent for booking: ${bookingId}`);
        } else {
          functions.logger.warn(`Payment data not found for booking: ${bookingId}`);
        }
      } catch (error) {
        functions.logger.error(`Error sending confirmation email for booking ${bookingId}:`, error);
      }
    }
  });

// Health check function
export const healthCheck = functions.https.onRequest((req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      firebase: 'connected',
      razorpay: 'configured',
      email: 'configured'
    }
  });
});