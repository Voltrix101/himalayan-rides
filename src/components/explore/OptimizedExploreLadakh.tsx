import { memo, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mountain, 
  Camera, 
  MapPin, 
  Star, 
  Clock, 
  ChevronRight
} from 'lucide-react';
import { OptimizedGlass } from '../ui/OptimizedGlass';
import { OptimizedImage } from '../ui/OptimizedImage';
import { Button } from '../ui/Button';
import { UniversalModal } from '../ui/UniversalModal';
import { ExperienceBookingModal } from '../booking/ExperienceBookingModal';
import { BikeTourBookingModal } from '../booking/BikeTourBookingModal.tsx';
import { useOptimizedScroll } from '../../hooks/useOptimizedScroll';
import { adminFirebaseService, BikeTour as AdminBikeTour, Experience as AdminExperience } from '../../services/adminFirebaseService';
import { explorePlansService } from '../../services/explorePlansService';
import { ExplorePlan } from '../../types';

// Types - exactly matching deployed website
interface Destination {
  id: string;
  name: string;
  description: string;
  image: string;
  altitude: string;
  bestTime: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  highlights: string[];
  distance: string;
  price: number;
  rating: number;
}

// Use admin service types
type Experience = AdminExperience;

interface LocalBikeTour {
  id: string;
  name: string;
  description: string;
  image: string;
  duration: string;
  distance: string;
  difficulty: 'Intermediate' | 'Advanced' | 'Expert';
  price: number;
  rating: number;
  highlights: string[];
  includes: string[];
  route: string;
  itinerary?: {
    day: number;
    title: string;
    description: string;
    activities: string[];
    accommodation: string;
    meals: string[];
    distance?: string;
    altitude?: string;
  }[];
  region?: string;
}

// Performance-optimized data - fallback destinations
const originalDestinations: Destination[] = [
  {
    id: 'pangong',
    name: 'Pangong Tso',
    description: 'A high-altitude lake that changes colors throughout the day, stretching across India and China.',
    image: 'https://images.pexels.com/photos/1049298/pexels-photo-1049298.jpeg?auto=compress&cs=tinysrgb&w=600',
    altitude: '4,350m',
    bestTime: 'May - September',
    difficulty: 'Moderate',
    highlights: ['Color-changing waters', 'Bollywood filming location', 'Camping under stars'],
    distance: '160km from Leh',
    price: 15000,
    rating: 4.8
  },
  {
    id: 'nubra',
    name: 'Nubra Valley',
    description: 'The valley of flowers with sand dunes, double-humped camels, and ancient monasteries.',
    image: 'https://images.pexels.com/photos/2325446/pexels-photo-2325446.jpeg?auto=compress&cs=tinysrgb&w=600',
    altitude: '3,048m',
    bestTime: 'April - October',
    difficulty: 'Easy',
    highlights: ['Bactrian camels', 'Sand dunes', 'Diskit Monastery'],
    distance: '120km from Leh',
    price: 12000,
    rating: 4.7
  },
  {
    id: 'khardungla',
    name: 'Khardung La Pass',
    description: 'World\'s highest motorable pass offering breathtaking views of the Himalayas.',
    image: 'https://images.pexels.com/photos/3030336/pexels-photo-3030336.jpeg?auto=compress&cs=tinysrgb&w=600',
    altitude: '5,359m',
    bestTime: 'May - September',
    difficulty: 'Challenging',
    highlights: ['Highest motorable road', 'Panoramic mountain views', 'Adventure riding'],
    distance: '40km from Leh',
    price: 8000,
    rating: 4.9
  },
  {
    id: 'tso-moriri',
    name: 'Tso Moriri',
    description: 'A pristine high-altitude lake surrounded by snow-capped mountains and wildlife.',
    image: 'https://images.pexels.com/photos/5120892/pexels-photo-5120892.jpeg?auto=compress&cs=tinysrgb&w=600',
    altitude: '4,522m',
    bestTime: 'June - September',
    difficulty: 'Challenging',
    highlights: ['Wildlife sanctuary', 'Crystal clear waters', 'Remote location'],
    distance: '220km from Leh',
    price: 20000,
    rating: 4.6
  }
];

