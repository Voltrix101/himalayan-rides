// API Types for Himalayan Rides Backend

export interface BookingData {
  id: string;
  userId: string;
  experienceTitle: string;
  customerName: string;
  email: string;
  phone: string;
  startDate: string;
  participants: number;
  totalAmount: number;
  baseAmount?: number;
  duration?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'captured' | 'failed' | 'refunded';
  orderId?: string;
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
  specialRequests?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface PaymentData {
  orderId: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'created' | 'captured' | 'failed' | 'refunded';
  paymentId?: string;
  paymentDetails?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailTemplateData {
  customerName: string;
  experienceTitle: string;
  startDate: string;
  participants: number;
  totalAmount: number;
  bookingId: string;
  invoicePath?: string;
  tripDetailsPath?: string;
}

export interface RefundRequest {
  paymentId: string;
  amount?: number;
  reason?: string;
}

export interface WebhookEvent {
  event: string;
  payload: {
    payment: {
      entity: any;
    };
    order: {
      entity: any;
    };
  };
}
