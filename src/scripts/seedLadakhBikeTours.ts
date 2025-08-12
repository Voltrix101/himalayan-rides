import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

type Day = {
  day: number;
  title: string;
  route?: string;
  distance_km?: number;
  highlights?: string[];
  stay?: string;
  permit_required?: boolean;
};

async function addTour(name: string, days: Day[], meta: any) {
  await addDoc(collection(db, 'bikeTours'), {
    name,
    description: meta.description,
    region: 'Ladakh',
    duration: meta.duration,
    difficulty: meta.difficulty,
    pricePerPerson: meta.pricePerPerson,
    maxGroupSize: meta.maxGroupSize || 12,
    startLocation: meta.startLocation || 'Leh',
    endLocation: meta.endLocation || 'Leh',
    image: meta.image,
    highlights: meta.highlights || [],
    inclusions: meta.inclusions || [],
    exclusions: meta.exclusions || [],
    bestTime: meta.bestTime || 'May - September',
    termsAndConditions: meta.termsAndConditions || '',
    isActive: true,
    rating: 4.8,
    itinerary: days.map((d) => ({
      day: d.day,
      title: d.title,
      description: '',
      activities: d.highlights || [],
      accommodation: d.stay || '',
      meals: [],
      distance: d.distance_km ? `${d.distance_km} km` : '',
      altitude: ''
    })),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
}

export async function seedLadakhBikeTours() {
  // 7-Day plan
  await addTour('Ladakh 7-Day Circuit', [
    { day: 1, title: 'Leh Arrival & Acclimatization', highlights: ['Shanti Stupa', 'Leh Palace'] },
    { day: 2, title: 'Leh → Sham Valley → Leh', route: 'Magnetic Hill - Pathar Sahib - Sangam - Alchi', distance_km: 160 },
    { day: 3, title: 'Leh → Nubra Valley', route: 'Khardung La - Diskit - Hunder', distance_km: 125, highlights: ['Khardung La', 'Camel Ride'], stay: 'Hunder' },
    { day: 4, title: 'Nubra → Turtuk → Nubra', distance_km: 160, highlights: ['Turtuk village', 'LOC Views'] },
    { day: 5, title: 'Nubra → Pangong Lake (via Shyok)', distance_km: 160, highlights: ['Sunset at Pangong'], stay: 'Spangmik' },
    { day: 6, title: 'Pangong → Leh (via Chang La)', distance_km: 225 },
    { day: 7, title: 'Leh Departure' }
  ], {
    description: 'Fast-paced Ladakh circuit covering Nubra and Pangong in a week.',
    duration: 7,
    difficulty: 'Moderate',
    pricePerPerson: 30000,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    highlights: ['Khardung La', 'Pangong', 'Turtuk'],
    inclusions: ['Bike/Car Rental', 'Permits', 'Support'],
  });

  // 10-Day plan
  await addTour('Ladakh 10-Day Expedition', [
    { day: 1, title: 'Leh Arrival & Acclimatization' },
    { day: 2, title: 'Leh → Sham Valley → Leh' },
    { day: 3, title: 'Leh → Nubra Valley' },
    { day: 4, title: 'Nubra → Turtuk → Nubra' },
    { day: 5, title: 'Nubra → Pangong (via Shyok)' },
    { day: 6, title: 'Pangong → Hanle (permits)', highlights: ['Hanle Observatory'] },
    { day: 7, title: 'Hanle → Tso Moriri', stay: 'Korzok' },
    { day: 8, title: 'Tso Moriri → Leh' },
    { day: 9, title: 'Leh Free Day (Thiksey, Hemis, Shey)' },
    { day: 10, title: 'Departure' }
  ], {
    description: 'Balanced Ladakh expedition including Hanle and Tso Moriri.',
    duration: 10,
    difficulty: 'Moderate',
    pricePerPerson: 42000,
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800',
    highlights: ['Hanle', 'Tso Moriri', 'Pangong'],
    inclusions: ['Bike/Car Rental', 'Permits', 'Support'],
  });

  // 15-Day plan
  await addTour('Ladakh 15-Day Grand Tour', [
    { day: 1, title: 'Leh Arrival' },
    { day: 2, title: 'Leh Acclimatization & Local Tour' },
    { day: 3, title: 'Leh → Sham Valley → Kargil', highlights: ['Likir', 'Lamayuru'] },
    { day: 4, title: 'Kargil → Leh via Batalik' },
    { day: 5, title: 'Leh → Nubra Valley' },
    { day: 6, title: 'Nubra → Turtuk → Nubra' },
    { day: 7, title: 'Nubra → Pangong Lake' },
    { day: 8, title: 'Pangong → Hanle' },
    { day: 9, title: 'Hanle → Umling La → Hanle' },
    { day: 10, title: 'Hanle → Tso Moriri' },
    { day: 11, title: 'Tso Moriri → Leh' },
    { day: 12, title: 'Leh → Chilling & Zanskar Rafting' },
    { day: 13, title: 'Stok Village Trek / Day Hike' },
    { day: 14, title: 'Leh Free Day (Shopping)' },
    { day: 15, title: 'Departure' }
  ], {
    description: 'Leisurely grand tour covering Ladakh highlights and hidden gems.',
    duration: 15,
    difficulty: 'Moderate',
    pricePerPerson: 65000,
    image: 'https://images.unsplash.com/photo-1626618012641-bfbca5a31239?w=800',
    highlights: ['Umling La', 'Tso Moriri', 'Pangong', 'Turtuk'],
    inclusions: ['Bike/Car Rental', 'Permits', 'Support'],
  });
}

export default seedLadakhBikeTours;



