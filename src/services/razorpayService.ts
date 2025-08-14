import { db, functions } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

declare global {
  interface Window {
    Razorpay: typeof import('razorpay');
  }
}

export interface BookingData {
  experienceId?: string;
  experienceTitle?: string;
  customerName: string;
  email: string;
  phone: string;
  participants: number;
  startDate: Date;
  endDate?: Date;
  totalAmount: number;
  pickupLocation: string;
  specialRequests?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface RazorpayPaymentData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
  bookingId?: string;
}

class RazorpayService {
  private functions = functions;

  constructor() {
    // Functions emulator connection is handled in firebase config
    console.log('RazorpayService initialized');
  }

  /**
   * Load Razorpay script dynamically
   */
  loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.head.appendChild(script);
    });
  }

  /**
   * Save booking to Firestore
   */
  async saveBooking(bookingData: BookingData, userId: string): Promise<string> {
    try {
      const booking = {
        ...bookingData,
        userId,
        status: 'draft',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'bookings'), booking);
      console.log('Booking saved with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving booking:', error);
      throw error;
    }
  }

  /**
   * Create a new Razorpay order
   */
  async createOrder(bookingData: BookingData, userId: string): Promise<RazorpayOrderResponse> {
    try {
      // Use Firebase callable function
      const createOrderFunction = httpsCallable(this.functions, 'createRazorpayOrder');
      const result = await createOrderFunction({ 
        bookingData: {
          ...bookingData,
          startDate: bookingData.startDate.toISOString(),
          endDate: bookingData.endDate?.toISOString(),
        }, 
        userId 
      });
      
      return result.data as RazorpayOrderResponse;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  /**
   * Open Razorpay checkout
   */
  async openCheckout(
    orderData: RazorpayOrderResponse,
    bookingData: BookingData,
    onSuccess: (response: RazorpayPaymentData) => void,
    onFailure: (error: Error) => void
  ): Promise<void> {
    try {
      await this.loadRazorpayScript();

      const options = {
        key: import.meta.env?.VITE_RAZORPAY_KEY_ID || orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Himalayan Rides',
        description: bookingData.experienceTitle || 'Adventure Booking',
        order_id: orderData.orderId,
        prefill: {
          name: bookingData.customerName,
          email: bookingData.email,
          contact: bookingData.phone,
        },
        theme: {
          color: '#FF6B35',
        },
        handler: (response: RazorpayPaymentData) => {
          console.log('Payment successful:', response);
          onSuccess(response);
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
            onFailure(new Error('Payment cancelled by user'));
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error opening Razorpay checkout:', error);
      onFailure(error);
    }
  }

  /**
   * Process refund (Admin only)
   */
  async processRefund(paymentId: string, amount?: number, reason?: string): Promise<Record<string, unknown>> {
    try {
      const refundFunction = httpsCallable(this.functions, 'refundPayment');
      const result = await refundFunction({ paymentId, amount, reason });
      
      return result.data;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }
}

export const razorpayService = new RazorpayService();
