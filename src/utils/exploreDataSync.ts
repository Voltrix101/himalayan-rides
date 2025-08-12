import { collection, addDoc, writeBatch, doc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { bikeTourPlans, regions, vehicles } from '../data/mockData';
import toast from 'react-hot-toast';

// Data from OptimizedExploreLadakh component
const exploreDestinations = [
  {
    id: 'pangong',
    name: 'Pangong Tso',
    description: 'A high-altitude lake that changes colors throughout the day, stretching across India and China.',
    image: 'https://images.pexels.com/photos/1049298/pexels-photo-1049298.jpeg?auto=compress&cs=tinysrgb&w=600',
    altitude: '4,350m',
    bestTime: 'May - September',
    difficulty: 'Moderate',
    highlights: ['Color-changing waters', 'Bollywood filming location', 'Camping under stars'],
    distance: '160km from Leh',
    price: 15000,
    rating: 4.8
  },
  {
    id: 'nubra',
    name: 'Nubra Valley',
    description: 'The valley of flowers with sand dunes, double-humped camels, and ancient monasteries.',
    image: 'https://images.pexels.com/photos/2325446/pexels-photo-2325446.jpeg?auto=compress&cs=tinysrgb&w=600',
    altitude: '3,048m',
    bestTime: 'April - October',
    difficulty: 'Easy',
    highlights: ['Bactrian camels', 'Sand dunes', 'Diskit Monastery'],
    distance: '120km from Leh',
    price: 12000,
    rating: 4.7
  },
  {
    id: 'khardungla',
    name: 'Khardung La Pass',
    description: 'World\'s highest motorable pass offering breathtaking views of the Himalayas.',
    image: 'https://images.pexels.com/photos/3030336/pexels-photo-3030336.jpeg?auto=compress&cs=tinysrgb&w=600',
    altitude: '5,359m',
    bestTime: 'May - September',
    difficulty: 'Challenging',
    highlights: ['Highest motorable road', 'Panoramic mountain views', 'Adventure riding'],
    distance: '40km from Leh',
    price: 8000,
    rating: 4.9
  },
  {
    id: 'tso-moriri',
    name: 'Tso Moriri',
    description: 'A pristine high-altitude lake surrounded by snow-capped mountains and wildlife.',
    image: 'https://images.pexels.com/photos/5120892/pexels-photo-5120892.jpeg?auto=compress&cs=tinysrgb&w=600',
    altitude: '4,522m',
    bestTime: 'June - September',
    difficulty: 'Challenging',
    highlights: ['Wildlife sanctuary', 'Crystal clear waters', 'Remote location'],
    distance: '220km from Leh',
    price: 20000,
    rating: 4.6
  }
];

const exploreExperiences = [
  {
    id: 'monastery-tour',
    title: 'Ancient Monasteries Tour',
    description: 'Explore centuries-old Buddhist monasteries and immerse in spiritual culture.',
    image: 'https://images.pexels.com/photos/6176940/pexels-photo-6176940.jpeg?auto=compress&cs=tinysrgb&w=600',
    duration: '2 Days',
    price: 8000,
    rating: 4.5,
    category: 'Cultural',
    highlights: ['Hemis Monastery', 'Thiksey Monastery', 'Cultural immersion']
  },
  {
    id: 'photography-expedition',
    title: 'Ladakh Photography Expedition',
    description: 'Capture the raw beauty of Ladakh with professional photography guidance.',
    image: 'https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg?auto=compress&cs=tinysrgb&w=600',
    duration: '5 Days',
    price: 25000,
    rating: 4.8,
    category: 'Photography',
    highlights: ['Golden hour shots', 'Landscape photography', 'Expert guidance']
  }
];

const exploreBikeTours = [
  {
    id: 'leh-ladakh-ultimate',
    name: 'Leh-Ladakh Ultimate Adventure',
    description: 'The ultimate motorcycle adventure through the highest motorable passes in the world.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    region: 'Ladakh',
    duration: 14,
    distance: '2,500 km',
    difficulty: 'Extreme',
    pricePerPerson: 85000,
    maxGroupSize: 8,
    startLocation: 'Delhi',
    endLocation: 'Delhi',
    rating: 4.9,
    highlights: ['Khardung La Pass', 'Nubra Valley', 'Pangong Lake', 'Tso Moriri'],
    inclusions: ['Royal Enfield 350/500', 'Fuel', 'Accommodation', 'Meals', 'Guide'],
    exclusions: ['Personal expenses', 'Travel insurance', 'Flight tickets'],
    bestTime: 'June to September',
    route: 'Delhi → Manali → Leh → Nubra → Pangong → Delhi',
    itinerary: [
      {
        day: 1,
        title: 'Delhi to Manali',
        description: 'Scenic drive through the hills to reach Manali base camp.',
        activities: ['Hotel check-in', 'Bike allocation', 'Route briefing'],
        accommodation: 'Hotel in Manali',
        meals: ['Dinner'],
        distance: '550km',
        altitude: '2,050m'
      },
      {
        day: 2,
        title: 'Manali to Jispa',
        description: 'First day of high-altitude riding via Rohtang Pass.',
        activities: ['Early morning start', 'Rohtang Pass crossing', 'Acclimatization stops'],
        accommodation: 'Camp in Jispa',
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        distance: '140km',
        altitude: '3,200m'
      }
    ]
  },
  {
    id: 'spiti-valley-circuit',
    name: 'Spiti Valley Circuit',
    description: 'Journey through the moonscape of Spiti Valley with ancient monasteries and pristine lakes.',
    image: 'https://images.unsplash.com/photo-1626618012641-bfbca5a31239?w=800',
    region: 'Spiti Valley',
    duration: 10,
    distance: '1,800 km',
    difficulty: 'Challenging',
    pricePerPerson: 65000,
    maxGroupSize: 10,
    startLocation: 'Delhi',
    endLocation: 'Delhi',
    rating: 4.8,
    highlights: ['Key Monastery', 'Chandratal Lake', 'Kaza', 'Pin Valley'],
    inclusions: ['Bike Rental', 'Fuel', 'Camping', 'Meals', 'Permits'],
    exclusions: ['Personal expenses', 'Travel insurance'],
    bestTime: 'May to October',
    route: 'Delhi → Shimla → Kaza → Manali → Delhi',
    itinerary: [
      {
        day: 1,
        title: 'Delhi to Shimla',
        description: 'Journey to the queen of hills.',
        activities: ['Travel to Shimla', 'Evening rest'],
        accommodation: 'Hotel in Shimla',
        meals: ['Dinner'],
        distance: '350km',
        altitude: '2,200m'
      }
    ]
  },
  {
    id: 'himalayan-base-camp',
    name: 'Himalayan Base Camp Ride',
    description: 'Epic journey to the base of the world\'s highest peaks with expert guides.',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800',
    region: 'Nepal/Tibet',
    duration: 12,
    distance: '2,200 km',
    difficulty: 'Extreme',
    pricePerPerson: 95000,
    maxGroupSize: 6,
    startLocation: 'Kathmandu',
    endLocation: 'Kathmandu',
    rating: 4.9,
    highlights: ['Everest Base Camp View', 'Rongbuk Monastery', 'Mount Kailash', 'Mansarovar'],
    inclusions: ['Premium Bikes', 'Oxygen Support', 'Expert Guide', 'All Permits'],
    exclusions: ['International flights', 'Nepal visa', 'Personal gear'],
    bestTime: 'April to October',
    route: 'Kathmandu → Tingri → EBC → Kailash → Kathmandu',
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Kathmandu',
        description: 'Welcome to Nepal and preparation day.',
        activities: ['Airport pickup', 'Hotel check-in', 'Briefing session'],
        accommodation: 'Hotel in Kathmandu',
        meals: ['Dinner'],
        distance: '0km',
        altitude: '1,400m'
      }
    ]
  }
];

