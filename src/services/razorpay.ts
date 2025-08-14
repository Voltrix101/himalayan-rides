import { db } from '../config/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOrderData {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, any>;
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
}

class RazorpayService {
  private functions = getFunctions();

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
   * Create a new Razorpay order
   */
  async createOrder(bookingData: BookingData): Promise<RazorpayOrderResponse> {
    try {
      // First save booking to Firestore
      const bookingRef = await this.saveBooking(bookingData);
      
      // Create Razorpay order via Cloud Function
      const createOrderFunction = httpsCallable(this.functions, 'createRazorpayOrder');
      const result = await createOrderFunction({ bookingId: bookingRef.id });
      
      return result.data as RazorpayOrderResponse;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  /**
   * Save booking to Firestore
   */
  async saveBooking(bookingData: BookingData, orderId: string): Promise<string> {
    try {
      const booking = {
        ...bookingData,
        orderId,
        paymentStatus: 'created',
        bookingStatus: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'bookings'), booking);
      return docRef.id;
    } catch (error) {
      console.error('Error saving booking:', error);
      throw error;
    }
  }

  /**
   * Update booking after payment
   */
  async updateBooking(bookingId: string, paymentData: RazorpayPaymentData): Promise<void> {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        paymentId: paymentData.razorpay_payment_id,
        paymentStatus: 'captured',
        bookingStatus: 'confirmed',
        paymentData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  }

  /**
   * Process payment with Razorpay
   */
  async processPayment(
    bookingData: BookingData,
    onSuccess?: (paymentData: RazorpayPaymentData) => void,
    onError?: (error: any) => void
  ): Promise<void> {
    try {
      // Load Razorpay script
      await this.loadRazorpayScript();

      // Create order
      const orderData = await this.createOrder(bookingData);
      
      // Save booking to Firestore
      const bookingId = await this.saveBooking(bookingData, orderData.id);

      // Configure Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Your Razorpay key ID
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Himalayan Rides',
        description: bookingData.experienceTitle,
        image: '/favicon.svg',
        order_id: orderData.id,
        handler: async (response: RazorpayPaymentData) => {
          try {
            // Update booking with payment info
            await this.updateBooking(bookingId, response);
            
            // Call success callback
            if (onSuccess) {
              onSuccess(response);
            }
          } catch (error) {
            console.error('Error handling payment success:', error);
            if (onError) {
              onError(error);
            }
          }
        },
        prefill: {
          name: bookingData.customerName,
          email: bookingData.email,
          contact: bookingData.phone
        },
        notes: {
          bookingId,
          experienceId: bookingData.experienceId
        },
        theme: {
          color: '#FF6B35'
        },
        modal: {
          ondismiss: () => {
            console.log('Payment cancelled by user');
          }
        }
      };

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        if (onError) {
          onError(response.error);
        }
      });

      rzp.open();

    } catch (error) {
      console.error('Error processing payment:', error);
      if (onError) {
        onError(error);
      }
    }
  }

  /**
   * Initiate refund
   */
  async initiateRefund(paymentId: string, amount?: number, reason?: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/processRefund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          amount,
          reason
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to initiate refund: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error initiating refund:', error);
      throw error;
    }
  }
}

export const razorpayService = new RazorpayService();
export default razorpayService;