// Legacy experiences removed - now loading from Firebase admin service

const originalBikeTours: LocalBikeTour[] = [
  {
    id: 'leh-ladakh-ultimate',
    name: 'Leh-Ladakh Ultimate Adventure',
    description: 'The ultimate motorcycle adventure through the highest motorable passes in the world.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    duration: '14 Days',
    distance: '2,500 km',
    difficulty: 'Advanced',
    price: 85000,
    rating: 4.9,
    highlights: ['Khardung La Pass', 'Nubra Valley', 'Pangong Lake', 'Tso Moriri'],
    includes: ['Royal Enfield 350/500', 'Fuel', 'Accommodation', 'Meals', 'Guide'],
    route: 'Delhi → Manali → Leh → Nubra → Pangong → Delhi'
  },
  {
    id: 'spiti-valley-circuit',
    name: 'Spiti Valley Circuit',
    description: 'Journey through the moonscape of Spiti Valley with ancient monasteries and pristine lakes.',
    image: 'https://images.unsplash.com/photo-1626618012641-bfbca5a31239?w=800',
    duration: '10 Days',
    distance: '1,800 km',
    difficulty: 'Intermediate',
    price: 65000,
    rating: 4.8,
    highlights: ['Key Monastery', 'Chandratal Lake', 'Kaza', 'Pin Valley'],
    includes: ['Bike Rental', 'Fuel', 'Camping', 'Meals', 'Permits'],
    route: 'Delhi → Shimla → Kaza → Manali → Delhi'
  },
  {
    id: 'himalayan-base-camp',
    name: 'Himalayan Base Camp Ride',
    description: 'Epic journey to the base of the world\'s highest peaks with expert guides.',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800',
    duration: '12 Days',
    distance: '2,200 km',
    difficulty: 'Expert',
    price: 95000,
    rating: 4.9,
    highlights: ['Everest Base Camp View', 'Rongbuk Monastery', 'Mount Kailash', 'Mansarovar'],
    includes: ['Premium Bikes', 'Oxygen Support', 'Expert Guide', 'All Permits'],
    route: 'Kathmandu → Tingri → EBC → Kailash → Kathmandu'
  }
];

// Animation variants optimized for performance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  }
};

