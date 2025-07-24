const { bikeToursService } = require('../services/bikeToursService');

async function seedBikeTours() {
  // 5-Day Himalayan Circuit Ride
  await bikeToursService.addBikeTourPlan({
    title: '5-Day Himalayan Circuit Ride',
    duration: '5 Days',
    price: 10500,
    highlights: [
      'Leh',
      'Sangam',
      'Khardungla Pass',
      'Nubra Valley',
      'Pangong Lake',
      'Changla Pass'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Leh to Sangam',
        description: 'Start your ride from Leh and visit the Magnetic Hill, Hall of Fame, and the confluence of Indus and Zanskar rivers at Sangam. Return to Leh for overnight stay.'
      },
      {
        day: 2,
        title: 'Leh to Khardungla Pass and Nubra Valley',
        description: 'Ride to Khardungla Pass (18,380 ft), one of the world\'s highest motorable roads. Descend into Nubra Valley and explore Diskit Monastery and Hunder dunes. Overnight stay in Nubra.'
      },
      {
        day: 3,
        title: 'Nubra Valley to Pangong Lake',
        description: 'Travel through Shyok Valley to reach Pangong Lake. Enjoy the surreal beauty of the lake and spend the night at a lakeside camp.'
      },
      {
        day: 4,
        title: 'Pangong to Leh via Changla Pass',
        description: 'Ride back to Leh via the scenic Changla Pass. Visit Thiksey Monastery or Hemis en route if time permits.'
      },
      {
        day: 5,
        title: 'Local Leh Exploration / Departure',
        description: 'Explore local markets and landmarks like Shanti Stupa and Leh Palace, or prepare for your departure.'
      }
    ],
    description: 'Experience the ultimate motorcycle adventure through the Himalayas.',
    coverImage: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600',
    isFeatured: true
  });

  // 10-Day Grand Himalayan Expedition
  await bikeToursService.addBikeTourPlan({
    title: '10-Day Grand Himalayan Expedition',
    duration: '10 Days',
    price: 21500,
    highlights: [
      'Leh',
      'Sangam',
      'Khardungla Pass',
      'Tso Moriri',
      'Nubra Valley',
      'Turktuk',
      'Pangong Lake',
      'Changla Pass',
      'Hanle',
      'Umling La Pass'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Acclimatization in Leh',
        description: 'Arrive in Leh and rest to acclimatize. Evening walk to Shanti Stupa and Leh Market.'
      },
      {
        day: 2,
        title: 'Leh to Sangam and Back',
        description: 'Short acclimatization ride to Magnetic Hill, Gurudwara Pathar Sahib, and Sangam. Return to Leh.'
      },
      {
        day: 3,
        title: 'Leh to Khardungla to Nubra Valley',
        description: 'Cross Khardungla Pass and descend into Nubra Valley. Explore Diskit and stay in Hunder.'
      },
      {
        day: 4,
        title: 'Nubra to Turktuk',
        description: 'Ride to the remote village of Turktuk near the Indo-Pak border. Experience unique Balti culture.'
      },
      {
        day: 5,
        title: 'Turktuk to Pangong Lake',
        description: 'Scenic ride via Shyok Valley to Pangong Lake. Enjoy an unforgettable sunset by the lake.'
      },
      {
        day: 6,
        title: 'Pangong to Tso Moriri',
        description: 'Ride along the Indo-China border through Chushul and Nyoma to reach the high-altitude Tso Moriri Lake.'
      },
      {
        day: 7,
        title: 'Tso Moriri to Hanle',
        description: 'Travel deep into Changthang Plateau to reach Hanle. Visit India\'s highest observatory.'
      },
      {
        day: 8,
        title: 'Hanle to Umling La Pass',
        description: 'Ride to Umling La Pass (19,024 ft), the world\'s highest motorable road. Return to Hanle for the night.'
      },
      {
        day: 9,
        title: 'Hanle to Leh',
        description: 'Return journey to Leh via Nyoma and Chumathang. Visit hot springs en route.'
      },
      {
        day: 10,
        title: 'Leh Local Tour & Departure',
        description: 'Explore monasteries, Leh Palace, or relax in cafés before your return/checkout.'
      }
    ],
    description: 'The ultimate grand Himalayan motorcycle expedition for true adventurers.',
    coverImage: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600',
    isFeatured: true
  });
}

seedBikeTours().then(() => {
  console.log('Bike tour plans seeded successfully!');
  process.exit(0);
}).catch((err) => {
  console.error('Error seeding bike tour plans:', err);
  process.exit(1);
}); 