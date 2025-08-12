import { adminFirebaseService, Experience } from '../services/adminFirebaseService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

// Utility function to remove undefined values from an object
const removeUndefinedFields = (obj: any): any => {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        cleaned[key] = value.map(item => 
          typeof item === 'object' && item !== null ? removeUndefinedFields(item) : item
        );
      } else if (typeof value === 'object' && value !== null) {
        cleaned[key] = removeUndefinedFields(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
};

// Sample Ladakh Experiences Data
const ladakhExperiences: Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: "Chadar Trek - Frozen River Adventure",
    description: "Walk on the frozen Zanskar River in one of the most challenging and spectacular winter treks in the world. Experience the raw beauty of Ladakh's winter landscape while camping under sub-zero temperatures.",
    price: 25000,
    duration: "9 Days",
    highlights: [
      "Trek on the frozen Zanskar River",
      "Spectacular ice formations and frozen waterfalls",
      "Traditional Zanskari villages",
      "Winter wildlife spotting",
      "Camping under starlit skies at -30°C"
    ],
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    category: "Adventure",
    rating: 4.8,
    inclusions: [
      "Professional trek guide",
      "All camping equipment",
      "Meals during trek",
      "Transportation Leh-Chilling-Leh",
      "Emergency oxygen",
      "Medical kit"
    ],
    exclusions: [
      "Personal trekking gear",
      "Travel insurance",
      "Tips for guides",
      "Personal expenses",
      "Flight tickets"
    ],
    difficulty: "Challenging",
    maxGroupSize: 8,
    bestTime: "January to February",
    location: "Zanskar Valley, Ladakh",
    isActive: true
  },
  {
    title: "Markha Valley Trek",
    description: "One of Ladakh's most popular summer treks offering stunning landscapes, traditional villages, and spectacular mountain views. Perfect for experiencing the true essence of Ladakhi culture and Himalayan wilderness.",
    price: 18000,
    duration: "7 Days",
    highlights: [
      "Cross Kongmaru La pass (5,150m)",
      "Traditional Ladakhi villages",
      "Hemis National Park wildlife",
      "Ancient monasteries and chortens",
      "Panoramic Himalayan views"
    ],
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop",
    category: "Adventure",
    rating: 4.7,
    inclusions: [
      "Experienced trek guide",
      "Porter services",
      "All meals during trek",
      "Camping equipment",
      "Park entry fees",
      "Transportation"
    ],
    exclusions: [
      "Personal trekking gear",
      "Travel insurance",
      "Personal expenses",
      "Tips",
      "Emergency evacuation"
    ],
    difficulty: "Moderate",
    maxGroupSize: 12,
    bestTime: "June to September",
    location: "Markha Valley, Ladakh",
    isActive: true
  },
  {
    title: "Hemis Monastery Festival",
    description: "Witness the vibrant Hemis Festival, the largest and most famous monastery festival in Ladakh. Experience traditional masked dances, colorful costumes, and spiritual ceremonies in this ancient Buddhist monastery.",
    price: 8000,
    duration: "3 Days",
    highlights: [
      "Traditional Cham masked dances",
      "Ancient Buddhist ceremonies",
      "Local handicrafts and food",
      "Interaction with monks",
      "Photography opportunities"
    ],
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop",
    category: "Cultural",
    rating: 4.6,
    inclusions: [
      "Festival entry passes",
      "Cultural guide",
      "Transportation",
      "Traditional lunch",
      "Monastery tour"
    ],
    exclusions: [
      "Accommodation",
      "Personal expenses",
      "Additional meals",
      "Travel insurance",
      "Tips"
    ],
    difficulty: "Easy",
    maxGroupSize: 20,
    bestTime: "June to July",
    location: "Hemis Monastery, Ladakh",
    isActive: true
  },
  {
    title: "Nubra Valley Photography Tour",
    description: "Capture the stunning landscapes of Nubra Valley with professional photography guidance. From sand dunes to monasteries, this tour offers the best photography opportunities in Ladakh.",
    price: 12000,
    duration: "4 Days",
    highlights: [
      "Sunrise at Hunder sand dunes",
      "Diskit Monastery photography",
      "Camel safari shots",
      "Portrait photography with locals",
      "Landscape photography techniques"
    ],
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    category: "Photography",
    rating: 4.5,
    inclusions: [
      "Professional photographer guide",
      "Photography workshop",
      "All transportation",
      "Accommodation",
      "Model releases"
    ],
    exclusions: [
      "Camera equipment",
      "Personal expenses",
      "Meals",
      "Travel insurance",
      "Photo printing"
    ],
    difficulty: "Easy",
    maxGroupSize: 8,
    bestTime: "April to October",
    location: "Nubra Valley, Ladakh",
    isActive: true
  },
  {
    title: "Pangong Tso Stargazing Experience",
    description: "Experience one of the world's clearest night skies at Pangong Tso. This astronomy tour includes professional stargazing equipment and expert guidance for an unforgettable celestial experience.",
    price: 10000,
    duration: "2 Days",
    highlights: [
      "Professional telescope viewing",
      "Milky Way photography",
      "Astronomy workshop",
      "Lake sunrise experience",
      "Night camping by the lake"
    ],
    image: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=600&fit=crop",
    category: "Adventure",
    rating: 4.9,
    inclusions: [
      "Professional telescopes",
      "Astronomy guide",
      "Camping equipment",
      "All meals",
      "Transportation",
      "Star maps"
    ],
    exclusions: [
      "Personal clothing",
      "Travel insurance",
      "Personal expenses",
      "Tips",
      "Alcohol"
    ],
    difficulty: "Easy",
    maxGroupSize: 6,
    bestTime: "May to September",
    location: "Pangong Tso, Ladakh",
    isActive: true
  },
  {
    title: "Spituk Gustor Festival",
    description: "Experience the ancient Spituk Gustor festival featuring traditional Buddhist rituals, masked dances, and the ceremonial burning of the effigy. A deep dive into Ladakhi Buddhist culture.",
    price: 6000,
    duration: "2 Days",
    highlights: [
      "Sacred Cham dances",
      "Effigy burning ceremony",
      "Monk interactions",
      "Traditional music",
      "Local food tasting"
    ],
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop",
    category: "Spiritual",
    rating: 4.4,
    inclusions: [
      "Festival entry",
      "Cultural guide",
      "Traditional meals",
      "Transportation",
      "Monastery tour"
    ],
    exclusions: [
      "Accommodation",
      "Personal expenses",
      "Additional meals",
      "Travel insurance",
      "Donations"
    ],
    difficulty: "Easy",
    maxGroupSize: 15,
    bestTime: "January to February",
    location: "Spituk Monastery, Ladakh",
    isActive: true
  }
];

