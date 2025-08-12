export interface TripDay {
  day: number;
  title: string;
  route: string;
  distance_km: number;
  highlights: string[];
  stay: string;
  permit_required: boolean;
  altitude?: string;
  description?: string;
  activities?: string[];
  meals_included?: boolean;
  accommodation_type?: 'hotel' | 'camp' | 'guesthouse' | 'homestay';
}

export interface TripPlan {
  id: string;
  name: string;
  duration: number;
  description: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Expert';
  price: number;
  image: string;
  rating: number;
  category: 'bike' | 'car' | 'both';
  includes: string[];
  excludes?: string[];
  days: TripDay[];
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  is_active: boolean;
}

export interface TripBooking {
  id: string;
  trip_plan_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  user_phone: string;
  start_date: Date;
  end_date: Date;
  participants: number;
  vehicle_preference: string;
  total_amount: number;
  booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded';
  special_requests?: string;
  created_at: Date;
  updated_at: Date;
}