// Memoized destination card component
const DestinationCard = memo<{
  destination: Destination;
  onSelect: (destination: Destination) => void;
}>(({ destination, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(destination);
  }, [destination, onSelect]);

  const getDifficultyColor = useCallback((difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-400/20';
      case 'Moderate': return 'text-yellow-400 bg-yellow-400/20';
      case 'Challenging': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  }, []);

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5, scale: 1.02 }}
      className="cursor-pointer"
      onClick={handleClick}
    >
      <OptimizedGlass 
        intensity="heavy" 
        className="overflow-hidden hover:ring-2 hover:ring-purple-400/50 transition-all duration-300 bg-black/20 border border-white/10"
      >
        <div className="relative h-48 overflow-hidden">
          <OptimizedImage
            src={destination.image}
            alt={destination.name}
            className="w-full h-full object-cover"
            enableMotion={true}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Difficulty Badge */}
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(destination.difficulty)}`}>
              {destination.difficulty}
            </span>
          </div>

          {/* Rating */}
          <div className="absolute bottom-4 left-4 flex items-center text-white">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="font-medium">{destination.rating}</span>
          </div>
        </div>

        <div className="p-6 bg-black/30 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">{destination.name}</h3>
          <p className="text-white/90 text-sm mb-4 line-clamp-2 drop-shadow-md">{destination.description}</p>
          
          <div className="flex items-center justify-between text-sm text-white/80 mb-4">
            <div className="flex items-center bg-white/10 px-2 py-1 rounded">
              <Mountain className="w-4 h-4 mr-1 text-blue-300" />
              <span className="font-medium">{destination.altitude}</span>
            </div>
            <div className="flex items-center bg-white/10 px-2 py-1 rounded">
              <MapPin className="w-4 h-4 mr-1 text-green-300" />
              <span className="font-medium">{destination.distance}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-purple-200 text-sm font-medium bg-purple-600/20 px-3 py-1 rounded-full">{destination.bestTime}</span>
            <ChevronRight className="w-5 h-5 text-white/80" />
          </div>
        </div>
      </OptimizedGlass>
    </motion.div>
  );
});

DestinationCard.displayName = 'DestinationCard';

// Memoized experience card component
const ExperienceCard = memo<{
  experience: Experience;
  onBook: (experience: Experience) => void;
}>(({ experience, onBook }) => {
  const handleBook = useCallback(() => {
    onBook(experience);
  }, [experience, onBook]);

  return (
    <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }}>
      <OptimizedGlass intensity="heavy" className="overflow-hidden bg-black/20 border border-white/10">
        <div className="relative h-40 overflow-hidden">
          <OptimizedImage
            src={experience.image}
            alt={experience.title}
            className="w-full h-full object-cover"
            enableMotion={true}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <div className="absolute bottom-4 left-4 text-white">
            <div className="flex items-center mb-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="font-medium">{experience.rating}</span>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 text-white font-bold">
            ₹{experience.price.toLocaleString()}
          </div>
        </div>

        <div className="p-4 bg-black/30 backdrop-blur-sm">
          <h4 className="text-lg font-bold text-white mb-2 drop-shadow-lg">{experience.title}</h4>
          <p className="text-white/90 text-sm mb-3 line-clamp-2 drop-shadow-md">{experience.description}</p>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-sm text-white/80 bg-white/10 px-2 py-1 rounded">
              <Clock className="w-4 h-4 mr-1 text-blue-300" />
              <span className="font-medium">{experience.duration}</span>
            </div>
            <span className="px-3 py-1 bg-purple-600/30 text-purple-200 text-xs rounded-full font-medium border border-purple-400/30">
              {experience.category}
            </span>
          </div>

          <Button
            onClick={handleBook}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
          >
            Book Experience
          </Button>
        </div>
      </OptimizedGlass>
    </motion.div>
  );
});

ExperienceCard.displayName = 'ExperienceCard';

// Memoized bike tour card component
const BikeTourCard = memo<{
  tour: LocalBikeTour;
  onBook: (tour: LocalBikeTour) => void;
}>(({ tour, onBook }) => {
  const handleBook = useCallback(() => {
    onBook(tour);
  }, [tour, onBook]);

  const getDifficultyColor = useCallback((difficulty: string) => {
    switch (difficulty) {
      case 'Intermediate': return 'text-yellow-400 bg-yellow-400/20';
      case 'Advanced': return 'text-orange-400 bg-orange-400/20';
      case 'Expert': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  }, []);

  return (
    <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }}>
      <OptimizedGlass intensity="heavy" className="overflow-hidden bg-black/20 border border-white/10">
        <div className="relative h-48 overflow-hidden">
          <OptimizedImage
            src={tour.image}
            alt={tour.name}
            className="w-full h-full object-cover"
            enableMotion={true}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Difficulty Badge */}
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(tour.difficulty)}`}>
              {tour.difficulty}
            </span>
          </div>

          {/* Rating */}
          <div className="absolute bottom-4 left-4 flex items-center text-white">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="font-medium">{tour.rating}</span>
          </div>

          {/* Price */}
          <div className="absolute bottom-4 right-4">
            <span className="text-white font-bold text-lg">₹{(tour.price || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="p-4 bg-black/30 backdrop-blur-sm">
          <h4 className="text-lg font-bold text-white mb-2 drop-shadow-lg">{tour.name}</h4>
          <p className="text-white/90 text-sm mb-3 line-clamp-2 drop-shadow-md">{tour.description}</p>
          
          <div className="flex items-center justify-between text-sm text-white/80 mb-3">
            <div className="flex items-center bg-white/10 px-2 py-1 rounded">
              <Clock className="w-4 h-4 mr-1 text-blue-300" />
              <span className="font-medium">{tour.duration}</span>
            </div>
            <div className="flex items-center bg-white/10 px-2 py-1 rounded">
              <MapPin className="w-4 h-4 mr-1 text-green-300" />
              <span className="font-medium">{tour.distance}</span>
            </div>
          </div>

          {/* Highlights */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {tour.highlights.slice(0, 3).map((highlight, index) => (
                <span key={index} className="px-2 py-1 bg-blue-600/30 text-blue-200 text-xs rounded border border-blue-400/30 font-medium">
                  {highlight}
                </span>
              ))}
              {tour.highlights.length > 3 && (
                <span className="px-2 py-1 bg-gray-600/30 text-gray-200 text-xs rounded border border-gray-400/30 font-medium">
                  +{tour.highlights.length - 3} more
                </span>
              )}
            </div>
          </div>

          <Button
            onClick={handleBook}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg"
          >
            🏍️ Book Tour
          </Button>
        </div>
      </OptimizedGlass>
    </motion.div>
  );
});

