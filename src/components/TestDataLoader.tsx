import React, { useState } from 'react';
import { AdminContentService } from '../services/adminContentService';
import { BikeTourPlan } from '../types';

const TestDataLoader: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  const testItineraries: Omit<BikeTourPlan, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      title: "5-Day Ladakh Adventure Circuit",
      description: "Experience the ultimate Himalayan adventure through Leh, Nubra Valley, and Pangong Lake. Perfect for testing our booking system with authentic Ladakh experiences.",
      duration: 5,
      difficulty: "Moderate",
      region: "Leh-Ladakh",
      price: 25000,
      originalPrice: 30000,
      isFeatured: true,
      category: "Adventure Tours",
      groupSize: { min: 2, max: 8 },
      images: [
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800"
      ],
      highlights: [
        "Ride through world's highest motorable roads",
        "Experience Magnetic Hill phenomenon", 
        "Overnight in Nubra Valley desert",
        "Visit iconic Pangong Lake",
        "Explore ancient monasteries"
      ],
      inclusions: [
        "Airport pickup and drop-off",
        "Accommodation for 4 nights",
        "All meals included",
        "Royal Enfield Himalayan 411cc",
        "Professional riding guide"
      ],
      itinerary: [
        {
          day: 1,
          title: "Arrival in Leh",
          description: "Arrive and acclimatize",
          activities: ["Airport pickup", "Hotel check-in", "Local sightseeing"],
          accommodation: "Hotel in Leh",
          meals: "Lunch, Dinner",
          distance: "15 km",
          altitude: "3,500m"
        },
        {
          day: 2, 
          title: "Leh to Nubra Valley",
          description: "Cross Khardung La Pass",
          activities: ["Khardung La Pass", "Desert camp", "Camel safari"],
          accommodation: "Desert Camp",
          meals: "All meals",
          distance: "160 km",
          altitude: "3,200m"
        },
        {
          day: 3,
          title: "Nubra to Pangong Lake", 
          description: "Journey to blue waters",
          activities: ["Shyok route", "Lake photography", "Stargazing"],
          accommodation: "Lake-side Camp",
          meals: "All meals", 
          distance: "180 km",
          altitude: "4,350m"
        },
        {
          day: 4,
          title: "Pangong to Leh",
          description: "Return via Chang La",
          activities: ["Sunrise at lake", "Hemis Monastery", "Shopping"],
          accommodation: "Hotel in Leh",
          meals: "All meals",
          distance: "140 km", 
          altitude: "3,500m"
        },
        {
          day: 5,
          title: "Local Sightseeing & Departure",
          description: "Final day exploration",
          activities: ["Magnetic Hill", "Alchi Monastery", "Airport transfer"],
          accommodation: "Day use",
          meals: "Breakfast, Lunch",
          distance: "120 km",
          altitude: "3,500m"
        }
      ],
      tags: ["Adventure", "Motorcycling", "Himalaya", "Ladakh"],
      rating: 4.8,
      reviewCount: 156
    },
    {
      title: "5-Day Leh to Srinagar Highway",
      description: "Epic ride from Leh to Srinagar covering scenic mountain passes and valleys.",
      duration: 5,
      difficulty: "Challenging", 
      region: "Leh-Ladakh",
      price: 28000,
      originalPrice: 35000,
      isFeatured: true,
      category: "Highway Tours",
      groupSize: { min: 2, max: 6 },
      images: [
        "https://images.unsplash.com/photo-1570108723018-3ba8fca83e2d?w=800"
      ],
      highlights: [
        "Famous Leh-Srinagar Highway",
        "Multiple high altitude passes",
        "Diverse landscapes",
        "Kargil War Memorial",
        "Kashmir Valley experience"
      ],
      inclusions: [
        "All transfers",
        "Accommodation",
        "Meals",
        "Bike and fuel",
        "Support vehicle"
      ],
      itinerary: [
        {
          day: 1,
          title: "Leh to Kargil",
          description: "Highway journey begins",
          activities: ["Highway riding", "Mountain passes"],
          accommodation: "Hotel Kargil",
          meals: "All meals",
          distance: "220 km",
          altitude: "2,676m"
        },
        {
          day: 2,
          title: "Kargil Sightseeing", 
          description: "Explore Kargil",
          activities: ["War memorial", "Local culture"],
          accommodation: "Hotel Kargil",
          meals: "All meals",
          distance: "50 km",
          altitude: "2,676m"
        },
        {
          day: 3,
          title: "Kargil to Sonamarg",
          description: "Cross Zoji La",
          activities: ["Zoji La pass", "Valley views"],
          accommodation: "Hotel Sonamarg",
          meals: "All meals", 
          distance: "140 km",
          altitude: "2,740m"
        },
        {
          day: 4,
          title: "Sonamarg to Gulmarg",
          description: "Kashmir valleys",
          activities: ["Valley riding", "Meadows"],
          accommodation: "Hotel Gulmarg",
          meals: "All meals",
          distance: "120 km",
          altitude: "2,650m"
        },
        {
          day: 5,
          title: "Gulmarg to Srinagar",
          description: "Final destination",
          activities: ["Dal Lake", "Houseboat"],
          accommodation: "Houseboat",
          meals: "All meals",
          distance: "50 km", 
          altitude: "1,585m"
        }
      ],
      tags: ["Highway", "Adventure", "Kashmir"],
      rating: 4.7,
      reviewCount: 89
    }
  ];

  const addTestData = async () => {
    setLoading(true);
    setStatus('Adding test itineraries...');
    
    try {
      for (let i = 0; i < testItineraries.length; i++) {
        const itinerary = testItineraries[i];
        await AdminContentService.addBikeTourPlan(itinerary);
        setStatus(`Added ${i + 1}/${testItineraries.length}: ${itinerary.title}`);
        
        // Small delay to see progress
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setStatus('✅ All test itineraries added successfully! Check your Explore page.');
    } catch (error) {
      console.error('Error adding test data:', error);
      setStatus('❌ Error adding test data. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">🧪 Add Test Itineraries</h3>
      
      <div className="mb-4">
        <p className="text-white/80 text-sm mb-2">
          This will add 2 sample 5-day itineraries to test your bike tours functionality:
        </p>
        <ul className="text-white/60 text-sm space-y-1 ml-4">
          <li>• 5-Day Ladakh Adventure Circuit (₹25,000)</li>
          <li>• 5-Day Leh to Srinagar Highway (₹28,000)</li>
        </ul>
      </div>

      <button
        onClick={addTestData}
        disabled={loading}
        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 text-white font-semibold rounded-lg transition-colors mb-4"
      >
        {loading ? 'Adding Data...' : '🚀 Add Test Itineraries'}
      </button>

      {status && (
        <div className="p-3 bg-blue-500/20 rounded border border-blue-300/30">
          <p className="text-blue-200 text-sm">{status}</p>
        </div>
      )}

      <div className="mt-4 p-3 bg-green-500/20 rounded border border-green-300/30">
        <p className="text-green-200 text-sm">
          💡 After adding, check: Admin → Trip Plans and Explore page to see real-time sync!
        </p>
      </div>
    </div>
  );
};

export default TestDataLoader;
