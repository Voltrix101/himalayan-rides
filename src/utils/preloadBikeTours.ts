import { AdminContentService } from '../services/adminContentService';
import { BikeTourPlan } from '../types';

// Ladakh Bike Tour Plans Data - Updated to match the admin dashboard structure
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

// Function to preload bike tour plans (run once)
export const preloadBikeTours = async (): Promise<void> => {
  try {
    console.log('Starting to preload bike tour plans...');
    
    for (const plan of ladakhBikeTourPlans) {
      try {
        await AdminContentService.addBikeTourPlan(plan);
        console.log(`✅ Added: ${plan.title}`);
      } catch (error) {
        console.error(`❌ Failed to add ${plan.title}:`, error);
      }
    }
    
    console.log('🎉 Bike tour plans preloading completed!');
  } catch (error) {
    console.error('Error during preloading:', error);
  }
};

export default preloadBikeTours;
