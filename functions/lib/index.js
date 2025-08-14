"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = exports.onBookingConfirmed = exports.sendBookingConfirmation = exports.refundPayment = exports.razorpayWebhook = exports.createRazorpayOrder = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin
admin.initializeApp();
// Import function modules
const razorpay_1 = require("./razorpay");
const email_1 = require("./email");
// Export HTTP Cloud Functions
exports.createRazorpayOrder = razorpay_1.createRazorpayOrder;
exports.razorpayWebhook = razorpay_1.razorpayWebhook;
exports.refundPayment = razorpay_1.refundPayment;
exports.sendBookingConfirmation = razorpay_1.sendBookingConfirmation;
// Export Firestore triggered functions
exports.onBookingConfirmed = functions.firestore
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
            const paymentsSnapshot = await admin.firestore()
                .collection('payments')
                .where('orderId', '==', afterData.orderId)
                .limit(1)
                .get();
            if (!paymentsSnapshot.empty) {
                const paymentData = paymentsSnapshot.docs[0].data();
                // Send confirmation email with PDFs
                await (0, email_1.sendBookingConfirmationEmail)(afterData, paymentData);
                functions.logger.info(`Confirmation email sent for booking: ${bookingId}`);
            }
            else {
                functions.logger.warn(`Payment data not found for booking: ${bookingId}`);
            }
        }
        catch (error) {
            functions.logger.error(`Error sending confirmation email for booking ${bookingId}:`, error);
        }
    }
});
// Health check function
exports.healthCheck = functions.https.onRequest((req, res) => {
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
//# sourceMappingURL=index.js.map