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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBookingConfirmation = exports.refundPayment = exports.razorpayWebhook = exports.createRazorpayOrderHTTP = exports.createRazorpayOrder = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const crypto = __importStar(require("crypto"));
const razorpay_1 = __importDefault(require("razorpay"));
// import { sendBookingConfirmationEmail } from './email'; // Temporarily disabled
const cors_1 = __importDefault(require("cors"));
// Configure CORS
const corsHandler = (0, cors_1.default)({ origin: true });
const db = admin.firestore();
/**
 * Create Razorpay Order - Callable Function
 */
exports.createRazorpayOrder = functions.https.onCall(async (data, context) => {
    var _a, _b, _c;
    try {
        const { bookingData, userId } = data;
        if (!bookingData || !userId) {
            throw new functions.https.HttpsError('invalid-argument', 'Booking data and user ID are required');
        }
        // Validate required booking data
        if (!bookingData.totalAmount || bookingData.totalAmount <= 0) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid amount');
        }
        console.log('Creating Razorpay order for booking:', {
            experienceTitle: bookingData.experienceTitle,
            customerName: bookingData.customerName,
            startDate: bookingData.startDate,
            totalAmount: bookingData.totalAmount,
            userId
        });
        // Initialize Razorpay with safe config access
        let razorpayKeyId;
        let razorpayKeySecret;
        try {
            const config = functions.config();
            console.log('Config available:', config.razorpay ? 'Yes' : 'No');
            // Try Firebase config first
            razorpayKeyId = ((_a = config.razorpay) === null || _a === void 0 ? void 0 : _a.key_id) || '';
            razorpayKeySecret = ((_b = config.razorpay) === null || _b === void 0 ? void 0 : _b.key_secret) || '';
            if (!razorpayKeyId || !razorpayKeySecret) {
                throw new functions.https.HttpsError('failed-precondition', 'Razorpay configuration not found');
            }
            console.log('Using Razorpay Key ID:', razorpayKeyId);
            console.log('Razorpay Secret:', 'Present');
        }
        catch (error) {
            console.error('Config access failed:', error);
            throw new functions.https.HttpsError('failed-precondition', 'Unable to load Razorpay configuration');
        }
        const razorpayInstance = new razorpay_1.default({
            key_id: razorpayKeyId,
            key_secret: razorpayKeySecret,
        });
        // Create booking document with safe date handling
        const bookingDoc = {
            userId,
            customerName: bookingData.customerName || '',
            email: bookingData.email || '',
            phone: bookingData.phone || '',
            participants: bookingData.participants || 1,
            startDate: bookingData.startDate ? new Date(bookingData.startDate) : null,
            endDate: bookingData.endDate ? new Date(bookingData.endDate) : null,
            totalAmount: bookingData.totalAmount,
            pickupLocation: bookingData.pickupLocation || '',
            specialRequests: bookingData.specialRequests || '',
            emergencyContact: bookingData.emergencyContact || null,
            experienceId: bookingData.experienceId || '',
            experienceTitle: bookingData.experienceTitle || '',
            status: 'pending_payment',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const bookingRef = await db.collection('bookings').add(bookingDoc);
        const newBookingId = bookingRef.id;
        // Create Razorpay order
        const orderData = {
            amount: Math.round(bookingData.totalAmount * 100),
            currency: 'INR',
            receipt: newBookingId,
            notes: {
                bookingId: newBookingId,
                userId,
                experienceTitle: bookingData.experienceTitle || '',
                customerName: bookingData.customerName || '',
            },
        };
        const order = await razorpayInstance.orders.create(orderData);
        // Save payment record
        const paymentData = {
            bookingId: newBookingId,
            orderId: order.id,
            amount: bookingData.totalAmount,
            currency: 'INR',
            status: 'created',
            createdAt: new Date(),
        };
        await db.collection('payments').doc(order.id).set(paymentData);
        // Update booking with order ID
        await bookingRef.update({
            'razorpay.orderId': order.id,
            updatedAt: new Date(),
        });
        functions.logger.info(`Razorpay order created: ${order.id} for new booking: ${newBookingId}`);
        return {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: ((_c = functions.config().razorpay) === null || _c === void 0 ? void 0 : _c.key_id) || 'rzp_test_default',
            bookingId: newBookingId,
        };
    }
    catch (error) {
        functions.logger.error('Error creating Razorpay order:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create order');
    }
});
/**
 * Create Razorpay Order - HTTP Function with CORS support
 */
