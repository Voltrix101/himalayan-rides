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
  createdAt?: Date;
  updatedAt?: Date;
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
  description?: string;
  videoURL?: string;
  tags?: string[];
  coverImage?: string;
  isFeatured?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TripPlan {
  id: string;
  title: string;
  route: string[];
  duration: string;
  price: number;
  description: string;
  mapURL?: string;
  coverImage: string;
  isFeatured: boolean;
  highlights: string[];
  itinerary: TourItinerary[];
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Expert';
  bestSeason: string[];
  groupSize: {
    min: number;
    max: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ExplorePlan {
  id: string;
  title: string;
  description: string;
  videoURL: string;
  highlights: string[];
  tags: string[];
  coverImage: string;
  duration?: string;
  difficulty?: string;
  bestTime?: string;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Destination {
  id: string;
  title: string;
  description: string;
  highlights: string[];
  coverImage: string;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Experience {
  id: string;
  title: string;
  description: string;
  tags: string[];
  coverImage: string;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}