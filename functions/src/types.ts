import { Timestamp } from 'firebase-admin/firestore';

// Booking data interface for Firebase Functions
export interface BookingData {
  id: string;
  userId: string;
  experienceTitle?: string;
  experienceId?: string;
  vehicleId?: string;
  participants: number;
  totalAmount: number;
  customerName: string;
  email: string;
  phone: string;
  pickupLocation: string;
  dropLocation?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;
  status: 'draft' | 'pending_payment' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'failed' | 'refunded';
  paymentStatus?: 'pending' | 'captured' | 'failed' | 'refunded';
  specialRequests?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  razorpay?: {
    orderId: string;
    paymentId?: string;
  };
  invoiceUrl?: string;
  tripDetailsUrl?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// Payment data interface for Firebase Functions
export interface PaymentData {
  id: string;
  bookingId: string;
  orderId: string;
  paymentId?: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  method?: string;
  razorpaySignature?: string;
  refundId?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// Razorpay order response interface
export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id?: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

// Razorpay payment response interface
export interface RazorpayPaymentResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  invoice_id?: string;
  international: boolean;
  method: string;
  amount_refunded: number;
  refund_status?: string;
  captured: boolean;
  description?: string;
  card_id?: string;
  bank?: string;
  wallet?: string;
  vpa?: string;
  email: string;
  contact: string;
  notes: Record<string, string>;
  fee?: number;
  tax?: number;
  error_code?: string;
  error_description?: string;
  error_source?: string;
  error_step?: string;
  error_reason?: string;
  created_at: number;
}

// Email template data interface
export interface EmailTemplateData {
  customerName: string;
  bookingId: string;
  experienceTitle?: string;
  startDate?: string;
  participants: number;
  totalAmount: number;
  pickupLocation: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  websiteUrl: string;
}

// Firebase error interface
export interface FirebaseError {
  code: string;
  message: string;
  details?: string;
}

// PDF generation result interface
export interface PDFResult {
  path: string;
  filename: string;
  url?: string;
}

// Webhook payload interfaces
export interface RazorpayWebhookPayload {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment: {
      entity: RazorpayPaymentResponse;
    };
    order?: {
      entity: RazorpayOrderResponse;
    };
  };
  created_at: number;
}

// Refund interfaces
export interface RefundRequest {
  paymentId: string;
  amount?: number;
  notes?: Record<string, string>;
}

export interface RefundData {
  payment_id: string;
  amount?: number;
  notes?: Record<string, string>;
}

export interface RefundResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  payment_id: string;
  notes: Record<string, string>;
  receipt?: string;
  acquirer_data: Record<string, unknown>;
  created_at: number;
  batch_id?: string;
  status: string;
  speed_processed?: string;
  speed_requested?: string;
}