export interface CuratedExperience {
  id: string;
  title: string;
  description: string;
  price: number;
  days: number;
  highlights: string[];
  image: string;
  category: 'Adventure' | 'Cultural' | 'Spiritual' | 'Photography';
  rating: number;
  inclusions: string[];
  exclusions: string[];
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  maxParticipants: number;
  itinerary: Array<{
    day: number;
    title: string;
    activities: string[];
    accommodation?: string;
    meals?: string;
  }>;
}

export interface CuratedBooking {
  id: string;
  uid: string;
  experienceId: string;
  type: 'curated';
  userInfo: {
    name: string;
    email: string;
    phone: string;
    age: string;
    idType: string;
    idNumber: string;
    emergencyContact: {
      name: string;
      phone: string;
    };
  };
  experienceDetails: CuratedExperience;
  bookingInfo: {
    startDate: Date;
    endDate: Date;
    participants: number;
    specialRequests?: string;
  };
  payment: {
    amount: number;
    currency: string;
    paymentId: string;
    orderId?: string;
    status: 'pending' | 'completed' | 'failed';
    timestamp: Date;
    method: string;
  };
  pdfUrl?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
}

export interface AdminStats {
  totalRevenue: number;
  totalBookings: number;
  totalCuratedBookings: number;
  curatedRevenue: number;
  lastBookingTime: Date;
  recentCuratedBookings: Array<{
    id: string;
    customerName: string;
    experienceName: string;
    amount: number;
    date: Date;
  }>;
}
