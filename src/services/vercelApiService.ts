// Vercel API Service
// This replaces Firebase Cloud Functions with Vercel Serverless Functions

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? `${window.location.origin}/api`
  : '/api';

/**
 * Generic API call function with error handling
 */
async function apiCall<T = any>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Create Razorpay Order
 * Replaces: httpsCallable(functions, 'createRazorpayOrder')
 */
export async function createRazorpayOrder(bookingData: any, userId: string) {
  return apiCall('/createRazorpayOrder', {
    method: 'POST',
    body: JSON.stringify({ bookingData, userId }),
  });
}

/**
 * Send Booking Confirmation
 * Replaces: httpsCallable(functions, 'sendBookingConfirmation')
 */
export async function sendBookingConfirmation(bookingId: string, paymentId: string) {
  return apiCall('/sendBookingConfirmation', {
    method: 'POST',
    body: JSON.stringify({ bookingId, paymentId }),
  });
}

/**
 * Send Booking Confirmation Email
 * Replaces: direct function call (now API endpoint)
 */
export async function sendBookingConfirmationEmail(bookingId: string, paymentId: string) {
  return apiCall('/sendBookingConfirmationEmail', {
    method: 'POST',
    body: JSON.stringify({ bookingId, paymentId }),
  });
}

/**
 * Refund Payment
 * Replaces: httpsCallable(functions, 'refundPayment')
 */
export async function refundPayment(paymentId: string, refundAmount?: number, reason?: string) {
  return apiCall('/refundPayment', {
    method: 'POST',
    body: JSON.stringify({ paymentId, refundAmount, reason }),
  });
}

/**
 * Health Check
 * New endpoint for monitoring
 */
export async function healthCheck() {
  return apiCall('/healthCheck', {
    method: 'GET',
  });
}

/**
 * Initialize Razorpay payment with order details
 * This function handles the Razorpay frontend integration
 */
export function initializeRazorpayPayment(orderData: any): Promise<any> {
  return new Promise((resolve, reject) => {
    // Check if Razorpay is loaded
    if (typeof window === 'undefined' || !window.Razorpay) {
      reject(new Error('Razorpay SDK not loaded'));
      return;
    }

    const options = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: orderData.name || 'Himalayan Rides',
      description: orderData.description,
      order_id: orderData.orderId,
      handler: function (response: any) {
        resolve(response);
      },
      prefill: {
        name: orderData.customerName || '',
        email: orderData.customerEmail || '',
        contact: orderData.customerPhone || '',
      },
      notes: orderData.notes || {},
      theme: {
        color: '#f97316', // Orange color for Himalayan Rides theme
      },
      modal: {
        ondismiss: function () {
          reject(new Error('Payment cancelled by user'));
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
      reject(new Error(response.error.description || 'Payment failed'));
    });

    rzp.open();
  });
}

/**
 * Complete payment flow - from order creation to confirmation
 * This replaces the entire Firebase Functions payment flow
 */
export async function processPayment(bookingData: any, userId: string) {
  try {
    // Step 1: Create Razorpay order
    console.log('Creating Razorpay order...');
    const orderResponse = await createRazorpayOrder(bookingData, userId);
    
    // Step 2: Initialize Razorpay payment
    console.log('Initializing Razorpay payment...');
    const paymentResponse = await initializeRazorpayPayment({
      ...orderResponse,
      customerName: bookingData.customerName,
      customerEmail: bookingData.email,
      customerPhone: bookingData.phone,
    });
    
    // Step 3: Send booking confirmation
    console.log('Sending booking confirmation...');
    await sendBookingConfirmation(orderResponse.bookingId, paymentResponse.razorpay_payment_id);
    
    // Step 4: Send confirmation email (optional)
    try {
      console.log('Sending confirmation email...');
      await sendBookingConfirmationEmail(orderResponse.bookingId, paymentResponse.razorpay_payment_id);
    } catch (emailError) {
      console.warn('Email sending failed, but payment was successful:', emailError);
    }
    
    return {
      success: true,
      bookingId: orderResponse.bookingId,
      paymentId: paymentResponse.razorpay_payment_id,
      orderId: paymentResponse.razorpay_order_id,
    };
    
  } catch (error) {
    console.error('Payment process failed:', error);
    throw error;
  }
}

// Type definitions for window.Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}
