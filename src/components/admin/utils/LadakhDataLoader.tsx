import React, { useState } from 'react';
import { AdminContentService } from '../../../services/adminContentService';
import { toast } from 'react-hot-toast';
import { Upload } from 'lucide-react';

const ladakhDestinations = [
  // Natural & Scenic Spots
  {
    title: "Pangong Lake",
    description: "Iconic blue lake stretching across India and China border. Famous for its ever-changing colors and stunning beauty. Featured in the Bollywood movie '3 Idiots', making it one of the most sought-after destinations in Ladakh.",
    difficulty: "Easy" as const,
    duration: 2,
    price: 8500,
    tags: ["Lake", "Scenic", "Photography", "Famous", "Blue Water", "Border"],
    coverImage: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80",
    category: "Natural Wonder"
  },
  {
    title: "Nubra Valley",
    description: "A high-altitude cold desert with unique sand dunes, double-humped Bactrian camels, and the magnificent Diskit Monastery. Experience the surreal landscape where you can ride camels surrounded by snow-capped mountains.",
    difficulty: "Moderate" as const,
    duration: 3,
    price: 12000,
    tags: ["Desert", "Camels", "Monastery", "Sand Dunes", "Unique", "Adventure"],
    coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "Desert Valley"
  },
  {
    title: "Tso Moriri Lake",
    description: "A pristine high-altitude lake at 4,522 meters, quieter and less crowded than Pangong Lake. Perfect for those seeking tranquility and unspoiled natural beauty. Home to numerous migratory birds and offering spectacular mountain reflections.",
    difficulty: "Moderate" as const,
    duration: 2,
    price: 9500,
    tags: ["Lake", "High Altitude", "Peaceful", "Birds", "Mountains", "Reflection"],
    coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "Alpine Lake"
  },
  {
    title: "Zanskar Valley",
    description: "Remote and majestic valley offering some of the most dramatic landscapes in Ladakh. Known for adventure activities like river rafting, trekking, and the famous Chadar Trek on frozen river during winter.",
    difficulty: "Challenging" as const,
    duration: 5,
    price: 25000,
    tags: ["Adventure", "Trekking", "River", "Remote", "Dramatic", "Winter Sports"],
    coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "Adventure Valley"
  },
  {
    title: "Magnetic Hill",
    description: "A fascinating optical illusion where vehicles appear to roll uphill against gravity. This gravity-defying phenomenon attracts curious visitors from around the world. Located on the Leh-Kargil highway.",
    difficulty: "Easy" as const,
    duration: 1,
    price: 2000,
    tags: ["Optical Illusion", "Mystery", "Science", "Unique", "Quick Visit", "Highway"],
    coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "Natural Mystery"
  },
  {
    title: "Khardung La Pass",
    description: "One of the world's highest motorable roads at 5,359 meters. Gateway to Nubra Valley, offering breathtaking views and the thrill of conquering extreme altitude. A must-do for adventure enthusiasts and road trip lovers.",
    difficulty: "Challenging" as const,
    duration: 1,
    price: 3500,
    tags: ["High Altitude", "World Record", "Pass", "Thrilling", "Views", "Road Trip"],
    coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "Mountain Pass"
  },

  // Monasteries & Culture
  {
    title: "Thiksey Monastery",
    description: "The largest monastery in central Ladakh, resembling the famous Potala Palace in Lhasa. Houses a magnificent 15-meter tall statue of Maitreya Buddha and offers stunning views of the Indus Valley.",
    difficulty: "Easy" as const,
    duration: 1,
    price: 1500,
    tags: ["Monastery", "Buddhism", "Architecture", "Spiritual", "Views", "Culture"],
    coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "Buddhist Monastery"
  },
  {
    title: "Hemis Monastery",
    description: "The wealthiest and most famous monastery in Ladakh, known for its annual Hemis Festival featuring colorful masked dances. Houses ancient artifacts, paintings, and a massive collection of Buddhist texts.",
    difficulty: "Easy" as const,
    duration: 2,
    price: 2500,
    tags: ["Monastery", "Festival", "Culture", "Ancient", "Art", "Buddhism"],
    coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "Historic Monastery"
  },
  {
    title: "Alchi Monastery",
    description: "Ancient monastery complex dating back to the 11th century, famous for its unique Indo-Himalayan art and ancient murals. A paradise for art lovers and history enthusiasts.",
    difficulty: "Easy" as const,
    duration: 2,
    price: 2000,
    tags: ["Ancient", "Art", "Murals", "History", "Architecture", "11th Century"],
    coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "Ancient Art"
  },
  {
    title: "Lamayuru Monastery",
    description: "One of the oldest monasteries in Ladakh, surrounded by unique 'Moonland' landscapes that resemble lunar terrain. Offers a serene spiritual experience with dramatic geological formations.",
    difficulty: "Moderate" as const,
    duration: 2,
    price: 3000,
    tags: ["Ancient", "Moonland", "Serene", "Spiritual", "Geology", "Unique Landscape"],
    coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "Ancient Monastery"
  },

  // Towns & Villages
  {
    title: "Leh Town",
    description: "The main city and cultural heart of Ladakh, featuring bustling bazaars, cozy cafés, and the historic Leh Palace. Perfect base for exploring the region with modern amenities and traditional charm.",
    difficulty: "Easy" as const,
    duration: 2,
    price: 5000,
    tags: ["City", "Bazaar", "Culture", "Shopping", "Food", "Base Camp"],
    coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "Cultural Hub"
  },
  {
    title: "Hunder Village",
    description: "Charming village in Nubra Valley famous for Bactrian camel rides on sand dunes. Experience the unique sight of camels against a backdrop of snow-capped mountains in this high-altitude desert.",
    difficulty: "Easy" as const,
    duration: 1,
    price: 4000,
    tags: ["Village", "Camels", "Desert", "Traditional", "Unique Experience", "Sand Dunes"],
    coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "Desert Village"
  },
  {
    title: "Turtuk Village",
    description: "Remote border village with unique Balti culture and history. Last village accessible to tourists near the Pakistan border, offering insights into a distinct culture and stunning apricot orchards.",
    difficulty: "Moderate" as const,
    duration: 2,
    price: 6500,
    tags: ["Border Village", "Balti Culture", "Remote", "History", "Apricots", "Unique"],
    coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "Border Culture"
  },

  // Spiritual & Historical Sites
  {
    title: "Shanti Stupa",
    description: "Beautiful white Buddhist stupa offering panoramic views of Leh city and surrounding mountains. Built by Japanese monks, it's especially stunning during sunrise and sunset with the golden light.",
    difficulty: "Easy" as const,
    duration: 1,
    price: 1000,
    tags: ["Stupa", "Views", "Spiritual", "Sunset", "Peace", "Japanese"],
    coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "Spiritual Monument"
  },
  {
    title: "Leh Palace",
    description: "17th-century royal palace overlooking Leh town, resembling the Potala Palace in Lhasa. Former residence of the royal family of Ladakh, offering great views and historical insights.",
    difficulty: "Easy" as const,
    duration: 1,
    price: 1500,
    tags: ["Palace", "History", "Royal", "Architecture", "Views", "17th Century"],
    coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "Historic Palace"
  },
  {
    title: "Hall of Fame",
    description: "Moving Indian Army museum dedicated to soldiers who sacrificed their lives in various wars. Very informative displays about military history, Ladakh's strategic importance, and tales of bravery.",
    difficulty: "Easy" as const,
    duration: 1,
    price: 500,
    tags: ["Museum", "Military", "History", "Patriotic", "Educational", "Sacrifice"],
    coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "Military Museum"
  },

  // Other Unique Places
  {
    title: "Chang La Pass",
    description: "High-altitude mountain pass at 5,360 meters en route to Pangong Lake. Known for its scenic beauty, extreme cold temperatures, and snow-covered landscapes throughout the year.",
    difficulty: "Challenging" as const,
    duration: 1,
    price: 2500,
    tags: ["High Altitude", "Pass", "Cold", "Snow", "Scenic", "Extreme"],
    coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "Alpine Pass"
  },
  {
    title: "Sangam Point",
    description: "Spectacular confluence where the muddy Zanskar River meets the clear blue Indus River. The two rivers flow side by side without mixing for several kilometers, creating a stunning natural phenomenon.",
    difficulty: "Easy" as const,
    duration: 1,
    price: 1500,
    tags: ["Rivers", "Confluence", "Natural Phenomenon", "Photography", "Unique", "Colors"],
    coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
    category: "River Confluence"
  }
];

export const LadakhDataLoader: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddDestinations = async () => {
    setIsLoading(true);
    try {
      for (const destination of ladakhDestinations) {
        await AdminContentService.addExplorePlan(destination);
        console.log(`✅ Added ${destination.title}`);
      }
      
      toast.success(`🎉 Successfully added ${ladakhDestinations.length} Ladakh destinations!`);
      console.log('📱 Check your admin dashboard - they should appear immediately via real-time sync!');
      
    } catch (error) {
      console.error('❌ Error adding destinations:', error);
      toast.error('Failed to add destinations. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <Upload className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Load Ladakh Test Data</h3>
      </div>
      
      <p className="text-white/70 text-sm mb-4">
        Add 18 comprehensive Ladakh destinations including Pangong Lake, Nubra Valley, 
        monasteries, villages, and mountain passes with detailed descriptions and pricing.
      </p>
      
      <button
        onClick={handleAddDestinations}
        disabled={isLoading}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          isLoading 
            ? 'bg-blue-600/50 text-white/50 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isLoading ? 'Adding Destinations...' : 'Load Ladakh Destinations'}
      </button>
      
      <div className="mt-3 text-xs text-white/50">
        This will add destinations to explorePlans collection with real-time sync.
      </div>
    </div>
  );
};