BikeTourCard.displayName = 'BikeTourCard';

// Main ExploreLadakh component - optimized version
export const ExploreLadakh = memo(() => {
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [showExperienceBookingModal, setShowExperienceBookingModal] = useState(false);
  const [showBikeTourBookingModal, setShowBikeTourBookingModal] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [selectedBikeTour, setSelectedBikeTour] = useState<LocalBikeTour | null>(null);
  const [activeTab, setActiveTab] = useState<'destinations' | 'experiences' | 'bike-tours'>('destinations');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [bikeTours, setBikeTours] = useState<LocalBikeTour[]>([]);
  const [loadingTours, setLoadingTours] = useState(true);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loadingExperiences, setLoadingExperiences] = useState(true);
  const [showItinerary, setShowItinerary] = useState(false);

  // Load destinations from Firebase (ExplorePlans)
  useEffect(() => {
    setLoadingDestinations(true);
    
    const loadDestinations = async () => {
      try {
        const unsubscribe = explorePlansService.subscribeToExplorePlans((explorePlans: ExplorePlan[]) => {
          try {
            // Convert ExplorePlans to Destinations format
            const convertedDestinations: Destination[] = explorePlans
              .filter((plan: ExplorePlan) => plan.title && plan.description) // Filter out invalid entries
              .map((plan: ExplorePlan) => ({
                id: plan.id,
                name: plan.title,
                description: plan.description,
                image: plan.coverImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
                altitude: '4,000m+', // Default since ExplorePlan doesn't have altitude
                bestTime: plan.bestTime || 'May - September',
                difficulty: (plan.difficulty as 'Easy' | 'Moderate' | 'Challenging') || 'Moderate',
                highlights: plan.highlights || [],
                distance: plan.duration || 'Distance varies',
                price: 15000, // Default price since ExplorePlan doesn't have price
                rating: 4.5 // Default rating
              }));
            
            setDestinations(convertedDestinations);
            setLoadingDestinations(false);
          } catch (error) {
            console.error('Error converting explore plans:', error);
            // Fallback to original hardcoded destinations if conversion fails
            setDestinations(originalDestinations);
            setLoadingDestinations(false);
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error loading destinations:', error);
        setDestinations(originalDestinations);
        setLoadingDestinations(false);
        return () => {};
      }
    };

    loadDestinations();
  }, []);

  // Load bike tours from Firebase
  useEffect(() => {
    setLoadingTours(true);
    
    const loadTours = async () => {
      try {
        const unsubscribe = await adminFirebaseService.getBikeTours((adminTours: AdminBikeTour[]) => {
          try {
            // Filter out invalid tours and convert admin tours to component format
            const convertedTours: LocalBikeTour[] = adminTours
              .filter((tour: AdminBikeTour) => tour.name && tour.pricePerPerson) // Filter out invalid entries
              .map((tour: AdminBikeTour) => ({
                id: tour.id,
                name: tour.name,
                description: tour.description,
                image: tour.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
                duration: `${tour.duration} Days`,
                distance: 'Distance varies', // AdminBikeTour doesn't have distance property
                difficulty: (tour.difficulty === 'Easy' || tour.difficulty === 'Moderate') ? 'Intermediate' :
                           (tour.difficulty === 'Challenging') ? 'Advanced' : 'Expert',
                price: tour.pricePerPerson || 0,
                rating: 4.5, // Default rating since it's not in admin interface
                highlights: tour.highlights || [],
                includes: tour.inclusions || [],
                route: tour.startLocation === tour.endLocation 
                  ? `${tour.startLocation} Circuit` 
                  : `${tour.startLocation} → ${tour.endLocation}`,
                itinerary: tour.itinerary || [],
                region: tour.region || 'Ladakh'
              }));
            
            setBikeTours(convertedTours);
            setLoadingTours(false);
          } catch (error) {
            console.error('Error converting bike tours:', error);
            // Fallback to original hardcoded tours if conversion fails
            setBikeTours(originalBikeTours);
            setLoadingTours(false);
          }
        });

        // Cleanup subscription on unmount
        return () => {
          if (unsubscribe) unsubscribe();
        };
      } catch (error) {
        console.error('Error setting up bike tours listener:', error);
        setBikeTours(originalBikeTours);
        setLoadingTours(false);
      }
    };

    loadTours();
  }, []);

  // Load experiences from Firebase
  useEffect(() => {
    setLoadingExperiences(true);
    
    const loadExperiences = async () => {
      try {
        const unsubscribe = await adminFirebaseService.getExperiences((adminExperiences: AdminExperience[]) => {
          try {
            // Use admin experiences directly since Experience = AdminExperience now
            const validExperiences = adminExperiences.filter((exp: AdminExperience) => exp.title && exp.price);
            
            console.log('Experiences loaded:', validExperiences.length);
            setExperiences(validExperiences);
            setLoadingExperiences(false);
          } catch (error) {
            console.error('Error loading experiences:', error);
            setExperiences([]);
            setLoadingExperiences(false);
          }
        });

        // Cleanup subscription on unmount
        return () => {
          if (unsubscribe) unsubscribe();
        };
      } catch (error) {
        console.error('Error setting up experiences listener:', error);
        setExperiences([]);
        setLoadingExperiences(false);
      }
    };

    loadExperiences();
  }, []);

  // Optimized scroll effects
  const { parallaxY } = useOptimizedScroll({
    enableParallax: true
  });

  // Memoized handlers for performance
  const handleDestinationSelect = useCallback((destination: Destination) => {
    setSelectedDestination(destination);
  }, []);

  const handleExperienceBook = useCallback((experience: Experience) => {
    setSelectedExperience(experience);
    setShowExperienceBookingModal(true);
  }, []);

  const handleBikeTourBook = useCallback((tour: LocalBikeTour) => {
    setSelectedBikeTour(tour);
    // Only show the tour details modal, not the booking modal
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedDestination(null);
    setSelectedExperience(null);
    setSelectedBikeTour(null);
    setShowItinerary(false);
    setShowExperienceBookingModal(false);
  }, []);

  const handleTabChange = useCallback((tab: 'destinations' | 'experiences' | 'bike-tours') => {
    setActiveTab(tab);
  }, []);

  return (
    <>
      <div className="min-h-screen relative overflow-hidden">
        {/* Background with parallax */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-purple-900/98 via-blue-900/98 to-indigo-900/98"
          style={{ y: parallaxY }}
        />
        
        {/* Additional overlay for better contrast */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Main Content */}
        <div className="relative min-h-screen overflow-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="container mx-auto px-4 py-8 pb-20"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center mb-12">
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
                  Explore Ladakh
                </h1>
                <p className="text-xl text-white/90 mb-8 drop-shadow-lg font-medium">
                  Discover the Land of High Passes
                </p>
                
                {/* Tab Navigation */}
                <div className="flex justify-center mb-0">
                  <OptimizedGlass intensity="heavy" className="p-3 inline-flex rounded-xl bg-black/30 border border-white/20">
                    <button
                      onClick={() => handleTabChange('destinations')}
                      className={`px-6 py-3 rounded-lg transition-all duration-300 font-semibold ${
                        activeTab === 'destinations'
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      Destinations
                    </button>
                    <button
                      onClick={() => handleTabChange('experiences')}
                      className={`px-6 py-3 rounded-lg transition-all duration-300 font-semibold ${
                        activeTab === 'experiences'
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      Experiences
                    </button>
                    <button
                      onClick={() => handleTabChange('bike-tours')}
                      className={`px-6 py-3 rounded-lg transition-all duration-300 font-semibold ${
                        activeTab === 'bike-tours'
                          ? 'bg-orange-600 text-white shadow-lg'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      🏍️ Bike Tours
                    </button>
                  </OptimizedGlass>
                </div>
              </div>
            </motion.div>

            {/* Content Grid */}
            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
            >
              {activeTab === 'destinations' && (
                loadingDestinations ? (
                  <div className="col-span-full flex justify-center items-center py-12">
                    <OptimizedGlass intensity="medium" className="p-8 rounded-xl bg-black/30 border border-white/20">
                      <div className="text-white text-lg font-medium">Loading destinations...</div>
                    </OptimizedGlass>
                  </div>
                ) : (
                  destinations.map(destination => (
                    <DestinationCard
                      key={destination.id}
                      destination={destination}
                      onSelect={handleDestinationSelect}
                    />
                  ))
                )
              )}
              {activeTab === 'experiences' && (
                loadingExperiences ? (
                  <div className="col-span-full flex justify-center items-center py-12">
                    <OptimizedGlass intensity="medium" className="p-8 rounded-xl bg-black/30 border border-white/20">
                      <div className="text-white text-lg font-medium">Loading experiences...</div>
                    </OptimizedGlass>
                  </div>
                ) : (
                  experiences.map(experience => (
                    <ExperienceCard
                      key={experience.id}
                      experience={experience}
                      onBook={handleExperienceBook}
                    />
                  ))
                )
              )}
              {activeTab === 'bike-tours' && (
                loadingTours ? (
                  <div className="col-span-full flex justify-center items-center py-12">
                    <OptimizedGlass intensity="medium" className="p-8 rounded-xl bg-black/30 border border-white/20">
                      <div className="text-white text-lg font-medium">Loading bike tours...</div>
                    </OptimizedGlass>
                  </div>
                ) : (
                  bikeTours.map(tour => (
                    <BikeTourCard
                      key={tour.id}
                      tour={tour}
                      onBook={handleBikeTourBook}
                    />
                  ))
                )
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Universal Modal for Destination Details */}
      <UniversalModal
        type="custom"
        isOpen={!!selectedDestination}
        onClose={handleCloseModal}
        size="large"
        customContent={
          selectedDestination && (
            <div className="p-8">
              <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
                <OptimizedImage
                  src={selectedDestination.image}
                  alt={selectedDestination.name}
                  className="w-full h-full object-cover"
                  enableMotion={true}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h2 className="text-3xl font-bold mb-2">{selectedDestination.name}</h2>
                  <p className="text-lg text-purple-200">{selectedDestination.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Quick Facts</h3>
                  <div className="space-y-3 text-gray-300">
                    <div className="flex justify-between">
                      <span>Altitude:</span>
                      <span className="text-white">{selectedDestination.altitude}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Distance from Leh:</span>
                      <span className="text-white">{selectedDestination.distance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Best Time:</span>
                      <span className="text-white">{selectedDestination.bestTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Difficulty:</span>
                      <span className={`font-medium ${
                        selectedDestination.difficulty === 'Easy' ? 'text-green-400' :
                        selectedDestination.difficulty === 'Moderate' ? 'text-yellow-400' : 'text-red-400'
                      }`}>{selectedDestination.difficulty}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Highlights</h3>
                  <ul className="space-y-2">
                    {selectedDestination.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-center text-gray-300">
                        <Star className="w-4 h-4 text-purple-400 mr-2" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Button
                  onClick={() => {
                    // TODO: Implement destination booking modal
                    console.log('Destination booking not implemented yet');
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3"
                >
                  Book This Destination
                </Button>
              </div>
            </div>
          )
        }
      />

      {/* Universal Modal for Bike Tour Details */}
      <UniversalModal
        type="custom"
        isOpen={!!selectedBikeTour}
        onClose={handleCloseModal}
        size="large"
        customContent={
          selectedBikeTour && (
            <div className="relative max-h-[85vh] flex flex-col bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-purple-900/95 rounded-xl overflow-hidden">
              {/* Hero Section - Reduced Height */}
              <div className="relative h-48 flex-shrink-0 overflow-hidden">
                <OptimizedImage
                  src={selectedBikeTour.image}
                  alt={selectedBikeTour.name}
                  className="w-full h-full object-cover"
                  enableMotion={true}
                />
                {/* Strong overlay for better contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
                
                {/* Main content overlay */}
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 max-w-2xl">
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight drop-shadow-2xl">
                        {selectedBikeTour.name}
                      </h2>
                      <p className="text-white/95 text-sm md:text-base leading-relaxed drop-shadow-xl line-clamp-2">
                        {selectedBikeTour.description}
                      </p>
                    </div>
                    <div className="ml-4 flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-xl border border-white/30 ${
                        selectedBikeTour.difficulty === 'Intermediate' ? 'bg-yellow-500/90 text-yellow-50' :
                        selectedBikeTour.difficulty === 'Advanced' ? 'bg-orange-500/90 text-orange-50' :
                        'bg-red-500/90 text-red-50'
                      }`}>
                        {selectedBikeTour.difficulty}
                      </span>
                      <div className="flex items-center bg-black/50 backdrop-blur-md border border-yellow-400/50 rounded-full px-3 py-1 shadow-xl">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-white font-bold text-sm">{selectedBikeTour.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom stats - Compact */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-black/60 backdrop-blur-md border border-white/30 rounded-lg p-2 text-center shadow-xl">
                      <Clock className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                      <p className="text-white font-bold text-xs">{selectedBikeTour.duration}</p>
                    </div>
                    <div className="bg-black/60 backdrop-blur-md border border-white/30 rounded-lg p-2 text-center shadow-xl">
                      <MapPin className="w-4 h-4 text-green-400 mx-auto mb-1" />
                      <p className="text-white font-bold text-xs">{selectedBikeTour.region || 'Ladakh'}</p>
                    </div>
                    <div className="bg-black/60 backdrop-blur-md border border-white/30 rounded-lg p-2 text-center shadow-xl">
                      <Mountain className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                      <p className="text-white font-bold text-xs">{selectedBikeTour.route}</p>
                    </div>
                    <div className="bg-gradient-to-r from-orange-600/90 to-red-600/90 backdrop-blur-md border border-orange-400/50 rounded-lg p-2 text-center shadow-xl">
                      <span className="text-lg font-bold text-white block">₹</span>
                      <p className="text-white font-bold text-xs">₹{(selectedBikeTour.price || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Highlights Card */}
                  <div className="bg-black/40 backdrop-blur-md border border-white/30 rounded-xl p-4 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center drop-shadow-lg">
                      <Camera className="w-4 h-4 text-orange-400 mr-2" />
                      Tour Highlights
                    </h3>
                    <div className="space-y-2">
                      {selectedBikeTour.highlights.map((highlight, index) => (
                        <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 shadow-lg">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mr-2 shadow-md"></div>
                            <span className="text-white font-medium text-sm drop-shadow-md">{highlight}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Package Includes Card */}
                  <div className="bg-black/40 backdrop-blur-md border border-white/30 rounded-xl p-4 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-3 drop-shadow-lg">Package Includes</h3>
                    <div className="space-y-2">
                      {selectedBikeTour.includes.map((item, index) => (
                        <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 shadow-lg">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mr-2 shadow-md"></div>
                            <span className="text-white font-medium text-sm drop-shadow-md">{item}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Itinerary Section */}
                {selectedBikeTour.itinerary && selectedBikeTour.itinerary.length > 0 && (
                  <div className="bg-black/40 backdrop-blur-md border border-white/30 rounded-xl p-4 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white drop-shadow-lg">Day-by-Day Itinerary</h3>
                      <button
                        onClick={() => setShowItinerary(!showItinerary)}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 rounded-lg px-4 py-2 text-white font-bold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl text-sm"
                      >
                        <span>{showItinerary ? 'Hide Details' : 'View Details'}</span>
                        <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${showItinerary ? 'rotate-90' : ''}`} />
                      </button>
                    </div>
                    
                    <div className="text-center mb-4">
                      <span className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold border border-blue-400/50 shadow-xl">
                        {selectedBikeTour.itinerary.length} Days Epic Journey
                      </span>
                    </div>

                    {showItinerary && (
                      <div className="space-y-3 mt-4 max-h-60 overflow-y-auto scrollbar-hide">
                        {selectedBikeTour.itinerary.map((day, index) => (
                          <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/15 transition-all duration-200 shadow-lg">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-xl border border-orange-400/50">
                                <span className="text-white font-bold text-sm drop-shadow-lg">{day.day}</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-base font-bold text-white mb-1 drop-shadow-md">{day.title}</h4>
                                <p className="text-white/90 mb-2 leading-relaxed drop-shadow-sm text-sm line-clamp-2">{day.description}</p>
                                
                                {day.activities && day.activities.length > 0 && (
                                  <div className="mb-2">
                                    <div className="flex flex-wrap gap-1">
                                      {day.activities.slice(0, 2).map((activity, actIndex) => (
                                        <span key={actIndex} className="bg-orange-500/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs border border-orange-400/50 font-medium shadow-md">
                                          {activity}
                                        </span>
                                      ))}
                                      {day.activities.length > 2 && (
                                        <span className="bg-gray-500/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs border border-gray-400/50 font-medium shadow-md">
                                          +{day.activities.length - 2} more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  {day.accommodation && (
                                    <div className="bg-white/10 backdrop-blur-sm rounded p-2 border border-white/20 shadow-md">
                                      <span className="text-blue-300 text-xs uppercase tracking-wide font-bold block">Stay</span>
                                      <p className="text-white font-medium drop-shadow-sm">{day.accommodation}</p>
                                    </div>
                                  )}
                                  {day.distance && (
                                    <div className="bg-white/10 backdrop-blur-sm rounded p-2 border border-white/20 shadow-md">
                                      <span className="text-green-300 text-xs uppercase tracking-wide font-bold block">Distance</span>
                                      <p className="text-white font-medium drop-shadow-sm">{day.distance}</p>
                                    </div>
                                  )}
                                  {day.altitude && (
                                    <div className="bg-white/10 backdrop-blur-sm rounded p-2 border border-white/20 shadow-md">
                                      <span className="text-purple-300 text-xs uppercase tracking-wide font-bold block">Altitude</span>
                                      <p className="text-white font-medium drop-shadow-sm">{day.altitude}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Book Tour Button */}
                <div className="mt-6">
                  <Button
                    onClick={() => setShowBikeTourBookingModal(true)}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 px-6 text-lg rounded-xl shadow-2xl transition-all duration-200 hover:scale-105 border-2 border-orange-400/50"
                  >
                    🏍️ Book This Adventure - ₹{(selectedBikeTour.price || 0).toLocaleString()}
                  </Button>
                </div>
              </div>
            </div>
          )
        }
      />

      {/* Experience Booking Modal */}
      <ExperienceBookingModal
        experience={selectedExperience}
        isOpen={showExperienceBookingModal}
        onClose={() => {
          setShowExperienceBookingModal(false);
          setSelectedExperience(null);
        }}
      />

      {/* Bike Tour Booking Modal */}
      <BikeTourBookingModal
        bikeTour={selectedBikeTour}
        isOpen={showBikeTourBookingModal}
        onClose={() => {
          setShowBikeTourBookingModal(false);
          setSelectedBikeTour(null);
        }}
      />
    </>
  );
});

ExploreLadakh.displayName = 'ExploreLadakh';

export default ExploreLadakh;