exports.createRazorpayOrderHTTP = functions.https.onRequest(async (req, res) => {
    return corsHandler(req, res, async () => {
        var _a, _b, _c;
        try {
            // Only allow POST requests
            if (req.method !== 'POST') {
                res.status(405).json({ error: 'Method not allowed' });
                return;
            }
            const { bookingData, userId } = req.body;
            if (!bookingData || !userId) {
                res.status(400).json({ error: 'Booking data and user ID are required' });
                return;
            }
            // Validate required booking data
            if (!bookingData.totalAmount || bookingData.totalAmount <= 0) {
                res.status(400).json({ error: 'Invalid amount' });
                return;
            }
            // Initialize Razorpay instance
            let razorpayInstance;
            try {
                const config = functions.config();
                // Try Firebase config first, then fall back to environment variables
                const razorpayKeyId = ((_a = config.razorpay) === null || _a === void 0 ? void 0 : _a.key_id) || '';
                const razorpayKeySecret = ((_b = config.razorpay) === null || _b === void 0 ? void 0 : _b.key_secret) || '';
                if (!razorpayKeyId || !razorpayKeySecret) {
                    res.status(500).json({ error: 'Razorpay configuration not found' });
                    return;
                }
                razorpayInstance = new razorpay_1.default({
                    key_id: razorpayKeyId,
                    key_secret: razorpayKeySecret,
                });
            }
            catch (error) {
                console.error('Failed to initialize Razorpay:', error);
                res.status(500).json({ error: 'Unable to load Razorpay configuration' });
                return;
            }
            // Save booking to Firestore first
            const bookingDoc = {
                userId,
                customerName: bookingData.customerName || '',
                email: bookingData.email || '',
                phone: bookingData.phone || '',
                participants: bookingData.participants || 1,
                startDate: new Date(bookingData.startDate),
                endDate: bookingData.endDate ? new Date(bookingData.endDate) : null,
                totalAmount: bookingData.totalAmount,
                pickupLocation: bookingData.pickupLocation || '',
                specialRequests: bookingData.specialRequests || '',
                emergencyContact: bookingData.emergencyContact || null,
                experienceId: bookingData.experienceId || '',
                experienceTitle: bookingData.experienceTitle || '',
                status: 'pending_payment',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const bookingRef = await db.collection('bookings').add(bookingDoc);
            const bookingId = bookingRef.id;
            // Create Razorpay order
            const orderData = {
                amount: Math.round(bookingData.totalAmount * 100),
                currency: 'INR',
                receipt: bookingId,
                notes: {
                    bookingId,
                    userId,
                    experienceTitle: bookingData.experienceTitle || '',
                    customerName: bookingData.customerName || '',
                },
            };
            const order = await razorpayInstance.orders.create(orderData);
            // Save payment record
            const paymentData = {
                bookingId,
                orderId: order.id,
                amount: bookingData.totalAmount,
                currency: 'INR',
                status: 'created',
                createdAt: new Date(),
            };
            await db.collection('payments').doc(order.id).set(paymentData);
            // Update booking with order ID
            await bookingRef.update({
                'razorpay.orderId': order.id,
                updatedAt: new Date(),
            });
            functions.logger.info(`Razorpay order created via HTTP: ${order.id} for booking: ${bookingId}`);
            res.status(200).json({
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                key: ((_c = functions.config().razorpay) === null || _c === void 0 ? void 0 : _c.key_id) || 'rzp_test_default',
                bookingId,
            });
        }
        catch (error) {
            functions.logger.error('Error creating Razorpay order via HTTP:', error);
            res.status(500).json({ error: 'Failed to create order' });
        }
    });
});
/**
 * Razorpay Webhook Handler
 */
exports.razorpayWebhook = functions.https.onRequest(async (req, res) => {
    var _a;
    try {
        const signature = req.get('X-Razorpay-Signature');
        const body = req.rawBody;
        if (!signature || !body) {
            functions.logger.warn('Invalid webhook request - missing signature or body');
            res.status(400).json({ error: 'Invalid request' });
            return;
        }
        // Verify webhook signature
        const webhookSecret = ((_a = functions.config().razorpay) === null || _a === void 0 ? void 0 : _a.webhook_secret) || 'test_webhook_secret';
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex');
        if (signature !== expectedSignature) {
            functions.logger.warn('Webhook signature verification failed');
            res.status(400).json({ error: 'Invalid signature' });
            return;
        }
        const event = JSON.parse(body.toString());
        const eventId = event.event || 'unknown';
        functions.logger.info(`Processing webhook event: ${eventId}`);
        // Check for idempotency
        const processedEventDoc = db.collection('_system').doc('processedEvents').collection('events').doc(eventId);
        const eventExists = await processedEventDoc.get();
        if (eventExists.exists) {
            functions.logger.info(`Event ${eventId} already processed`);
            res.status(200).json({ status: 'already_processed' });
            return;
        }
        // Mark event as processed
        await processedEventDoc.set({
            eventId,
            processedAt: new Date(),
        });
        // Process different event types
        switch (event.event) {
            case 'payment.captured':
            case 'order.paid':
                await handlePaymentSuccess(event);
                break;
            case 'payment.failed':
                await handlePaymentFailed(event);
                break;
            case 'refund.processed':
                await handleRefundProcessed(event);
                break;
            default:
                functions.logger.info(`Unhandled event type: ${event.event}`);
        }
        res.status(200).json({ status: 'success' });
    }
    catch (error) {
        functions.logger.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * Handle successful payment
 */
async function handlePaymentSuccess(event) {
    const payment = event.payload.payment.entity;
    const orderId = payment.order_id;
    const paymentId = payment.id;
    functions.logger.info(`Processing successful payment: ${paymentId} for order: ${orderId}`);
    // Use transaction to ensure consistency
    await db.runTransaction(async (transaction) => {
        // Update payment record
        const paymentRef = db.collection('payments').doc(orderId);
        const paymentDoc = await transaction.get(paymentRef);
        if (!paymentDoc.exists) {
            throw new Error(`Payment record not found for order: ${orderId}`);
        }
        const paymentData = paymentDoc.data();
        const bookingId = paymentData === null || paymentData === void 0 ? void 0 : paymentData.bookingId;
        if (!bookingId) {
            throw new Error(`Booking ID not found in payment record: ${orderId}`);
        }
        // Update payment status
        transaction.update(paymentRef, {
            paymentId,
            status: 'captured',
            method: payment.method,
            updatedAt: new Date(),
        });
        // Update booking status
        const bookingRef = db.collection('bookings').doc(bookingId);
        transaction.update(bookingRef, {
            'razorpay.paymentId': paymentId,
            status: 'confirmed',
            paymentStatus: 'captured',
            updatedAt: new Date(),
        });
    });
    // Trigger email and PDF generation (outside transaction)
    try {
        const paymentDoc = await db.collection('payments').doc(orderId).get();
        const paymentData = paymentDoc.data();
        const bookingDoc = await db.collection('bookings').doc(paymentData === null || paymentData === void 0 ? void 0 : paymentData.bookingId).get();
        if (bookingDoc.exists && paymentDoc.exists) {
            // await sendBookingConfirmationEmail(bookingDoc.data(), paymentDoc.data()); // Temporarily disabled
            functions.logger.info('Email functionality temporarily disabled');
        }
    }
    catch (emailError) {
        functions.logger.error('Error sending confirmation email:', emailError);
        // Don't fail the webhook for email errors
    }
}
/**
 * Handle failed payment
 */
async function handlePaymentFailed(event) {
    const payment = event.payload.payment.entity;
    const orderId = payment.order_id;
    functions.logger.info(`Processing failed payment for order: ${orderId}`);
    // Get payment record
    const paymentDoc = await db.collection('payments').doc(orderId).get();
    if (!paymentDoc.exists) {
        functions.logger.warn(`Payment record not found for failed payment: ${orderId}`);
        return;
    }
    const paymentData = paymentDoc.data();
    const bookingId = paymentData === null || paymentData === void 0 ? void 0 : paymentData.bookingId;
    if (!bookingId) {
        functions.logger.warn(`Booking ID not found for failed payment: ${orderId}`);
        return;
    }
    // Update payment and booking status
    await db.runTransaction(async (transaction) => {
        transaction.update(db.collection('payments').doc(orderId), {
            status: 'failed',
            updatedAt: new Date(),
        });
        transaction.update(db.collection('bookings').doc(bookingId), {
            status: 'failed',
            paymentStatus: 'failed',
            updatedAt: new Date(),
        });
    });
}
/**
 * Handle processed refund
 */
async function handleRefundProcessed(event) {
    const refund = event.payload.refund.entity;
    const paymentId = refund.payment_id;
    functions.logger.info(`Processing refund for payment: ${paymentId}`);
    // Find payment by paymentId
    const paymentsQuery = await db.collection('payments')
        .where('paymentId', '==', paymentId)
        .limit(1)
        .get();
    if (paymentsQuery.empty) {
        functions.logger.warn(`Payment not found for refund: ${paymentId}`);
        return;
    }
    const paymentDoc = paymentsQuery.docs[0];
    const paymentData = paymentDoc.data();
    const bookingId = paymentData.bookingId;
    // Update payment and booking status
    await db.runTransaction(async (transaction) => {
        transaction.update(paymentDoc.ref, {
            status: 'refunded',
            refundId: refund.id,
            updatedAt: new Date(),
        });
        transaction.update(db.collection('bookings').doc(bookingId), {
            status: 'refunded',
            paymentStatus: 'refunded',
            updatedAt: new Date(),
        });
    });
}
/**
 * Process Refund - Callable Function (Admin Only)
 */
exports.refundPayment = functions.https.onCall(async (data, context) => {
    var _a, _b;
    try {
        // Validate authentication and admin access
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }
        // Check if user is admin (you can implement your admin check logic here)
        const adminEmails = ['amritob0327.roy@gmail.com', 'amritoballavroy@gmail.com'];
        if (!adminEmails.includes(context.auth.token.email || '')) {
            throw new functions.https.HttpsError('permission-denied', 'Admin access required');
        }
        const { paymentId, amount, reason } = data;
        if (!paymentId) {
            throw new functions.https.HttpsError('invalid-argument', 'Payment ID is required');
        }
        // Initialize Razorpay instance
        let razorpayInstance;
        try {
            const config = functions.config();
            // Try Firebase config first, then fall back to environment variables
            const razorpayKeyId = ((_a = config.razorpay) === null || _a === void 0 ? void 0 : _a.key_id) || '';
            const razorpayKeySecret = ((_b = config.razorpay) === null || _b === void 0 ? void 0 : _b.key_secret) || '';
            if (!razorpayKeyId || !razorpayKeySecret) {
                throw new functions.https.HttpsError('failed-precondition', 'Razorpay configuration not found');
            }
            razorpayInstance = new razorpay_1.default({
                key_id: razorpayKeyId,
                key_secret: razorpayKeySecret,
            });
        }
        catch (error) {
            console.error('Failed to initialize Razorpay for refund:', error);
            throw new functions.https.HttpsError('failed-precondition', 'Unable to load Razorpay configuration');
        }
        // Create refund via Razorpay
        const refundData = {
            payment_id: paymentId,
        };
        if (amount) {
            refundData.amount = Math.round(amount * 100); // Convert to paise
        }
        if (reason) {
            refundData.notes = { reason };
        }
        const refund = await razorpayInstance.payments.refund(paymentId, refundData);
        functions.logger.info(`Refund initiated: ${refund.id} for payment: ${paymentId}`);
        return {
            refundId: refund.id,
            status: refund.status,
            amount: (refund.amount || 0) / 100, // Convert back to rupees
        };
    }
    catch (error) {
        functions.logger.error('Error processing refund:', error);
        throw new functions.https.HttpsError('internal', 'Failed to process refund');
    }
});
/**
 * Send Booking Confirmation Email - Callable Function
 * This is called immediately after successful payment for instant email delivery
 */
exports.sendBookingConfirmation = functions.https.onCall(async (data, context) => {
    try {
        const { paymentId, orderId } = data;
        if (!paymentId || !orderId) {
            throw new functions.https.HttpsError('invalid-argument', 'Payment ID and Order ID are required');
        }
        functions.logger.info(`Processing booking confirmation for payment: ${paymentId}, order: ${orderId} - Email temporarily disabled`);
        // Get payment record
        const paymentDoc = await db.collection('payments').doc(orderId).get();
        if (!paymentDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Payment record not found');
        }
        const paymentData = paymentDoc.data();
        const bookingId = paymentData === null || paymentData === void 0 ? void 0 : paymentData.bookingId;
        if (!bookingId) {
            throw new functions.https.HttpsError('invalid-argument', 'Booking ID not found in payment record');
        }
        // Get booking record
        const bookingDoc = await db.collection('bookings').doc(bookingId).get();
        if (!bookingDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Booking record not found');
        }
        // Update booking status
        await db.collection('bookings').doc(bookingId).update({
            'razorpay.paymentId': paymentId,
            status: 'confirmed',
            paymentStatus: 'captured',
            updatedAt: new Date(),
        });
        // Update payment status
        await db.collection('payments').doc(orderId).update({
            paymentId,
            status: 'captured',
            updatedAt: new Date(),
        });
        // Email functionality temporarily disabled
        functions.logger.info(`Booking confirmed successfully for: ${bookingId} - Email functionality disabled`);
        return {
            success: true,
            bookingId,
            message: 'Booking confirmed successfully - Email functionality temporarily disabled'
        };
    }
    catch (error) {
        functions.logger.error('Error confirming booking:', error);
        throw new functions.https.HttpsError('internal', 'Failed to confirm booking');
    }
});
//# sourceMappingURL=razorpay.js.map