// Transform mock data vehicles to match admin interface
const transformVehicleData = (vehicle: any) => ({
  name: vehicle.name,
  type: vehicle.type,
  brand: vehicle.name.split(' ')[0], // Extract brand from name
  model: vehicle.name.split(' ').slice(1).join(' '), // Extract model
  year: 2023, // Default year
  pricePerDay: vehicle.price,
  features: vehicle.features || ['Standard features'],
  image: vehicle.image,
  isAvailable: vehicle.available,
  fuelType: vehicle.fuel?.toLowerCase() || 'petrol',
  seatingCapacity: vehicle.seats || 2,
  transmission: vehicle.gearbox?.toLowerCase() || 'manual',
  location: `${vehicle.region} Region`,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
});

// Transform destinations data
const transformDestinationData = (destination: any) => ({
  name: destination.name,
  description: destination.description,
  image: destination.image,
  altitude: destination.altitude,
  bestTime: destination.bestTime,
  difficulty: destination.difficulty,
  highlights: destination.highlights,
  distance: destination.distance,
  price: destination.price,
  rating: destination.rating,
  isActive: true,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
});

// Transform bike tours data
const transformBikeTourData = (tour: any) => ({
  name: tour.name,
  description: tour.description,
  region: tour.region,
  duration: tour.duration,
  difficulty: tour.difficulty,
  pricePerPerson: tour.pricePerPerson,
  maxGroupSize: tour.maxGroupSize,
  startLocation: tour.startLocation,
  endLocation: tour.endLocation,
  image: tour.image,
  highlights: tour.highlights,
  inclusions: tour.inclusions,
  exclusions: tour.exclusions,
  itinerary: tour.itinerary || [],
  bestTime: tour.bestTime,
  termsAndConditions: 'Standard terms and conditions apply. Valid riding license required.',
  isActive: true,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
});

