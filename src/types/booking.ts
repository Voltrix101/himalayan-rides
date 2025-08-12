import { Timestamp } from 'firebase/firestore';

// A generic participant structure
export interface Participant {
  name: string;
  age: string;
  phone: string;
  email: string;
  idType: string;
  idNumber: string;
}

// The unified Booking type that can handle all booking scenarios
export interface Booking {
  id: string;
  userId: string; // The user who made the booking
  type: 'tour' | 'vehicle' | 'curated' | 'experience'; // The type of booking
  
  // Details about the item being booked
  item: {
    id: string; // ID of the tripPlan, vehicle, or curatedExperience
    title: string;
    coverImage?: string;
    description?: string;
  };

  // Information about the primary user
  userInfo: {
    name: string;
    phone: string;
    email: string;
  };

  // Details specific to the booking instance
  bookingDetails: {
    startDate: Timestamp | Date;
    endDate?: Timestamp | Date;
    participantCount: number;
    participants: Participant[];
    emergencyContact: {
      name: string;
      phone: string;
    };
    specialRequests?: string;
  };

  // Payment details
  paymentInfo: {
    paymentId: string;
    orderId?: string;
    amount: number;
    currency: string;
    status: 'paid' | 'pending' | 'failed';
    paidAt: Timestamp | Date;
  };

  // Status of the booking itself
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  
  // Timestamps
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  
  // Optional URL for a generated PDF voucher
  pdfUrl?: string;
}

// A simplified version for the user's trip list (denormalized for performance)
export interface UserTrip {
  id: string; // Corresponds to the booking ID
  userId: string;
  type: Booking['type'];
  title: string;
  coverImage?: string;
  startDate: Timestamp | Date;
  endDate?: Timestamp | Date;
  status: Booking['status'];
  totalAmount: number;
  createdAt: Timestamp | Date;
}

// Analytics for the main dashboard
export interface MainAnalytics {
  totalRevenue: number;
  totalBookings: number;
  totalUsers: number;
  bookingsByType: {
    tour: number;
    vehicle: number;
    curated: number;
    experience: number;
  };
  revenueByType: {
    tour: number;
    vehicle: number;
    curated: number;
    experience: number;
  };
  lastUpdated: Timestamp | Date;
}
