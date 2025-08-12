import React, { useState } from 'react';
import { AdminContentService } from '../services/adminContentService';
import { ExplorePlan } from '../types';

const ExploreTestDataLoader: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  const testExplorePlans: Omit<ExplorePlan, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      title: "Pangong Lake",
      description: "Experience the mesmerizing blue waters of Pangong Lake, one of the most beautiful high-altitude lakes in the world.",
      region: "Leh-Ladakh",
      category: "Lake",
      price: 8000,
      originalPrice: 10000,
      duration: 2,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
        "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800"
      ],
      highlights: [
        "Crystal clear blue waters",
        "Changing colors throughout the day",
        "Bollywood movie shooting location",
        "Stunning sunset and sunrise views",
        "High altitude lake at 4,350m"
      ],
      inclusions: [
        "Transportation from Leh",
        "Inner Line Permit",
        "Accommodation at lake-side camp",
        "All meals during stay",
        "Professional guide"
      ],
      itinerary: [
        {
          day: 1,
          title: "Leh to Pangong Lake",
          description: "Drive to Pangong Lake via Chang La Pass",
          activities: ["Chang La Pass crossing", "Lake arrival", "Photography session"],
          accommodation: "Lake-side camp",
          meals: "Lunch, Dinner"
        },
        {
          day: 2,
          title: "Pangong Lake to Leh",
          description: "Sunrise at lake and return journey",
          activities: ["Sunrise photography", "Lake exploration", "Return to Leh"],
          accommodation: "Hotel in Leh",
          meals: "Breakfast, Lunch"
        }
      ],
      bestTime: "May to September",
      difficulty: "Easy",
      groupSize: { min: 2, max: 15 },
      tags: ["Lake", "Photography", "Scenic", "High Altitude"],
      rating: 4.9,
      reviewCount: 234
    },
    {
      title: "Nubra Valley Desert Safari",
      description: "Explore the cold desert of Nubra Valley with sand dunes, Bactrian camels, and stunning monasteries.",
      region: "Leh-Ladakh",
      category: "Desert",
      price: 12000,
      originalPrice: 15000,
      duration: 3,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
      ],
      highlights: [
        "Double-humped Bactrian camel safari",
        "Sand dunes in the Himalayas",
        "Diskit Monastery visit",
        "World's highest motorable road (Khardung La)",
        "Unique cold desert landscape"
      ],
      inclusions: [
        "Transportation via Khardung La",
        "Desert camp accommodation",
        "Camel safari experience",
        "All meals included",
        "Monastery entry fees"
      ],
      itinerary: [
        {
          day: 1,
          title: "Leh to Nubra Valley",
          description: "Cross Khardung La Pass to reach Nubra Valley",
          activities: ["Khardung La Pass", "Diskit Monastery", "Desert camp check-in"],
          accommodation: "Desert camp",
          meals: "Lunch, Dinner"
        },
        {
          day: 2,
          title: "Nubra Valley Exploration",
          description: "Full day desert and monastery exploration",
          activities: ["Camel safari", "Sand dune photography", "Local village visit"],
          accommodation: "Desert camp",
          meals: "All meals"
        },
        {
          day: 3,
          title: "Nubra Valley to Leh",
          description: "Return journey to Leh",
          activities: ["Morning camel ride", "Return via Khardung La", "Leh arrival"],
          accommodation: "Hotel in Leh", 
          meals: "Breakfast, Lunch"
        }
      ],
      bestTime: "May to September",
      difficulty: "Moderate",
      groupSize: { min: 2, max: 12 },
      tags: ["Desert", "Camel Safari", "Adventure", "Monastery"],
      rating: 4.7,
      reviewCount: 189
    },
    {
      title: "Tso Moriri Lake Expedition",
      description: "Journey to the pristine and less crowded Tso Moriri Lake, a hidden gem in Ladakh's Changthang region.",
      region: "Leh-Ladakh",
      category: "Lake",
      price: 15000,
      originalPrice: 18000,
      duration: 4,
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1570108723018-3ba8fca83e2d?w=800"
      ],
      highlights: [
        "Less crowded pristine lake",
        "Changthang wildlife sanctuary",
        "Traditional nomadic culture",
        "Spectacular mountain reflections",
        "Remote high-altitude experience"
      ],
      inclusions: [
        "4WD vehicle transportation",
        "Camping equipment",
        "All meals and accommodation",
        "Professional guide",
        "Wildlife sanctuary permits"
      ],
      itinerary: [
        {
          day: 1,
          title: "Leh to Chumathang",
          description: "Drive to Chumathang via Upshi",
          activities: ["Scenic drive", "Hot springs visit", "Village exploration"],
          accommodation: "Guest house",
          meals: "Lunch, Dinner"
        },
        {
          day: 2,
          title: "Chumathang to Tso Moriri",
          description: "Journey to the beautiful Tso Moriri Lake",
          activities: ["Lake arrival", "Photography", "Sunset viewing"],
          accommodation: "Camping near lake",
          meals: "All meals"
        },
        {
          day: 3,
          title: "Tso Moriri Exploration",
          description: "Full day at the lake with wildlife spotting",
          activities: ["Wildlife photography", "Lake circumnavigation", "Stargazing"],
          accommodation: "Camping near lake",
          meals: "All meals"
        },
        {
          day: 4,
          title: "Tso Moriri to Leh",
          description: "Return journey to Leh",
          activities: ["Morning photography", "Return drive", "Leh arrival"],
          accommodation: "Hotel in Leh",
          meals: "Breakfast, Lunch"
        }
      ],
      bestTime: "June to September",
      difficulty: "Challenging",
      groupSize: { min: 2, max: 8 },
      tags: ["Remote Lake", "Wildlife", "Photography", "Camping"],
      rating: 4.8,
      reviewCount: 67
    }
  ];

  const addExploreTestData = async () => {
    setLoading(true);
    setStatus('Adding explore destinations...');
    
    try {
      for (let i = 0; i < testExplorePlans.length; i++) {
        const plan = testExplorePlans[i];
        await AdminContentService.addExplorePlan(plan);
        setStatus(`Added ${i + 1}/${testExplorePlans.length}: ${plan.title}`);
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setStatus('✅ All explore destinations added! Check your Explore page.');
    } catch (error) {
      console.error('Error adding explore test data:', error);
      setStatus('❌ Error adding explore data. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 mt-6">
      <h3 className="text-xl font-bold text-white mb-4">🏔️ Add Test Destinations</h3>
      
      <div className="mb-4">
        <p className="text-white/80 text-sm mb-2">
          This will add 3 sample destinations to test your explore functionality:
        </p>
        <ul className="text-white/60 text-sm space-y-1 ml-4">
          <li>• Pangong Lake (₹8,000) - 2 days</li>
          <li>• Nubra Valley Desert Safari (₹12,000) - 3 days</li>
          <li>• Tso Moriri Lake Expedition (₹15,000) - 4 days</li>
        </ul>
      </div>

      <button
        onClick={addExploreTestData}
        disabled={loading}
        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white font-semibold rounded-lg transition-colors mb-4"
      >
        {loading ? 'Adding Destinations...' : '🏔️ Add Test Destinations'}
      </button>

      {status && (
        <div className="p-3 bg-blue-500/20 rounded border border-blue-300/30">
          <p className="text-blue-200 text-sm">{status}</p>
        </div>
      )}
    </div>
  );
};

export default ExploreTestDataLoader;