// Transform experience data to destinations format
const transformExperienceData = (experience: any) => ({
  name: experience.title,
  description: experience.description,
  image: experience.image,
  altitude: 'Varies',
  bestTime: 'Year Round',
  difficulty: 'Easy',
  highlights: experience.highlights,
  distance: experience.duration,
  price: experience.price,
  rating: experience.rating,
  isActive: true,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
});

// Create sample users data
const createSampleUsers = () => [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    phone: '+91 9876543210',
    address: 'Delhi, India',
    totalBookings: 2,
    totalSpent: 35000,
    status: 'active',
    preferences: {
      preferredVehicleType: 'bike',
      preferredRegions: ['Ladakh', 'Spiti'],
      emailNotifications: true,
      smsNotifications: true
    },
    createdAt: Timestamp.now(),
    lastLogin: Timestamp.now()
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    phone: '+91 9876543211',
    address: 'Mumbai, India',
    totalBookings: 1,
    totalSpent: 65000,
    status: 'active',
    preferences: {
      preferredVehicleType: 'suv',
      preferredRegions: ['Ladakh'],
      emailNotifications: true,
      smsNotifications: false
    },
    createdAt: Timestamp.now(),
    lastLogin: Timestamp.now()
  },
  {
    name: 'Amit Singh',
    email: 'amit.singh@email.com',
    phone: '+91 9876543212',
    address: 'Chandigarh, India',
    totalBookings: 3,
    totalSpent: 85000,
    status: 'active',
    preferences: {
      preferredVehicleType: 'bike',
      preferredRegions: ['Spiti', 'Sikkim'],
      emailNotifications: true,
      smsNotifications: true
    },
    createdAt: Timestamp.now(),
    lastLogin: Timestamp.now()
  }
];

