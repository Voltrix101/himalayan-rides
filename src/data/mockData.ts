import { Vehicle, Region } from '../types';

export const bikeTourPlans = [
  {
    id: "leh-5day",
    title: "5-Day Himalayan Circuit Ride",
    duration: "5 Days",
    price: 10500,
    highlights: [
      "Leh",
      "Sangam",
      "Khardungla Pass",
      "Nubra Valley",
      "Pangong Lake",
      "Changla Pass"
    ],
    itinerary: [
      {
        day: 1,
        title: "Leh to Sangam",
        description: "Start your ride from Leh and visit the Magnetic Hill, Hall of Fame, and the confluence of Indus and Zanskar rivers at Sangam. Return to Leh for overnight stay."
      },
      {
        day: 2,
        title: "Leh to Khardungla Pass and Nubra Valley",
        description: "Ride to Khardungla Pass (18,380 ft), one of the world's highest motorable roads. Descend into Nubra Valley and explore Diskit Monastery and Hunder dunes. Overnight stay in Nubra."
      },
      {
        day: 3,
        title: "Nubra Valley to Pangong Lake",
        description: "Travel through Shyok Valley to reach Pangong Lake. Enjoy the surreal beauty of the lake and spend the night at a lakeside camp."
      },
      {
        day: 4,
        title: "Pangong to Leh via Changla Pass",
        description: "Ride back to Leh via the scenic Changla Pass. Visit Thiksey Monastery or Hemis en route if time permits."
      },
      {
        day: 5,
        title: "Local Leh Exploration / Departure",
        description: "Explore local markets and landmarks like Shanti Stupa and Leh Palace, or prepare for your departure."
      }
    ]
  },
  {
    id: "leh-10day",
    title: "10-Day Grand Himalayan Expedition",
    duration: "10 Days",
    price: 21500,
    highlights: [
      "Leh",
      "Sangam",
      "Khardungla Pass",
      "Tso Moriri",
      "Nubra Valley",
      "Turktuk",
      "Pangong Lake",
      "Changla Pass",
      "Hanle",
      "Umling La Pass"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival & Acclimatization in Leh",
        description: "Arrive in Leh and rest to acclimatize. Evening walk to Shanti Stupa and Leh Market."
      },
      {
        day: 2,
        title: "Leh to Sangam and Back",
        description: "Short acclimatization ride to Magnetic Hill, Gurudwara Pathar Sahib, and Sangam. Return to Leh."
      },
      {
        day: 3,
        title: "Leh to Khardungla to Nubra Valley",
        description: "Cross Khardungla Pass and descend into Nubra Valley. Explore Diskit and stay in Hunder."
      },
      {
        day: 4,
        title: "Nubra to Turktuk",
        description: "Ride to the remote village of Turktuk near the Indo-Pak border. Experience unique Balti culture."
      },
      {
        day: 5,
        title: "Turktuk to Pangong Lake",
        description: "Scenic ride via Shyok Valley to Pangong Lake. Enjoy an unforgettable sunset by the lake."
      },
      {
        day: 6,
        title: "Pangong to Tso Moriri",
        description: "Ride along the Indo-China border through Chushul and Nyoma to reach the high-altitude Tso Moriri Lake."
      },
      {
        day: 7,
        title: "Tso Moriri to Hanle",
        description: "Travel deep into Changthang Plateau to reach Hanle. Visit India's highest observatory."
      },
      {
        day: 8,
        title: "Hanle to Umling La Pass",
        description: "Ride to Umling La Pass (19,024 ft), the world's highest motorable road. Return to Hanle for the night."
      },
      {
        day: 9,
        title: "Hanle to Leh",
        description: "Return journey to Leh via Nyoma and Chumathang. Visit hot springs en route."
      },
      {
        day: 10,
        title: "Leh Local Tour & Departure",
        description: "Explore monasteries, Leh Palace, or relax in cafés before your return/checkout."
      }
    ]
  }
];

export const regions: Region[] = [
  {
    id: 'ladakh',
    name: 'Ladakh',
    description: 'Land of High Passes',
    image: 'https://images.pexels.com/photos/1049298/pexels-photo-1049298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    color: '#3B82F6',
    gradient: 'from-blue-600 to-indigo-700'
  },
  {
    id: 'spiti',
    name: 'Spiti Valley',
    description: 'Middle Land',
    image: 'https://images.pexels.com/photos/2325446/pexels-photo-2325446.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    color: '#F97316',
    gradient: 'from-orange-500 to-red-600'
  },
  {
    id: 'sikkim',
    name: 'Sikkim',
    description: 'Guardian of Kanchenjunga',
    image: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    color: '#10B981',
    gradient: 'from-emerald-500 to-teal-600'
  }
];

export const vehicles: Vehicle[] = [
  // Ladakh Vehicles
  {
    id: '1',
    name: 'Royal Enfield Himalayan',
    type: 'bike',
    region: 'ladakh',
    price: 1500,
    image: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    fuel: 'Petrol',
    gearbox: 'Manual',
    features: ['ABS', 'Adventure Ready', 'High Ground Clearance'],
    available: true
  },
  {
    id: '2',
    name: 'Mahindra Thar 4x4',
    type: 'suv',
    region: 'ladakh',
    price: 3500,
    image: 'https://images.pexels.com/photos/3752538/pexels-photo-3752538.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.7,
    fuel: 'Diesel',
    gearbox: 'Manual',
    seats: 4,
    features: ['4WD', 'AC', 'GPS Navigation'],
    available: true
  },
  {
    id: '3',
    name: 'KTM Adventure 390',
    type: 'bike',
    region: 'ladakh',
    price: 1800,
    image: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.6,
    fuel: 'Petrol',
    gearbox: 'Manual',
    features: ['TFT Display', 'Ride Modes', 'Traction Control'],
    available: true
  },
  // Spiti Vehicles
  {
    id: '4',
    name: 'Royal Enfield Classic 350',
    type: 'bike',
    region: 'spiti',
    price: 1200,
    image: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.5,
    fuel: 'Petrol',
    gearbox: 'Manual',
    features: ['Classic Design', 'Comfortable Seating', 'Reliable'],
    available: true
  },
  {
    id: '5',
    name: 'Toyota Innova Crysta',
    type: 'suv',
    region: 'spiti',
    price: 4000,
    image: 'https://images.pexels.com/photos/3752538/pexels-photo-3752538.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    fuel: 'Diesel',
    gearbox: 'Automatic',
    seats: 7,
    features: ['Premium Interior', 'AC', 'Large Boot Space'],
    available: true
  },
  // Sikkim Vehicles
  {
    id: '6',
    name: 'Bajaj Dominar 400',
    type: 'bike',
    region: 'sikkim',
    price: 1400,
    image: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.4,
    fuel: 'Petrol',
    gearbox: 'Manual',
    features: ['LED Headlamp', 'Digital Console', 'Comfortable'],
    available: true
  },
  {
    id: '7',
    name: 'Maruti Suzuki Swift',
    type: 'car',
    region: 'sikkim',
    price: 2500,
    image: 'https://images.pexels.com/photos/3752538/pexels-photo-3752538.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.3,
    fuel: 'Petrol',
    gearbox: 'Manual',
    seats: 5,
    features: ['Fuel Efficient', 'Compact', 'Easy to Drive'],
    available: true
  }
];