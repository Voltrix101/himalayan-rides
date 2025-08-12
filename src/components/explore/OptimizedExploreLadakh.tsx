import { memo, useState, useCallback } from 'react';
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
import { useOptimizedScroll } from '../../hooks/useOptimizedScroll';

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

interface Experience {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  price: number;
  rating: number;
  category: 'Adventure' | 'Cultural' | 'Spiritual' | 'Photography';
  highlights: string[];
}

interface BikeTour {
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
}

// Performance-optimized data
const destinations: Destination[] = [
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

const experiences: Experience[] = [
  {
    id: 'monastery-tour',
    title: 'Ancient Monasteries Tour',
    description: 'Explore centuries-old Buddhist monasteries and immerse in spiritual culture.',
    image: 'https://images.pexels.com/photos/6176940/pexels-photo-6176940.jpeg?auto=compress&cs=tinysrgb&w=600',
    duration: '2 Days',
    price: 8000,
    rating: 4.5,
    category: 'Cultural',
    highlights: ['Hemis Monastery', 'Thiksey Monastery', 'Cultural immersion']
  },
  {
    id: 'photography-expedition',
    title: 'Ladakh Photography Expedition',
    description: 'Capture the raw beauty of Ladakh with professional photography guidance.',
    image: 'https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg?auto=compress&cs=tinysrgb&w=600',
    duration: '5 Days',
    price: 25000,
    rating: 4.8,
    category: 'Photography',
    highlights: ['Golden hour shots', 'Landscape photography', 'Expert guidance']
  }
];

const bikeTours: BikeTour[] = [
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
        intensity="medium" 
        className="overflow-hidden hover:ring-2 hover:ring-purple-400/50 transition-all duration-300"
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

          {/* Price */}
          <div className="absolute bottom-4 right-4">
            <span className="text-white font-bold text-lg">₹{destination.price.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-2">{destination.name}</h3>
          <p className="text-gray-300 text-sm mb-4 line-clamp-2">{destination.description}</p>
          
          <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
            <div className="flex items-center">
              <Mountain className="w-4 h-4 mr-1" />
              <span>{destination.altitude}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{destination.distance}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-purple-300 text-sm">{destination.bestTime}</span>
            <ChevronRight className="w-5 h-5 text-purple-400" />
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
      <OptimizedGlass intensity="medium" className="overflow-hidden">
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

        <div className="p-4">
          <h4 className="text-lg font-bold text-white mb-2">{experience.title}</h4>
          <p className="text-gray-300 text-sm mb-3 line-clamp-2">{experience.description}</p>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-sm text-gray-400">
              <Clock className="w-4 h-4 mr-1" />
              <span>{experience.duration}</span>
            </div>
            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
              {experience.category}
            </span>
          </div>

          <Button
            onClick={handleBook}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
  tour: BikeTour;
  onBook: (tour: BikeTour) => void;
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
      <OptimizedGlass intensity="medium" className="overflow-hidden">
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
            <span className="text-white font-bold text-lg">₹{tour.price.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-4">
          <h4 className="text-lg font-bold text-white mb-2">{tour.name}</h4>
          <p className="text-gray-300 text-sm mb-3 line-clamp-2">{tour.description}</p>
          
          <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{tour.duration}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{tour.distance}</span>
            </div>
          </div>

          {/* Highlights */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {tour.highlights.slice(0, 3).map((highlight, index) => (
                <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                  {highlight}
                </span>
              ))}
              {tour.highlights.length > 3 && (
                <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded">
                  +{tour.highlights.length - 3} more
                </span>
              )}
            </div>
          </div>

          <Button
            onClick={handleBook}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
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
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [selectedBikeTour, setSelectedBikeTour] = useState<BikeTour | null>(null);
  const [activeTab, setActiveTab] = useState<'destinations' | 'experiences' | 'bike-tours'>('destinations');

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
    setShowBookingModal(true);
  }, []);

  const handleBikeTourBook = useCallback((tour: BikeTour) => {
    setSelectedBikeTour(tour);
    // Only show the tour details modal, not the booking modal
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedDestination(null);
    setShowBookingModal(false);
    setSelectedExperience(null);
    setSelectedBikeTour(null);
  }, []);

  const handleTabChange = useCallback((tab: 'destinations' | 'experiences' | 'bike-tours') => {
    setActiveTab(tab);
  }, []);

  return (
    <>
      <div className="min-h-screen relative overflow-hidden">
        {/* Background with parallax */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-indigo-900/95"
          style={{ y: parallaxY }}
        />
        
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
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                Explore Ladakh
              </h1>
              <p className="text-xl text-purple-200 mb-8">
                Discover the Land of High Passes
              </p>
              
              {/* Tab Navigation */}
              <div className="flex justify-center mb-8">
                <OptimizedGlass intensity="medium" className="p-2 inline-flex rounded-lg">
                  <button
                    onClick={() => handleTabChange('destinations')}
                    className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                      activeTab === 'destinations'
                        ? 'bg-purple-600 text-white'
                        : 'text-purple-200 hover:text-white'
                    }`}
                  >
                    Destinations
                  </button>
                  <button
                    onClick={() => handleTabChange('experiences')}
                    className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                      activeTab === 'experiences'
                        ? 'bg-purple-600 text-white'
                        : 'text-purple-200 hover:text-white'
                    }`}
                  >
                    Experiences
                  </button>
                  <button
                    onClick={() => handleTabChange('bike-tours')}
                    className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                      activeTab === 'bike-tours'
                        ? 'bg-orange-600 text-white'
                        : 'text-orange-200 hover:text-white'
                    }`}
                  >
                    🏍️ Bike Tours
                  </button>
                </OptimizedGlass>
              </div>
            </motion.div>

            {/* Content Grid */}
            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
            >
              {activeTab === 'destinations' && destinations.map(destination => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  onSelect={handleDestinationSelect}
                />
              ))}
              {activeTab === 'experiences' && experiences.map(experience => (
                <ExperienceCard
                  key={experience.id}
                  experience={experience}
                  onBook={handleExperienceBook}
                />
              ))}
              {activeTab === 'bike-tours' && bikeTours.map(tour => (
                <BikeTourCard
                  key={tour.id}
                  tour={tour}
                  onBook={handleBikeTourBook}
                />
              ))}
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
                    setShowBookingModal(true);
                    setSelectedDestination(null);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3"
                >
                  Book This Destination - ₹{selectedDestination.price.toLocaleString()}
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
            <div className="p-8">
              <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
                <OptimizedImage
                  src={selectedBikeTour.image}
                  alt={selectedBikeTour.name}
                  className="w-full h-full object-cover"
                  enableMotion={true}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h2 className="text-3xl font-bold mb-2">{selectedBikeTour.name}</h2>
                  <p className="text-lg text-orange-200">{selectedBikeTour.description}</p>
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedBikeTour.difficulty === 'Intermediate' ? 'text-yellow-400 bg-yellow-400/20' :
                    selectedBikeTour.difficulty === 'Advanced' ? 'text-orange-400 bg-orange-400/20' :
                    'text-red-400 bg-red-400/20'
                  }`}>
                    {selectedBikeTour.difficulty}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Tour Details</h3>
                  <div className="space-y-3 text-gray-300">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="text-white">{selectedBikeTour.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Distance:</span>
                      <span className="text-white">{selectedBikeTour.distance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Difficulty:</span>
                      <span className={`font-medium ${
                        selectedBikeTour.difficulty === 'Intermediate' ? 'text-yellow-400' :
                        selectedBikeTour.difficulty === 'Advanced' ? 'text-orange-400' : 'text-red-400'
                      }`}>{selectedBikeTour.difficulty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rating:</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-white">{selectedBikeTour.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-white mb-3">Route</h4>
                    <p className="text-gray-300 bg-white/5 p-3 rounded-lg text-sm">
                      {selectedBikeTour.route}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Highlights</h3>
                  <ul className="space-y-2 mb-6">
                    {selectedBikeTour.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-center text-gray-300">
                        <Camera className="w-4 h-4 text-orange-400 mr-2" />
                        {highlight}
                      </li>
                    ))}
                  </ul>

                  <h4 className="text-lg font-semibold text-white mb-3">Package Includes</h4>
                  <ul className="space-y-2">
                    {selectedBikeTour.includes.map((item, index) => (
                      <li key={index} className="flex items-center text-gray-300">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Button
                  onClick={() => {
                    setShowBookingModal(true);
                    setSelectedBikeTour(null);
                  }}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 px-8 py-3 text-lg font-bold"
                >
                  🏍️ Book This Tour - ₹{selectedBikeTour.price.toLocaleString()}
                </Button>
              </div>
            </div>
          )
        }
      />
    </>
  );
});

ExploreLadakh.displayName = 'ExploreLadakh';

export default ExploreLadakh;
