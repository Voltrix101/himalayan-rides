import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

// Sample data for testing
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 9876543210',
    address: 'Delhi, India',
    totalBookings: 3,
    totalSpent: 45000,
    status: 'active',
    preferences: {
      preferredVehicleType: 'bike',
      preferredRegions: ['Ladakh', 'Himachal'],
      emailNotifications: true,
      smsNotifications: false
    },
    createdAt: Timestamp.now(),
    lastLogin: Timestamp.now()
  },
  {
    name: 'Sarah Smith',
    email: 'sarah.smith@example.com',
    phone: '+91 9876543211',
    address: 'Mumbai, India',
    totalBookings: 1,
    totalSpent: 25000,
    status: 'active',
    preferences: {
      preferredVehicleType: 'suv',
      preferredRegions: ['Goa', 'Kerala'],
      emailNotifications: true,
      smsNotifications: true
    },
    createdAt: Timestamp.now(),
    lastLogin: Timestamp.now()
  },
  {
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    phone: '+91 9876543212',
    totalBookings: 0,
    totalSpent: 0,
    status: 'inactive',
    preferences: {
      emailNotifications: false,
      smsNotifications: false
    },
    createdAt: Timestamp.now()
  }
];

const sampleVehicles = [
  {
    name: 'Royal Enfield Himalayan',
    type: 'bike',
    brand: 'Royal Enfield',
    model: 'Himalayan',
    year: 2023,
    pricePerDay: 2500,
    features: ['ABS', 'Long Range Tank', 'Crash Guard', 'Panniers'],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    isAvailable: true,
    fuelType: 'petrol',
    seatingCapacity: 2,
    transmission: 'manual',
    location: 'Leh, Ladakh',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: 'Mahindra Thar',
    type: 'suv',
    brand: 'Mahindra',
    model: 'Thar',
    year: 2024,
    pricePerDay: 4500,
    features: ['4WD', 'Convertible Top', 'Hill Assist', 'Rock Crawler'],
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800',
    isAvailable: true,
    fuelType: 'diesel',
    seatingCapacity: 4,
    transmission: 'manual',
    location: 'Manali, Himachal',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: 'Toyota Fortuner',
    type: 'suv',
    brand: 'Toyota',
    model: 'Fortuner',
    year: 2023,
    pricePerDay: 6000,
    features: ['AWD', 'Leather Seats', 'Sunroof', 'Navigation'],
    image: 'https://images.unsplash.com/photo-1549399411-e689de8a6cc9?w=800',
    isAvailable: false,
    fuelType: 'diesel',
    seatingCapacity: 7,
    transmission: 'automatic',
    location: 'Rishikesh, Uttarakhand',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

const sampleDestinations = [
  {
    name: 'Pangong Lake',
    description: 'A breathtaking high-altitude lake stretching from India to Tibet, famous for its changing colors.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    altitude: '4,350m',
    bestTime: 'May to September',
    difficulty: 'Moderate',
    highlights: ['Crystal clear waters', 'Stunning mountain backdrop', '3 Idiots filming location', 'Border area experience'],
    distance: '160km from Leh',
    price: 15000,
    rating: 4.8,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: 'Nubra Valley',
    description: 'A cold desert valley known for its sand dunes, double-humped camels, and monasteries.',
    image: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800',
    altitude: '3,048m',
    bestTime: 'June to September',
    difficulty: 'Challenging',
    highlights: ['Khardung La Pass', 'Camel safari', 'Diskit Monastery', 'Sand dunes'],
    distance: '120km from Leh',
    price: 18000,
    rating: 4.9,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: 'Spiti Valley',
    description: 'A high-altitude desert valley known for its Buddhist monasteries and stunning landscapes.',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
    altitude: '3,810m',
    bestTime: 'May to October',
    difficulty: 'Challenging',
    highlights: ['Key Monastery', 'Chandratal Lake', 'Ancient villages', 'Fossil hunting'],
    distance: '200km from Manali',
    price: 22000,
    rating: 4.7,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

const sampleBikeTours = [
  {
    name: 'Leh Ladakh Adventure',
    description: 'Ultimate motorcycle adventure through the highest motorable roads in the world.',
    region: 'Ladakh',
    duration: 12,
    difficulty: 'Challenging',
    pricePerPerson: 55000,
    maxGroupSize: 8,
    startLocation: 'Manali',
    endLocation: 'Leh',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800',
    highlights: [
      'Rohtang Pass crossing',
      'Khardung La - World\'s highest motorable road',
      'Pangong Lake overnight stay',
      'Magnetic Hill experience',
      'Monastery visits'
    ],
    inclusions: [
      'Royal Enfield motorcycle',
      'Accommodation in camps/hotels',
      'All meals',
      'Fuel costs',
      'Permits and documentation',
      'Support vehicle',
      'Professional guide'
    ],
    exclusions: [
      'Personal expenses',
      'Travel insurance',
      'Flight tickets',
      'Extra activities'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Manali',
        description: 'Check-in, bike allocation, and briefing session.',
        activities: ['Hotel check-in', 'Bike fitting', 'Safety briefing', 'Local sightseeing'],
        accommodation: 'Hotel in Manali',
        meals: ['Dinner'],
        distance: '0km',
        altitude: '2,050m'
      },
      {
        day: 2,
        title: 'Manali to Jispa',
        description: 'First day of riding through Rohtang Pass to Jispa valley.',
        activities: ['Early morning start', 'Rohtang Pass crossing', 'Photography stops'],
        accommodation: 'Camp in Jispa',
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        distance: '140km',
        altitude: '3,200m'
      }
    ],
    bestTime: 'June to September',
    termsAndConditions: 'Standard terms and conditions apply. Participants must have valid driving license.',
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

const sampleBookings = [
  {
    userId: 'user1',
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
    type: 'vehicle',
    itemId: 'vehicle1',
    itemName: 'Royal Enfield Himalayan',
    startDate: Timestamp.fromDate(new Date('2024-06-15')),
    endDate: Timestamp.fromDate(new Date('2024-06-20')),
    guests: 2,
    totalAmount: 12500,
    status: 'confirmed',
    paymentStatus: 'paid',
    specialRequests: 'Need extra helmet',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    userId: 'user2',
    userName: 'Sarah Smith',
    userEmail: 'sarah.smith@example.com',
    type: 'destination',
    itemId: 'dest1',
    itemName: 'Pangong Lake Tour',
    startDate: Timestamp.fromDate(new Date('2024-07-10')),
    endDate: Timestamp.fromDate(new Date('2024-07-15')),
    guests: 1,
    totalAmount: 15000,
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

export async function populateSampleData() {
  try {
    console.log('🌱 Starting to populate sample data...');
    
    // Add users
    console.log('👥 Adding sample users...');
    for (const user of sampleUsers) {
      await addDoc(collection(db, 'users'), user);
    }
    
    // Add vehicles
    console.log('🚗 Adding sample vehicles...');
    for (const vehicle of sampleVehicles) {
      await addDoc(collection(db, 'vehicles'), vehicle);
    }
    
    // Add destinations
    console.log('🏔️ Adding sample destinations...');
    for (const destination of sampleDestinations) {
      await addDoc(collection(db, 'destinations'), destination);
    }
    
    // Add bike tours
    console.log('🏍️ Adding sample bike tours...');
    for (const tour of sampleBikeTours) {
      await addDoc(collection(db, 'bikeTours'), tour);
    }
    
    // Add bookings
    console.log('📅 Adding sample bookings...');
    for (const booking of sampleBookings) {
      await addDoc(collection(db, 'bookings'), booking);
    }
    
    console.log('✅ Sample data populated successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error populating sample data:', error);
    return false;
  }
}

// Helper function to clear all collections (use with caution!)
export async function clearAllData() {
  try {
    console.log('🧹 This function would clear all data. Implement with getDocs and batch delete if needed.');
    // Implementation would require getting all docs and batch deleting them
    return true;
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    return false;
  }
}
