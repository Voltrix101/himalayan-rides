// Bike Tour Plans Data Structure
export interface BikeItineraryDay {
  day: number;
  title: string;
  route: string;
  distance_km: number;
  highlights: string[];
  stay: string;
  permit_required: boolean;
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Expert';
  altitude_max: string;
  riding_hours: number;
  description: string;
}

export interface BikeTourPlan {
  id: string;
  name: string;
  duration: string;
  total_distance: number;
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Expert';
  price: number;
  rating: number;
  image: string;
  description: string;
  highlights: string[];
  includes: string[];
  itinerary: BikeItineraryDay[];
  best_season: string;
  group_size: string;
  bike_options: string[];
  created_at?: any;
  updated_at?: any;
}

// 7-Day Ladakh Bike Tour Plan
export const sevenDayBikeTour: BikeTourPlan = {
  id: 'ladakh-7-day-bike',
  name: 'Ladakh Express Bike Adventure',
  duration: '7 Days',
  total_distance: 835,
  difficulty: 'Challenging',
  price: 45000,
  rating: 4.8,
  image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  description: 'Fast-paced bike adventure covering Ladakh\'s essential highlights in 7 days. Perfect for riders with limited time but maximum adventure spirit.',
  highlights: [
    'Khardung La Pass (18,380 ft)',
    'Nubra Valley Sand Dunes', 
    'Pangong Tso Lake',
    'Turtuk Border Village',
    'Magnetic Hill Experience'
  ],
  includes: [
    'Royal Enfield Himalayan 411cc',
    'Fuel for entire trip',
    'Accommodation (hotels/camps)',
    'All meals during tour',
    'Experienced ride leader',
    'Support vehicle',
    'All permits and entry fees',
    'Safety gear (helmet, gloves)',
    'First aid kit'
  ],
  best_season: 'May to September',
  group_size: '6-12 riders',
  bike_options: ['Royal Enfield Himalayan 411cc', 'Royal Enfield Classic 350', 'KTM 390 Adventure'],
  itinerary: [
    {
      day: 1,
      title: 'Leh Arrival & Acclimatization',
      route: 'Airport → Hotel → Local Sightseeing',
      distance_km: 15,
      highlights: ['Leh Market', 'Shanti Stupa', 'Leh Palace'],
      stay: 'Leh Hotel',
      permit_required: false,
      difficulty: 'Easy',
      altitude_max: '11,500 ft',
      riding_hours: 1,
      description: 'Airport pickup and hotel check-in. Rest to adapt to high altitude. Evening exploration of Leh Market, peaceful Shanti Stupa, and historic Leh Palace.'
    },
    {
      day: 2,
      title: 'Leh → Sham Valley → Leh',
      route: 'Leh → Magnetic Hill → Gurudwara Pathar Sahib → Sangam → Alchi → Leh',
      distance_km: 160,
      highlights: ['Magnetic Hill', 'Gurudwara Pathar Sahib', 'Sangam Confluence', 'Alchi Monastery'],
      stay: 'Leh Hotel',
      permit_required: false,
      difficulty: 'Moderate',
      altitude_max: '11,500 ft',
      riding_hours: 6,
      description: 'Ride through the mystical Sham Valley. Experience the gravity-defying Magnetic Hill, visit the revered Gurudwara Pathar Sahib, witness the confluence of Indus and Zanskar rivers at Sangam, and explore the ancient Alchi Monastery.'
    },
    {
      day: 3,
      title: 'Leh → Nubra Valley via Khardung La',
      route: 'Leh → Khardung La Pass → Diskit → Hunder',
      distance_km: 125,
      highlights: ['Khardung La Pass (18,380 ft)', 'Diskit Monastery', 'Hunder Sand Dunes', 'Camel Safari'],
      stay: 'Hunder Desert Camp',
      permit_required: true,
      difficulty: 'Challenging',
      altitude_max: '18,380 ft',
      riding_hours: 5,
      description: 'Cross the world\'s highest motorable pass - Khardung La. Descend into the enchanting Nubra Valley, visit the giant Buddha statue at Diskit Monastery, and enjoy camel safari on the unique cold desert sand dunes at Hunder.'
    },
    {
      day: 4,
      title: 'Nubra → Turtuk → Nubra',
      route: 'Hunder → Turtuk Village → Hunder',
      distance_km: 160,
      highlights: ['Turtuk Border Village', 'Baltistan Culture', 'LOC Views', 'Apricot Orchards'],
      stay: 'Hunder Desert Camp',
      permit_required: true,
      difficulty: 'Moderate',
      altitude_max: '12,000 ft',
      riding_hours: 6,
      description: 'Ride to India\'s northernmost village Turtuk, near the Pakistan border. Experience unique Baltistan culture, enjoy stunning views of the Line of Control, and taste fresh apricots from local orchards.'
    },
    {
      day: 5,
      title: 'Nubra → Pangong Lake',
      route: 'Hunder → Shyok River Road → Pangong Tso',
      distance_km: 160,
      highlights: ['Shyok River Route', 'Pangong Tso Lake', 'Color-changing Waters', 'Sunset Views'],
      stay: 'Pangong Lakeside Camp',
      permit_required: true,
      difficulty: 'Challenging',
      altitude_max: '14,270 ft',
      riding_hours: 7,
      description: 'Epic ride along the scenic Shyok River route to the famous Pangong Tso. Witness the mesmerizing color-changing waters of this high-altitude lake and camp under the starlit sky.'
    },
    {
      day: 6,
      title: 'Pangong → Leh via Chang La',
      route: 'Pangong → Chang La Pass → Thiksey → Leh',
      distance_km: 225,
      highlights: ['Chang La Pass (17,590 ft)', 'Thiksey Monastery', 'Sunrise at Pangong'],
      stay: 'Leh Hotel',
      permit_required: false,
      difficulty: 'Challenging',
      altitude_max: '17,590 ft',
      riding_hours: 8,
      description: 'Witness magical sunrise over Pangong Lake. Ride back to Leh crossing the high-altitude Chang La Pass. Stop at the magnificent Thiksey Monastery, often called "Mini Potala Palace".'
    },
    {
      day: 7,
      title: 'Leh Departure',
      route: 'Hotel → Leh Airport',
      distance_km: 10,
      highlights: ['Final Bike Return', 'Shopping', 'Airport Transfer'],
      stay: 'Departure',
      permit_required: false,
      difficulty: 'Easy',
      altitude_max: '11,500 ft',
      riding_hours: 0.5,
      description: 'Final bike return, last-minute shopping in Leh market for souvenirs, and airport transfer for your onward journey with unforgettable Himalayan memories.'
    }
  ]
};

