import { adminFirebaseService } from '../services/adminFirebaseService';
import { BikeTourPlan } from '../types';

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

// Ladakh Bike Tour Plans Data
const ladakhBikeTourPlans: Omit<BikeTourPlan, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: "7-Day Leh – Nubra – Pangong Circuit",
    description: "Perfect for those with limited time but a big appetite for adventure. This circuit covers the most iconic destinations of Ladakh in a week. Experience high-altitude desert landscapes, crystal-clear lakes, and ancient monasteries on this incredible motorcycle journey.",
    duration: "7 Days",
    price: 15000,
    highlights: [
      "Khardung La – World's highest motorable pass",
      "Nubra Valley & Hunder Sand Dunes",
      "Pangong Tso camping experience",
      "Magnetic Hill & Zanskar–Indus confluence",
      "Traditional Ladakhi villages"
    ],
    itinerary: [
      { day: 1, title: "Arrival in Leh", description: "Acclimatization and local sightseeing including Leh Palace and Shanti Stupa" },
      { day: 2, title: "Leh to Nubra Valley", description: "Cross Khardung La pass (18,380 ft), reach Hunder for camel safari" },
      { day: 3, title: "Nubra Valley Exploration", description: "Desert safari at sand dunes, visit Diskit Monastery" },
      { day: 4, title: "Nubra to Pangong Tso", description: "Journey to the famous blue lake via Shyok River route" },
      { day: 5, title: "Pangong to Leh", description: "Return via Chang La pass (17,688 ft) with scenic stops" },
      { day: 6, title: "Local Leh Exploration", description: "Visit Hemis, Thiksey, and Shey monasteries" },
      { day: 7, title: "Departure", description: "Transfer to Leh airport for onward journey" }
    ],
    tags: ["Adventure", "Mountains", "Lake", "Desert", "Beginner Friendly"],
    coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    isFeatured: true
  },
  {
    title: "10-Day Manali to Leh via Pangong & Tso Moriri",
    description: "A classic Himalayan ride that covers the full Manali–Leh highway experience with extensions to pristine high-altitude lakes. This journey takes you through some of the most challenging and beautiful terrain in the world.",
    duration: "10 Days", 
    price: 25000,
    highlights: [
      "Complete Manali-Leh Highway experience",
      "Rohtang Pass & Baralacha La crossing",
      "Tanglang La & More Plains scenic beauty",
      "Pangong Tso camping under stars",
      "Tso Moriri remote wilderness experience"
    ],
    itinerary: [
      { day: 1, title: "Manali to Jispa", description: "Start the epic journey via Rohtang Pass and Keylong" },
      { day: 2, title: "Jispa to Sarchu", description: "High altitude camping experience at 14,000 ft" },
      { day: 3, title: "Sarchu to Leh", description: "Cross Baralacha La, Nakee La, and Lachulung La passes" },
      { day: 4, title: "Leh Acclimatization", description: "Rest day with local sightseeing and bike maintenance" },
      { day: 5, title: "Leh to Nubra Valley", description: "Khardung La crossing and Hunder sand dunes" },
      { day: 6, title: "Nubra to Pangong Tso", description: "Journey to the blue lake via Shyok valley" },
      { day: 7, title: "Pangong to Tso Moriri", description: "Remote lake exploration via Chushul" },
      { day: 8, title: "Tso Moriri to Leh", description: "Return via Taglang La pass" },
      { day: 9, title: "Leh Exploration", description: "Monasteries, local markets, and preparation for departure" },
      { day: 10, title: "Departure", description: "End of epic Himalayan journey" }
    ],
    tags: ["Epic Journey", "High Altitude", "Multiple Lakes", "Advanced", "Highway"],
    coverImage: "https://images.unsplash.com/photo-1562906736-5937d84d5a7d?w=800&h=600&fit=crop",
    isFeatured: true
  },
  {
    title: "15-Day Ultimate Ladakh & Zanskar Expedition",
    description: "An epic Himalayan motorcycle expedition for hardcore riders seeking the ultimate adventure across Ladakh and the remote Zanskar valley. This comprehensive tour covers everything from high passes to ancient monasteries.",
    duration: "15 Days",
    price: 40000,
    highlights: [
      "Complete Manali–Leh Highway route",
      "Nubra Valley & Pangong Lake exploration", 
      "Tso Moriri & Hanle Observatory visit",
      "Zanskar Valley via challenging Pensi La",
      "Remote monastery visits and cultural immersion"
    ],
    itinerary: [
      { day: 1, title: "Manali Start", description: "Journey begins from Manali, bike inspection and briefing" },
      { day: 2, title: "Manali to Jispa", description: "Cross Rohtang Pass, overnight at Jispa" },
      { day: 3, title: "Jispa to Sarchu", description: "High altitude camping at 14,000 ft" },
      { day: 4, title: "Sarchu to Leh", description: "Multiple pass crossing including Baralacha La" },
      { day: 5, title: "Leh Acclimatization", description: "Rest and local sightseeing" },
      { day: 6, title: "Leh to Nubra", description: "Khardung La crossing to Nubra Valley" },
      { day: 7, title: "Nubra Valley", description: "Desert exploration and camel safari" },
      { day: 8, title: "Nubra to Pangong", description: "Journey to famous blue lake" },
      { day: 9, title: "Pangong Exploration", description: "Full day at the lake with photography" },
      { day: 10, title: "Pangong to Tso Moriri", description: "Remote lake visit via Chushul" },
      { day: 11, title: "Tso Moriri to Hanle", description: "Visit to world's highest observatory" },
      { day: 12, title: "Hanle to Zanskar", description: "Enter Zanskar valley via Pensi La" },
      { day: 13, title: "Zanskar Exploration", description: "Remote valley monasteries and villages" },
      { day: 14, title: "Zanskar to Leh", description: "Return journey via Kargil" },
      { day: 15, title: "Departure", description: "Epic journey concludes with departure from Leh" }
    ],
    tags: ["Extreme Adventure", "Zanskar", "Observatory", "Ultimate Challenge", "Expert Only"],
    coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop",
    isFeatured: false
  }
];