const preloadExperiencesForAdmin = async (): Promise<void> => {
  try {
    console.log('Starting experiences preload...');
    
    // Get existing experiences using a direct query
    const experiencesRef = collection(db, 'experiences');
    const snapshot = await getDocs(experiencesRef);
    const existingExperiences: Experience[] = [];
    snapshot.forEach((doc) => {
      existingExperiences.push({ id: doc.id, ...doc.data() } as Experience);
    });
    
    console.log(`Found ${existingExperiences.length} existing experiences`);
    
    let addedCount = 0;
    
    for (const experienceData of ladakhExperiences) {
      // Check if experience with same title already exists
      const exists = existingExperiences.some(
        existing => existing.title.toLowerCase() === experienceData.title.toLowerCase()
      );
      
      if (!exists) {
        try {
          // Clean the data to remove any undefined fields
          const cleanData = removeUndefinedFields(experienceData);
          
          // Add the experience
          await adminFirebaseService.createExperience(cleanData);
          addedCount++;
          console.log(`✅ Added experience: ${experienceData.title}`);
        } catch (error) {
          console.error(`❌ Failed to add experience "${experienceData.title}":`, error);
        }
      } else {
        console.log(`⏭️  Skipped existing experience: ${experienceData.title}`);
      }
    }
    
    console.log(`🎉 Preload completed! Added ${addedCount} new experiences.`);
    
    if (addedCount === 0 && existingExperiences.length > 0) {
      console.log('ℹ️  All sample experiences already exist in the database.');
    }
    
  } catch (error) {
    console.error('❌ Error during experiences preload:', error);
    throw error;
  }
};

export default preloadExperiencesForAdmin;