// 10-Day Ladakh Bike Tour Plan
export const tenDayBikeTour: BikeTourPlan = {
  id: 'ladakh-10-day-bike',
  name: 'Ladakh Explorer Bike Expedition',
  duration: '10 Days',
  total_distance: 1250,
  difficulty: 'Challenging',
  price: 65000,
  rating: 4.9,
  image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800',
  description: 'Balanced pace bike expedition covering Ladakh\'s major attractions including the remote Hanle Observatory and Changthang plateau.',
  highlights: [
    'Khardung La & Chang La Passes',
    'Nubra Valley & Turtuk', 
    'Pangong & Tso Moriri Lakes',
    'Hanle Observatory (Dark Sky Reserve)',
    'Changthang Wildlife',
    'Ancient Monasteries'
  ],
  includes: [
    'Royal Enfield Himalayan 411cc',
    'Fuel for entire trip',
    'Accommodation (hotels/camps/homestays)',
    'All meals during tour',
    'Experienced ride leader',
    'Support vehicle with mechanic',
    'All permits and entry fees',
    'Safety gear and riding equipment',
    'Oxygen cylinder for emergencies',
    'Professional photography'
  ],
  best_season: 'May to September',
  group_size: '6-10 riders',
  bike_options: ['Royal Enfield Himalayan 411cc', 'KTM 390 Adventure', 'BMW G 310 GS'],
  itinerary: [
    {
      day: 1,
      title: 'Leh Arrival & Acclimatization',
      route: 'Airport → Hotel → Rest',
      distance_km: 15,
      highlights: ['Airport Transfer', 'Hotel Check-in', 'Rest Day'],
      stay: 'Leh Hotel',
      permit_required: false,
      difficulty: 'Easy',
      altitude_max: '11,500 ft',
      riding_hours: 1,
      description: 'Arrival in Leh, hotel check-in, and complete rest to acclimatize to high altitude. Light evening walk around Leh market.'
    },
    {
      day: 2,
      title: 'Leh → Sham Valley → Leh',
      route: 'Magnetic Hill → Sangam → Alchi → Leh',
      distance_km: 160,
      highlights: ['Magnetic Hill', 'Sangam Confluence', 'Alchi Monastery', 'Local Culture'],
      stay: 'Leh Hotel',
      permit_required: false,
      difficulty: 'Moderate',
      altitude_max: '11,500 ft',
      riding_hours: 6,
      description: 'First day of riding through the scenic Sham Valley. Experience the magnetic hill phenomenon, confluence of rivers, and ancient Buddhist art at Alchi.'
    },
    {
      day: 3,
      title: 'Leh → Nubra Valley',
      route: 'Khardung La → Diskit → Hunder',
      distance_km: 125,
      highlights: ['Khardung La Pass', 'Diskit Monastery', 'Sand Dunes', 'Bactrian Camels'],
      stay: 'Hunder Camp',
      permit_required: true,
      difficulty: 'Challenging',
      altitude_max: '18,380 ft',
      riding_hours: 5,
      description: 'Cross the world\'s highest motorable road to reach the cold desert of Nubra Valley. Double-humped camel safari and desert camping experience.'
    },
    {
      day: 4,
      title: 'Nubra → Turtuk → Nubra',
      route: 'Hunder → Turtuk Village → Hunder',
      distance_km: 160,
      highlights: ['Turtuk Border Village', 'Baltistan Culture', 'Apricot Gardens', 'LOC Views'],
      stay: 'Hunder Camp',
      permit_required: true,
      difficulty: 'Moderate',
      altitude_max: '12,000 ft',
      riding_hours: 6,
      description: 'Explore India\'s northernmost village with unique Balti culture, traditional houses, and organic apricot cultivation near Pakistan border.'
    },
    {
      day: 5,
      title: 'Nubra → Pangong Lake',
      route: 'Shyok River → Pangong Tso',
      distance_km: 160,
      highlights: ['Shyok River Valley', 'Pangong Tso', '3 Idiots Shooting Location', 'Sunset Views'],
      stay: 'Pangong Camp',
      permit_required: true,
      difficulty: 'Challenging',
      altitude_max: '14,270 ft',
      riding_hours: 7,
      description: 'Scenic ride along Shyok River to the famous Pangong Lake. Experience the color-changing waters and camp by the lakeside.'
    },
    {
      day: 6,
      title: 'Pangong → Hanle',
      route: 'Chushul → Tsaga La → Hanle',
      distance_km: 160,
      highlights: ['Remote Changthang', 'Hanle Observatory', 'Dark Sky Reserve', 'Wildlife Spotting'],
      stay: 'Hanle Homestay',
      permit_required: true,
      difficulty: 'Expert',
      altitude_max: '14,760 ft',
      riding_hours: 7,
      description: 'Remote ride through Changthang plateau to Hanle Observatory. Night sky observation in one of the world\'s best dark sky reserves.'
    },
    {
      day: 7,
      title: 'Hanle → Tso Moriri',
      route: 'Hanle → Chumathang → Korzok',
      distance_km: 140,
      highlights: ['Tso Moriri Lake', 'Korzok Village', 'Wildlife Sanctuary', 'Hot Springs'],
      stay: 'Korzok Homestay',
      permit_required: true,
      difficulty: 'Challenging',
      altitude_max: '14,830 ft',
      riding_hours: 6,
      description: 'Ride to the pristine Tso Moriri lake through the remote Changthang region. Stay in traditional Korzok village with local families.'
    },
    {
      day: 8,
      title: 'Tso Moriri → Leh',
      route: 'Taglang La → Upshi → Leh',
      distance_km: 210,
      highlights: ['Taglang La Pass', 'Changthang Wildlife', 'Baralacha Pass Views'],
      stay: 'Leh Hotel',
      permit_required: false,
      difficulty: 'Challenging',
      altitude_max: '17,582 ft',
      riding_hours: 8,
      description: 'Return to Leh crossing the high-altitude Taglang La pass. Spectacular views of the Changthang plateau and wildlife spotting opportunities.'
    },
    {
      day: 9,
      title: 'Leh Monastery Circuit',
      route: 'Thiksey → Hemis → Shey Palace → Leh',
      distance_km: 80,
      highlights: ['Thiksey Monastery', 'Hemis Monastery', 'Shey Palace', 'Morning Prayers'],
      stay: 'Leh Hotel',
      permit_required: false,
      difficulty: 'Easy',
      altitude_max: '11,500 ft',
      riding_hours: 4,
      description: 'Spiritual day visiting the most important monasteries around Leh. Experience morning prayers, Buddhist architecture, and local culture.'
    },
    {
      day: 10,
      title: 'Leh Departure',
      route: 'Hotel → Airport',
      distance_km: 10,
      highlights: ['Final Preparations', 'Shopping', 'Airport Transfer'],
      stay: 'Departure',
      permit_required: false,
      difficulty: 'Easy',
      altitude_max: '11,500 ft',
      riding_hours: 0.5,
      description: 'Final bike return, souvenir shopping in Leh market, and departure with lifetime memories of the Himalayan bike adventure.'
    }
  ]
};

