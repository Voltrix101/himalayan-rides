export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  region: string;
  licenseUrl?: string;
  emergencyContact?: string;
  isAuthenticated: boolean;
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'bike' | 'car' | 'suv';
  region: string;
  price: number;
  image: string;
  rating: number;
  fuel: string;
  gearbox: string;
  seats?: number;
  features: string[];
  available: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  vehicleId: string;
  vehicle: Vehicle;
  startDate: Date;
  endDate: Date;
  pickupLocation: string;
  dropLocation: string;
  totalAmount: number;
  status: 'confirmed' | 'active' | 'completed' | 'cancelled';
  paymentId: string;
  createdAt: Date;
}

export interface Region {
  id: string;
  name: string;
  description: string;
  image: string;
  color: string;
  gradient: string;
}

export interface TourItinerary {
  day: number;
  title: string;
  description: string;
}

export interface BikeTourPlan {
  id: string;
  title: string;
  duration: string;
  price: number;
  highlights: string[];
  itinerary: TourItinerary[];
}