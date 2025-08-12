import { TripPlan } from '../types';

export const premiumBikeTourTestData: Omit<TripPlan, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: "6-Day Ladakh Blitz",
    route: ["Leh", "Nubra Valley", "Pangong Lake", "Tso Moriri", "Kargil", "Leh"],
    duration: "6 days",
    price: 45000,
    description: "An intense yet breathtaking motorcycle journey through Ladakh's most iconic destinations. Perfect for riders seeking adventure with limited time.",
    mapURL: "https://maps.google.com/ladakh-blitz-route",
    coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    isFeatured: true,
    highlights: [
      "Ride through Khardung La - World's highest motorable pass",
      "Camp under stars at Pangong Lake",
      "Explore ancient monasteries in Nubra Valley",
      "Experience unique double-humped Bactrian camels",
      "Navigate challenging mountain terrain",
      "Witness breathtaking Himalayan sunrise"
    ],
    difficulty: "Moderate",
    bestSeason: ["May", "June", "July", "August", "September"],
    groupSize: {
      min: 4,
      max: 12
    },
    itinerary: [
      {
        day: 1,
        title: "Arrival & Acclimatization in Leh",
        description: "Arrive in Leh (11,500 ft). Rest and acclimatize to high altitude. Explore Leh Market, visit Leh Palace and Shanti Stupa for sunset views. Briefing about the upcoming adventure.",
        icon: "🛬",
        location: "Leh",
        highlights: ["Airport pickup", "Leh Palace visit", "Sunset at Shanti Stupa"],
        accommodation: "Hotel in Leh",
        meals: ["Dinner"],
        activities: ["City orientation", "Altitude acclimatization", "Gear check"]
      },
      {
        day: 2,
        title: "Leh to Nubra Valley via Khardung La",
        description: "Cross the legendary Khardung La Pass (18,380 ft) - world's highest motorable road. Descend into the mystical Nubra Valley. Experience the surreal landscape of cold desert sand dunes.",
        icon: "🏔️",
        location: "Nubra Valley",
        highlights: ["Khardung La Pass", "Diskit Monastery", "Sand dunes"],
        accommodation: "Desert camp or guesthouse",
        meals: ["Breakfast", "Lunch", "Dinner"],
        activities: ["High altitude riding", "Camel safari", "Monastery visit"]
      },
      {
        day: 3,
        title: "Nubra Valley to Pangong Lake",
        description: "Ride through spectacular Shyok River valley to the famous Pangong Tso. Marvel at the lake's changing colors from blue to green to red. Camp beside the pristine lake under star-studded sky.",
        icon: "🏞️",
        location: "Pangong Lake",
        highlights: ["Shyok Valley ride", "Pangong Lake colors", "Stargazing"],
        accommodation: "Lakeside camping",
        meals: ["Breakfast", "Packed lunch", "Dinner"],
        activities: ["Photography", "Lake exploration", "Camping"]
      },
      {
        day: 4,
        title: "Pangong Lake to Tso Moriri",
        description: "Early morning lakeside photography. Ride to another pristine high-altitude lake, Tso Moriri. Experience the serene beauty of this lesser-known gem surrounded by barren mountains.",
        icon: "🌅",
        location: "Tso Moriri",
        highlights: ["Morning photography", "Remote lake beauty", "Wildlife spotting"],
        accommodation: "Guesthouse near lake",
        meals: ["Breakfast", "Lunch", "Dinner"],
        activities: ["Wildlife observation", "Photography", "Meditation"]
      },
      {
        day: 5,
        title: "Tso Moriri to Kargil via Sarchu",
        description: "Long but scenic ride to Kargil crossing high-altitude plains of Sarchu. Experience diverse landscapes from barren mountains to green valleys. Rest in historic Kargil town.",
        icon: "⛰️",
        location: "Kargil",
        highlights: ["Sarchu plains", "Landscape diversity", "Historic Kargil"],
        accommodation: "Hotel in Kargil",
        meals: ["Breakfast", "Lunch", "Dinner"],
        activities: ["Long-distance riding", "Landscape photography", "Cultural interaction"]
      },
      {
        day: 6,
        title: "Kargil to Leh & Departure",
        description: "Final ride back to Leh through Lamayuru - Moon Land of Ladakh. Visit the ancient Lamayuru Monastery. Celebration dinner and farewell. Transfer to airport for departure.",
        icon: "🏁",
        location: "Leh",
        highlights: ["Lamayuru Moon Land", "Ancient monastery", "Celebration dinner"],
        accommodation: "Day use hotel",
        meals: ["Breakfast", "Lunch", "Farewell dinner"],
        activities: ["Monastery visit", "Souvenir shopping", "Airport transfer"]
      }
    ]
  },
  {
    title: "10-Day Ladakh Odyssey",
    route: ["Leh", "Nubra Valley", "Pangong Lake", "Hanle", "Tso Moriri", "Sarchu", "Jispa", "Keylong", "Rohtang", "Manali"],
    duration: "10 days",
    price: 75000,
    description: "The ultimate Ladakh motorcycle expedition covering remote valleys, highest passes, and pristine landscapes. For experienced riders seeking the complete Himalayan adventure.",
    mapURL: "https://maps.google.com/ladakh-odyssey-route",
    coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    isFeatured: true,
    highlights: [
      "Complete Ladakh circuit with remote Hanle observatory",
      "Cross 5 high-altitude passes above 15,000 ft",
      "Camp at multiple pristine high-altitude lakes",
      "Experience diverse cultures from Ladakhi to Himachali",
      "Ride through Moon Land, sand dunes, and green valleys",
      "Professional photography guidance at iconic locations",
      "Visit ancient monasteries and interact with monks",
      "Technical riding through challenging terrain"
    ],
    difficulty: "Challenging",
    bestSeason: ["June", "July", "August", "September"],
    groupSize: {
      min: 6,
      max: 16
    },
    itinerary: [
      {
        day: 1,
        title: "Arrival & Leh Exploration",
        description: "Arrive in Leh, acclimatize to 11,500 ft altitude. Explore Leh Palace, Shanti Stupa, and local markets. Comprehensive briefing about the epic 10-day journey ahead.",
        icon: "🛬",
        location: "Leh",
        highlights: ["Airport pickup", "City exploration", "Gear distribution"],
        accommodation: "Premium hotel in Leh",
        meals: ["Welcome dinner"],
        activities: ["Acclimatization walk", "Bike familiarization", "Route briefing"]
      },
      {
        day: 2,
        title: "Leh to Nubra Valley - Khardung La Conquest",
        description: "Conquer Khardung La Pass (18,380 ft), world's highest motorable road. Descend into magical Nubra Valley. Explore Diskit Monastery and enjoy camel safari on Hunder sand dunes.",
        icon: "🏔️",
        location: "Nubra Valley",
        highlights: ["Khardung La Pass", "Desert safari", "Monastery visit"],
        accommodation: "Luxury desert camp",
        meals: ["Breakfast", "Lunch", "Dinner"],
        activities: ["High-altitude riding", "Camel safari", "Photography session"]
      },
      {
        day: 3,
        title: "Nubra Valley to Pangong Lake",
        description: "Ride through remote Shyok River valley to the legendary Pangong Tso. Experience the lake's mesmerizing color changes. Camping under the pristine Himalayan night sky.",
        icon: "🏞️",
        location: "Pangong Lake",
        highlights: ["Shyok Valley", "Pangong colors", "Night photography"],
        accommodation: "Lakeside camping with heated tents",
        meals: ["Breakfast", "Packed lunch", "BBQ dinner"],
        activities: ["Lake photography", "Stargazing", "Sunset viewing"]
      },
      {
        day: 4,
        title: "Pangong Lake to Hanle Observatory",
        description: "Ride to remote Hanle village, home to India's astronomical observatory. Experience complete solitude in this border region. Visit the observatory and interact with local Changpa nomads.",
        icon: "🔭",
        location: "Hanle",
        highlights: ["Astronomical observatory", "Nomad interaction", "Remote border region"],
        accommodation: "Guesthouse in Hanle",
        meals: ["Breakfast", "Lunch", "Dinner"],
        activities: ["Observatory visit", "Cultural interaction", "Night sky observation"]
      },
      {
        day: 5,
        title: "Hanle to Tso Moriri Lake",
        description: "Journey to the pristine Tso Moriri, a high-altitude lake surrounded by barren peaks. Experience the serenity of this protected wetland sanctuary with diverse wildlife.",
        icon: "🦅",
        location: "Tso Moriri",
        highlights: ["Wildlife sanctuary", "Pristine lake", "Photography opportunities"],
        accommodation: "Eco-camp near lake",
        meals: ["Breakfast", "Lunch", "Dinner"],
        activities: ["Wildlife spotting", "Lake exploration", "Meditation session"]
      },
      {
        day: 6,
        title: "Tso Moriri to Sarchu High Plains",
        description: "Cross into Himachal Pradesh through high-altitude plains of Sarchu. Experience the vast barren landscape at 14,000 ft. Camping under clear mountain skies.",
        icon: "⛰️",
        location: "Sarchu",
        highlights: ["State border crossing", "High-altitude plains", "Mountain camping"],
        accommodation: "High-altitude camping",
        meals: ["Breakfast", "Lunch", "Dinner"],
        activities: ["High-altitude acclimatization", "Landscape photography", "Campfire evening"]
      },
      {
        day: 7,
        title: "Sarchu to Jispa via Baralacha La",
        description: "Cross Baralacha La Pass (16,040 ft) and descend into the lush green Lahaul Valley. Experience dramatic landscape change from barren to green. Explore traditional Jispa village.",
        icon: "🌿",
        location: "Jispa",
        highlights: ["Baralacha La Pass", "Green valleys", "Traditional village"],
        accommodation: "Riverside guesthouse",
        meals: ["Breakfast", "Lunch", "Dinner"],
        activities: ["Valley exploration", "Village walk", "River side relaxation"]
      },
      {
        day: 8,
        title: "Jispa to Keylong - Cultural Immersion",
        description: "Short ride to Keylong, administrative center of Lahaul. Explore Buddhist monasteries, interact with locals, and experience the unique Lahauli culture. Rest day with optional local excursions.",
        icon: "🏛️",
        location: "Keylong",
        highlights: ["Cultural immersion", "Monastery visits", "Local interaction"],
        accommodation: "Hotel in Keylong",
        meals: ["Breakfast", "Lunch", "Dinner"],
        activities: ["Cultural tour", "Monastery visit", "Local cuisine tasting"]
      },
      {
        day: 9,
        title: "Keylong to Manali via Rohtang Pass",
        description: "Cross the famous Rohtang Pass (13,050 ft) with spectacular views. Descend into the green Kullu Valley and reach the hill station of Manali. Celebrate the successful expedition.",
        icon: "🎉",
        location: "Manali",
        highlights: ["Rohtang Pass", "Kullu Valley", "Celebration dinner"],
        accommodation: "Hotel in Manali",
        meals: ["Breakfast", "Lunch", "Celebration dinner"],
        activities: ["Rohtang Pass crossing", "Valley descent", "Shopping in Manali"]
      },
      {
        day: 10,
        title: "Manali Departure",
        description: "Final day with optional local sightseeing in Manali. Visit Hadimba Temple, explore Old Manali, or enjoy adventure activities. Transfer to Delhi by Volvo bus or flight from Kullu airport.",
        icon: "🏁",
        location: "Manali",
        highlights: ["Local sightseeing", "Hadimba Temple", "Departure arrangements"],
        accommodation: "Day use hotel",
        meals: ["Breakfast", "Farewell lunch"],
        activities: ["Local sightseeing", "Souvenir shopping", "Departure transfer"]
      }
    ]
  }
];

export const loadBikeTourTestData = async () => {
  const { AdminContentService } = await import('../services/adminContentService');
  
  try {
    console.log('🚀 Loading premium bike tour test data...');
    
    for (const tourData of premiumBikeTourTestData) {
      const tourWithTimestamps = {
        ...tourData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await AdminContentService.addTripPlan(tourWithTimestamps);
      console.log(`✅ Added: ${tourData.title}`);
    }
    
    console.log('🎉 All premium bike tours loaded successfully!');
    return { success: true, count: premiumBikeTourTestData.length };
  } catch (error) {
    console.error('❌ Error loading bike tour test data:', error);
    return { success: false, error };
  }
};