// 15-Day Ladakh Bike Tour Plan
export const fifteenDayBikeTour: BikeTourPlan = {
  id: 'ladakh-15-day-bike',
  name: 'Ladakh Ultimate Bike Odyssey',
  duration: '15 Days',
  total_distance: 2100,
  difficulty: 'Expert',
  price: 95000,
  rating: 5.0,
  image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800',
  description: 'The ultimate Ladakh bike adventure covering all major destinations, hidden gems, and the world\'s highest motorable road at Umling La Pass (19,300 ft).',
  highlights: [
    'Umling La Pass (19,300 ft) - World\'s Highest Motorable Road',
    'Complete Ladakh Circuit including Kargil',
    'Zanskar River Rafting Adventure',
    'Stok Village Himalayan Trek',
    'All Major Passes & Hidden Valleys',
    'Cultural Immersion with Local Families',
    'Professional Photography Sessions'
  ],
  includes: [
    'Premium Royal Enfield Himalayan 411cc',
    'Fuel for entire expedition',
    'Luxury camps and heritage hotels',
    'All meals with local cuisine experience',
    'Professional ride leader and backup crew',
    'Support vehicle with mechanic',
    'All permits including restricted areas',
    'Premium safety and riding gear',
    'Oxygen support and medical kit',
    'Professional photography and videography',
    'Zanskar river rafting equipment',
    'Trekking gear for day hikes'
  ],
  best_season: 'June to September',
  group_size: '4-8 riders',
  bike_options: ['Royal Enfield Himalayan 411cc', 'KTM 390 Adventure', 'BMW G 310 GS', 'Hero Xpulse 200'],
  itinerary: [
    {
      day: 1,
      title: 'Leh Arrival',
      route: 'Airport → Hotel',
      distance_km: 10,
      highlights: ['Airport Transfer', 'Hotel Check-in', 'Medical Check-up'],
      stay: 'Leh Heritage Hotel',
      permit_required: false,
      difficulty: 'Easy',
      altitude_max: '11,500 ft',
      riding_hours: 0.5,
      description: 'Arrival in Leh with VIP airport transfer. Check-in to heritage hotel, medical check-up, and complete rest for altitude acclimatization.'
    },
    {
      day: 2,
      title: 'Leh Acclimatization & Local Tour',
      route: 'Leh Palace → Shanti Stupa → Market',
      distance_km: 25,
      highlights: ['Leh Palace', 'Shanti Stupa', 'Leh Market', 'Bike Familiarization'],
      stay: 'Leh Heritage Hotel',
      permit_required: false,
      difficulty: 'Easy',
      altitude_max: '11,500 ft',
      riding_hours: 2,
      description: 'Gentle acclimatization ride around Leh. Visit historic Leh Palace, peaceful Shanti Stupa, explore local market, and get familiar with your bike.'
    },
    {
      day: 3,
      title: 'Leh → Sham Valley → Kargil',
      route: 'Alchi → Likir → Lamayuru → Kargil',
      distance_km: 230,
      highlights: ['Alchi Monastery', 'Likir Monastery', 'Lamayuru Moonland', 'Magnetic Hill'],
      stay: 'Kargil Hotel',
      permit_required: false,
      difficulty: 'Moderate',
      altitude_max: '12,500 ft',
      riding_hours: 8,
      description: 'Epic ride through the Sham Valley to Kargil. Visit ancient monasteries, experience the otherworldly Lamayuru moonland landscape.'
    },
    {
      day: 4,
      title: 'Kargil → Leh via Batalik',
      route: 'Kargil → Batalik → Leh',
      distance_km: 240,
      highlights: ['Batalik War Memorial', 'Kargil War History', 'Scenic Mountain Roads'],
      stay: 'Leh Hotel',
      permit_required: false,
      difficulty: 'Moderate',
      altitude_max: '13,000 ft',
      riding_hours: 8,
      description: 'Return to Leh via the lesser-known Batalik route. Visit war memorial and learn about the 1999 Kargil War history.'
    },
    {
      day: 5,
      title: 'Leh → Nubra Valley',
      route: 'Khardung La → Diskit → Hunder',
      distance_km: 125,
      highlights: ['Khardung La Pass', 'Diskit Monastery', 'Sand Dunes', 'Luxury Desert Camp'],
      stay: 'Hunder Luxury Camp',
      permit_required: true,
      difficulty: 'Challenging',
      altitude_max: '18,380 ft',
      riding_hours: 5,
      description: 'Cross the famous Khardung La to reach Nubra Valley. Stay in luxury desert camp with camel safari and cultural programs.'
    },
    {
      day: 6,
      title: 'Nubra → Turtuk → Nubra',
      route: 'Hunder → Turtuk → Hunder',
      distance_km: 160,
      highlights: ['Turtuk Border Village', 'Balti Culture', 'Traditional Houses', 'Organic Farms'],
      stay: 'Hunder Luxury Camp',
      permit_required: true,
      difficulty: 'Moderate',
      altitude_max: '12,000 ft',
      riding_hours: 6,
      description: 'Explore the unique Balti culture in Turtuk village. Experience traditional lifestyle, organic farming, and interact with local families.'
    },
    {
      day: 7,
      title: 'Nubra → Pangong Lake',
      route: 'Shyok River → Pangong Tso',
      distance_km: 160,
      highlights: ['Shyok River Valley', 'Pangong Tso', 'Luxury Lakeside Camp'],
      stay: 'Pangong Luxury Camp',
      permit_required: true,
      difficulty: 'Challenging',
      altitude_max: '14,270 ft',
      riding_hours: 7,
      description: 'Scenic ride to the world-famous Pangong Lake. Stay in luxury lakeside camp with 24/7 oxygen support.'
    },
    {
      day: 8,
      title: 'Pangong → Hanle',
      route: 'Chushul → Tsaga La → Hanle',
      distance_km: 160,
      highlights: ['Hanle Observatory', 'Dark Sky Reserve', 'Milky Way Photography'],
      stay: 'Hanle Homestay',
      permit_required: true,
      difficulty: 'Expert',
      altitude_max: '14,760 ft',
      riding_hours: 7,
      description: 'Remote ride to Hanle Observatory. Night sky photography session and stargazing in world\'s best dark sky reserve.'
    },
    {
      day: 9,
      title: 'Hanle → Umling La → Hanle',
      route: 'Hanle → Umling La Pass → Hanle',
      distance_km: 140,
      highlights: ['Umling La Pass (19,300 ft)', 'World\'s Highest Motorable Road', 'Achievement Certificate'],
      stay: 'Hanle Homestay',
      permit_required: true,
      difficulty: 'Expert',
      altitude_max: '19,300 ft',
      riding_hours: 8,
      description: 'Conquer the world\'s highest motorable road at Umling La Pass. Receive official certificate and capture this lifetime achievement.'
    },
    {
      day: 10,
      title: 'Hanle → Tso Moriri',
      route: 'Hanle → Chumathang → Korzok',
      distance_km: 140,
      highlights: ['Tso Moriri Lake', 'Korzok Village', 'Wildlife Photography'],
      stay: 'Korzok Homestay',
      permit_required: true,
      difficulty: 'Challenging',
      altitude_max: '14,830 ft',
      riding_hours: 6,
      description: 'Ride to pristine Tso Moriri lake. Wildlife photography and cultural immersion with nomadic families in Korzok village.'
    },
    {
      day: 11,
      title: 'Tso Moriri → Leh',
      route: 'Taglang La → Leh',
      distance_km: 210,
      highlights: ['Taglang La Pass', 'Return to Civilization', 'Rest Day'],
      stay: 'Leh Heritage Hotel',
      permit_required: false,
      difficulty: 'Challenging',
      altitude_max: '17,582 ft',
      riding_hours: 8,
      description: 'Return to Leh crossing Taglang La pass. Rest and recover from the high-altitude adventure in luxury hotel.'
    },
    {
      day: 12,
      title: 'Leh → Chilling Rafting',
      route: 'Leh → Chilling → Leh',
      distance_km: 80,
      highlights: ['Zanskar River Rafting', 'Grade III Rapids', 'Adventure Sports'],
      stay: 'Leh Hotel',
      permit_required: false,
      difficulty: 'Moderate',
      altitude_max: '11,500 ft',
      riding_hours: 3,
      description: 'Adventure day with white water rafting on Zanskar River. Experience Grade III rapids and scenic river valleys.'
    },
    {
      day: 13,
      title: 'Leh → Stok Village Trek',
      route: 'Leh → Stok Village → Himalayan Trek',
      distance_km: 40,
      highlights: ['Stok Village', 'Himalayan Day Trek', 'Village Homestay'],
      stay: 'Stok Village Homestay',
      permit_required: false,
      difficulty: 'Moderate',
      altitude_max: '13,500 ft',
      riding_hours: 2,
      description: 'Cultural immersion in Stok village with day trek in the Himalayas. Experience traditional Ladakhi lifestyle with local families.'
    },
    {
      day: 14,
      title: 'Leh Free Day',
      route: 'Shopping → Souvenir Hunting → Relaxation',
      distance_km: 30,
      highlights: ['Leh Market', 'Souvenir Shopping', 'Spa & Relaxation', 'Farewell Dinner'],
      stay: 'Leh Heritage Hotel',
      permit_required: false,
      difficulty: 'Easy',
      altitude_max: '11,500 ft',
      riding_hours: 2,
      description: 'Relaxation day in Leh. Shopping for souvenirs, traditional handicrafts, spa treatment, and farewell dinner with the group.'
    },
    {
      day: 15,
      title: 'Departure',
      route: 'Hotel → Airport',
      distance_km: 10,
      highlights: ['Final Bike Return', 'Airport Transfer', 'Journey Completion'],
      stay: 'Departure',
      permit_required: false,
      difficulty: 'Easy',
      altitude_max: '11,500 ft',
      riding_hours: 0.5,
      description: 'Final bike return ceremony, airport transfer, and departure with unforgettable memories of the ultimate Ladakh bike odyssey.'
    }
  ]
};

// All bike tour plans array
export const allBikeTourPlans: BikeTourPlan[] = [
  sevenDayBikeTour,
  tenDayBikeTour,
  fifteenDayBikeTour
];

export default {
  sevenDayBikeTour,
  tenDayBikeTour,
  fifteenDayBikeTour,
  allBikeTourPlans
};