export const preloadBikeToursForAdmin = async (): Promise<void> => {
  try {
    console.log('Starting bike tours preloading for admin dashboard...');
    
    // Convert BikeTourPlan data to BikeTour format for admin dashboard
    for (const tour of ladakhBikeTourPlans) {
      try {
        const adminTour = {
          name: tour.title || 'Untitled Tour',
          description: tour.description || 'No description available',
          region: 'Ladakh',
          duration: parseInt(tour.duration.split(' ')[0]) || 1, // Extract number from "7 Days"
          difficulty: (tour.tags?.includes('Expert Only') ? 'Extreme' : 
                     tour.tags?.includes('Advanced') || tour.tags?.includes('Ultimate Challenge') || tour.tags?.includes('Extreme Adventure') ? 'Challenging' :
                     tour.tags?.includes('Beginner Friendly') ? 'Easy' : 'Moderate') as 'Easy' | 'Moderate' | 'Challenging' | 'Extreme',
          pricePerPerson: tour.price || 0,
          maxGroupSize: 8,
          startLocation: 'Leh',
          endLocation: 'Leh',
          image: tour.coverImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
          highlights: tour.highlights || [],
          inclusions: [
            'Royal Enfield motorcycle',
            'Accommodation (hotels/camps)',
            'All meals during tour',
            'Experienced tour guide',
            'All permits and fees',
            'Mechanical support',
            'First aid kit'
          ],
          exclusions: [
            'Personal expenses',
            'Travel insurance',
            'Alcoholic beverages',
            'Tips for guides/drivers',
            'Flight tickets to/from Leh'
          ],
          // Convert TourItinerary to ItineraryDay format
          itinerary: (tour.itinerary || []).map((item, index) => {
            const itineraryDay: any = {
              day: item.day || (index + 1),
              title: item.title || `Day ${index + 1}`,
              description: item.description || 'No description',
              activities: [item.description || 'Tour activities'],
              accommodation: 'Hotel/Camp (included)',
              meals: ['Breakfast', 'Lunch', 'Dinner']
            };
            
            // Only add optional fields if they have meaningful values
            // Don't add distance or altitude as undefined - Firebase doesn't allow undefined
            
            return itineraryDay;
          }),
          bestTime: 'May to September',
          isActive: true
          // termsAndConditions is optional, so we don't include it
        };

        // Clean the data to remove any undefined values before saving to Firebase
        const cleanedAdminTour = removeUndefinedFields(adminTour);
        
        console.log(`📤 Attempting to add tour: ${tour.title}`);
        await adminFirebaseService.createBikeTour(cleanedAdminTour);
        console.log(`✅ Successfully added: ${tour.title}`);
      } catch (tourError) {
        console.error(`❌ Failed to add ${tour.title}:`, tourError);
        // Continue with next tour instead of stopping completely
      }
    }
    
    console.log('🎉 Bike tours preloading completed for admin dashboard!');
  } catch (error) {
    console.error('Error during preloading:', error);
    throw error; // Re-throw to show error in UI
  }
};

export default preloadBikeToursForAdmin;