// Create sample bookings
const createSampleBookings = () => [
  {
    userId: 'user1',
    userName: 'Rajesh Kumar',
    userEmail: 'rajesh.kumar@email.com',
    type: 'vehicle',
    itemId: 'vehicle1',
    itemName: 'Royal Enfield Himalayan',
    startDate: Timestamp.fromDate(new Date('2024-06-15')),
    endDate: Timestamp.fromDate(new Date('2024-06-22')),
    guests: 2,
    totalAmount: 17500,
    status: 'confirmed',
    paymentStatus: 'paid',
    specialRequests: 'Need extra protective gear',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    userId: 'user2',
    userName: 'Priya Sharma',
    userEmail: 'priya.sharma@email.com',
    type: 'bikeTour',
    itemId: 'tour1',
    itemName: 'Leh-Ladakh Ultimate Adventure',
    startDate: Timestamp.fromDate(new Date('2024-07-10')),
    endDate: Timestamp.fromDate(new Date('2024-07-24')),
    guests: 1,
    totalAmount: 85000,
    status: 'pending',
    paymentStatus: 'pending',
    specialRequests: 'Vegetarian meals only',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    userId: 'user3',
    userName: 'Amit Singh',
    userEmail: 'amit.singh@email.com',
    type: 'destination',
    itemId: 'dest1',
    itemName: 'Pangong Tso Adventure',
    startDate: Timestamp.fromDate(new Date('2024-08-05')),
    endDate: Timestamp.fromDate(new Date('2024-08-10')),
    guests: 2,
    totalAmount: 30000,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

// Check if collections are empty
async function isCollectionEmpty(collectionName: string): Promise<boolean> {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.empty;
  } catch (error) {
    console.error(`Error checking ${collectionName} collection:`, error);
    return true;
  }
}

// Main sync function
export async function syncExploreDataToFirebase(): Promise<boolean> {
  try {
    console.log('🔄 Starting data synchronization from explore page to Firebase...');
    
    const batch = writeBatch(db);
    let batchCount = 0;
    const BATCH_LIMIT = 500; // Firestore batch limit
    
    // Helper function to commit batch when needed
    const commitBatchIfNeeded = async () => {
      if (batchCount >= BATCH_LIMIT) {
        await batch.commit();
        console.log(`📦 Committed batch of ${batchCount} operations`);
        batchCount = 0;
      }
    };

    // 1. Sync Vehicles
    if (await isCollectionEmpty('vehicles')) {
      console.log('🚗 Syncing vehicles data...');
      for (const vehicle of vehicles) {
        const transformedVehicle = transformVehicleData(vehicle);
        const docRef = doc(collection(db, 'vehicles'));
        batch.set(docRef, transformedVehicle);
        batchCount++;
        await commitBatchIfNeeded();
      }
      console.log(`✅ Added ${vehicles.length} vehicles`);
    } else {
      console.log('🚗 Vehicles collection already has data, skipping...');
    }

    // 2. Sync Destinations (from explore page + experiences)
    if (await isCollectionEmpty('destinations')) {
      console.log('🏔️ Syncing destinations data...');
      
      // Add explore destinations
      for (const destination of exploreDestinations) {
        const transformedDestination = transformDestinationData(destination);
        const docRef = doc(collection(db, 'destinations'));
        batch.set(docRef, transformedDestination);
        batchCount++;
        await commitBatchIfNeeded();
      }
      
      // Add experiences as destinations
      for (const experience of exploreExperiences) {
        const transformedExperience = transformExperienceData(experience);
        const docRef = doc(collection(db, 'destinations'));
        batch.set(docRef, transformedExperience);
        batchCount++;
        await commitBatchIfNeeded();
      }
      
      console.log(`✅ Added ${exploreDestinations.length + exploreExperiences.length} destinations`);
    } else {
      console.log('🏔️ Destinations collection already has data, skipping...');
    }

    // 3. Sync Bike Tours
    if (await isCollectionEmpty('bikeTours')) {
      console.log('🏍️ Syncing bike tours data...');
      
      // Add explore bike tours
      for (const tour of exploreBikeTours) {
        const transformedTour = transformBikeTourData(tour);
        const docRef = doc(collection(db, 'bikeTours'));
        batch.set(docRef, transformedTour);
        batchCount++;
        await commitBatchIfNeeded();
      }
      
      // Add bike tour plans from mockData
      for (const plan of bikeTourPlans) {
        const transformedPlan = {
          name: plan.title,
          description: `${plan.duration} adventure covering ${plan.highlights.join(', ')}`,
          region: 'Ladakh',
          duration: parseInt(plan.duration.split(' ')[0]),
          difficulty: 'Challenging',
          pricePerPerson: plan.price,
          maxGroupSize: 8,
          startLocation: 'Leh',
          endLocation: 'Leh',
          image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800',
          highlights: plan.highlights,
          inclusions: ['Bike rental', 'Fuel', 'Accommodation', 'Meals', 'Guide'],
          exclusions: ['Personal expenses', 'Travel insurance'],
          itinerary: plan.itinerary.map((day, index) => ({
            day: index + 1,
            title: day.title,
            description: day.description,
            activities: ['Riding', 'Sightseeing', 'Photography'],
            accommodation: 'Hotel/Camp',
            meals: ['Breakfast', 'Lunch', 'Dinner'],
            distance: '150-200km',
            altitude: '3000-5000m'
          })),
          bestTime: 'June to September',
          termsAndConditions: 'Standard terms apply. Valid license required.',
          isActive: true,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        
        const docRef = doc(collection(db, 'bikeTours'));
        batch.set(docRef, transformedPlan);
        batchCount++;
        await commitBatchIfNeeded();
      }
      
      console.log(`✅ Added ${exploreBikeTours.length + bikeTourPlans.length} bike tours`);
    } else {
      console.log('🏍️ Bike tours collection already has data, skipping...');
    }

    // 4. Sync Users
    if (await isCollectionEmpty('users')) {
      console.log('👥 Syncing users data...');
      const sampleUsers = createSampleUsers();
      
      for (const user of sampleUsers) {
        const docRef = doc(collection(db, 'users'));
        batch.set(docRef, user);
        batchCount++;
        await commitBatchIfNeeded();
      }
      
      console.log(`✅ Added ${sampleUsers.length} users`);
    } else {
      console.log('👥 Users collection already has data, skipping...');
    }

    // 5. Sync Bookings
    if (await isCollectionEmpty('bookings')) {
      console.log('📅 Syncing bookings data...');
      const sampleBookings = createSampleBookings();
      
      for (const booking of sampleBookings) {
        const docRef = doc(collection(db, 'bookings'));
        batch.set(docRef, booking);
        batchCount++;
        await commitBatchIfNeeded();
      }
      
      console.log(`✅ Added ${sampleBookings.length} bookings`);
    } else {
      console.log('📅 Bookings collection already has data, skipping...');
    }

    // Commit final batch
    if (batchCount > 0) {
      await batch.commit();
      console.log(`📦 Committed final batch of ${batchCount} operations`);
    }

    console.log('🎉 Data synchronization completed successfully!');
    toast.success('Explore page data synced to Firebase successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error syncing data to Firebase:', error);
    toast.error('Failed to sync data to Firebase');
    return false;
  }
}

// Auto-sync function that can be called on app startup
export async function autoSyncIfEmpty(): Promise<void> {
  try {
    console.log('🔍 Checking if auto-sync is needed...');
    
    const [
      vehiclesEmpty,
      destinationsEmpty,
      bikeToursEmpty,
      usersEmpty,
      bookingsEmpty
    ] = await Promise.all([
      isCollectionEmpty('vehicles'),
      isCollectionEmpty('destinations'),
      isCollectionEmpty('bikeTours'),
      isCollectionEmpty('users'),
      isCollectionEmpty('bookings')
    ]);

    const allEmpty = vehiclesEmpty && destinationsEmpty && bikeToursEmpty && usersEmpty && bookingsEmpty;
    
    if (allEmpty) {
      console.log('📦 Collections are empty, auto-syncing data...');
      await syncExploreDataToFirebase();
    } else {
      console.log('📊 Data already exists in Firebase collections');
    }
  } catch (error) {
    console.error('❌ Error in auto-sync check:', error);
  }
}

export { isCollectionEmpty };

export default {
  syncExploreDataToFirebase,
  autoSyncIfEmpty,
  isCollectionEmpty
};
