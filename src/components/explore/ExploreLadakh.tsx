import React, { useState, useMemo, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Mountain, 
  Camera, 
  MapPin, 
  Star, 
  Clock, 
  Thermometer,
  Wind,
  Sun,
  Moon,
  Calendar,
  Users,
  Heart,
  Play,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  Route,
  Navigation
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { ExperienceBookingModal } from '../booking/ExperienceBookingModal';
import { BikeTourCard } from '../tours/BikeTourCard';
import { bikeTourPlans } from '../../data/mockData';
import { PerformanceMonitor } from '../../utils/performanceMonitor';

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
  detailedInfo: {
    overview: string;
    howToReach: string;
    thingsToDo: string[];
    accommodation: string;
    tips: string[];
    videoUrl: string;
  };
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
}

const destinations: Destination[] = [
  {
    id: 'pangong',
    name: 'Pangong Tso',
    description: 'A high-altitude lake that changes colors throughout the day, stretching across India and China.',
    image: 'https://images.pexels.com/photos/1049298/pexels-photo-1049298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    altitude: '4,350m',
    bestTime: 'May - September',
    difficulty: 'Moderate',
    highlights: ['Color-changing waters', 'Bollywood filming location', 'Camping under stars'],
    distance: '160km from Leh',
    detailedInfo: {
      overview: 'Pangong Tso, meaning "high grassland lake" in Tibetan, is one of the most spectacular high-altitude lakes in the world. Stretching 134 km long, with two-thirds lying in Tibet, this brackish water lake is famous for its ever-changing hues from azure blue to light blue to green and grey.',
      howToReach: 'Drive from Leh via Chang La Pass (5,360m). The journey takes 5-6 hours through some of the most scenic mountain roads. Road conditions can be challenging, especially during monsoon.',
      thingsToDo: ['Photography at different times of day', 'Camping by the lakeside', 'Visit nearby Spangmik village', 'Explore the Indo-China border area', 'Sunrise and sunset viewing'],
      accommodation: 'Luxury camps, guesthouses in Spangmik village, and basic camping facilities available. Book in advance during peak season.',
      tips: ['Carry warm clothes even in summer', 'Respect the fragile ecosystem', 'Carry sufficient water and snacks', 'Check weather conditions before travel', 'Permits required for certain areas'],
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    }
  },
  {
    id: 'nubra',
    name: 'Nubra Valley',
    description: 'The valley of flowers with sand dunes, double-humped camels, and ancient monasteries.',
    image: 'https://images.pexels.com/photos/2325446/pexels-photo-2325446.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    altitude: '3,048m',
    bestTime: 'April - October',
    difficulty: 'Easy',
    highlights: ['Bactrian camels', 'Sand dunes', 'Diskit Monastery'],
    distance: '120km from Leh',
    detailedInfo: {
      overview: 'Nubra Valley, known as the "Valley of Flowers," is a tri-armed valley located north of Leh. Famous for its sand dunes, double-humped Bactrian camels, and ancient monasteries, it offers a unique desert experience in the high Himalayas.',
      howToReach: 'Accessible via Khardung La Pass, one of the highest motorable roads in the world. The drive from Leh takes 4-5 hours with spectacular mountain views.',
      thingsToDo: ['Camel safari on sand dunes', 'Visit Diskit and Sumur monasteries', 'Explore Hunder village', 'Hot springs at Panamik', 'Trekking in Siachen base camp area'],
      accommodation: 'Desert camps, guesthouses, and luxury resorts available in Hunder and Diskit. Camping under stars is a popular option.',
      tips: ['Best visited between April-October', 'Carry layers for temperature variations', 'Book camel rides in advance', 'Respect local customs at monasteries', 'Stay hydrated at high altitude'],
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    }
  },
  {
    id: 'khardungla',
    name: 'Khardung La Pass',
    description: 'One of the highest motorable passes in the world, gateway to Nubra Valley.',
    image: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    altitude: '5,359m',
    bestTime: 'May - October',
    difficulty: 'Challenging',
    highlights: ['Highest motorable road', 'Panoramic views', 'Adventure milestone'],
    distance: '39km from Leh',
    detailedInfo: {
      overview: 'Khardung La Pass, at 5,359 meters, is famously known as the "Gateway to Nubra Valley" and one of the highest motorable passes in the world. The pass offers breathtaking panoramic views of the surrounding peaks and valleys.',
      howToReach: 'Well-maintained road from Leh, taking about 1.5-2 hours. The road is generally open from May to October, weather permitting.',
      thingsToDo: ['Photography at the famous signboard', 'Panoramic mountain views', 'Visit the small cafe at the top', 'Acclimatization stop for Nubra Valley', 'Adventure biking milestone'],
      accommodation: 'No accommodation at the pass itself. Stay in Leh or continue to Nubra Valley for overnight stays.',
      tips: ['Spend minimal time due to altitude', 'Carry warm clothes and oxygen if needed', 'Check weather conditions', 'Avoid overexertion', 'Best visited early morning for clear views'],
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    }
  },
  {
    id: 'tso-moriri',
    name: 'Tso Moriri',
    description: 'A pristine high-altitude lake surrounded by barren mountains and wildlife.',
    image: 'https://images.pexels.com/photos/2325446/pexels-photo-2325446.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    altitude: '4,522m',
    bestTime: 'June - September',
    difficulty: 'Moderate',
    highlights: ['Pristine wilderness', 'Wildlife sanctuary', 'Nomadic culture'],
    distance: '240km from Leh',
    detailedInfo: {
      overview: 'Tso Moriri, meaning "Mountain Lake," is a pristine high-altitude lake in the Changthang plateau. Part of the Tso Moriri Wetland Conservation Reserve, it\'s home to diverse wildlife including the rare black-necked cranes.',
      howToReach: 'Drive from Leh via Chumathang and Sumdo. The journey takes 6-7 hours through remote mountain terrain. Road conditions can be challenging.',
      thingsToDo: ['Wildlife photography', 'Bird watching (black-necked cranes)', 'Visit Korzok village and monastery', 'Interact with Changpa nomads', 'Camping by the lake'],
      accommodation: 'Basic guesthouses in Korzok village, camping sites by the lake. Limited facilities, so carry essentials.',
      tips: ['Permits required for the area', 'Carry warm clothes and sleeping bags', 'Respect wildlife and environment', 'Limited medical facilities', 'Best for experienced travelers'],
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    }
  },
  {
    id: 'umling-la',
    name: 'Umling La Pass',
    description: 'The world\'s highest motorable pass, a testament to human engineering at extreme altitude.',
    image: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    altitude: '5,798m',
    bestTime: 'June - September',
    difficulty: 'Challenging',
    highlights: ['World\'s highest motorable pass', 'Extreme altitude adventure', 'Engineering marvel'],
    distance: '230km from Leh',
    detailedInfo: {
      overview: 'Umling La Pass, at 5,798 meters, holds the Guinness World Record as the world\'s highest motorable pass. Located in the Demchok sector, this pass represents the pinnacle of high-altitude motoring adventure.',
      howToReach: 'Accessible via Hanle and Demchok route. The journey requires special permits and is extremely challenging due to altitude and terrain. Only for experienced high-altitude travelers.',
      thingsToDo: ['World record achievement', 'Extreme altitude photography', 'Visit border areas (with permits)', 'Experience ultimate adventure challenge', 'Witness engineering marvel'],
      accommodation: 'No accommodation at the pass. Stay in Hanle or return to Leh same day. Camping possible but extremely challenging due to altitude.',
      tips: ['Special permits mandatory', 'Carry oxygen and medical kit', 'Travel with experienced guides only', 'Check weather and road conditions', 'Not recommended for first-time visitors'],
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    }
  },
  {
    id: 'hanle',
    name: 'Hanle',
    description: 'A remote village famous for its astronomical observatory and pristine dark skies.',
    image: 'https://images.pexels.com/photos/1049298/pexels-photo-1049298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    altitude: '4,500m',
    bestTime: 'May - October',
    difficulty: 'Moderate',
    highlights: ['Indian Astronomical Observatory', 'Dark sky sanctuary', 'Remote border village'],
    distance: '255km from Leh',
    detailedInfo: {
      overview: 'Hanle is a remote village in eastern Ladakh, home to the Indian Astronomical Observatory. Known for having one of the world\'s clearest skies, it offers unparalleled stargazing opportunities and insights into cutting-edge astronomy.',
      howToReach: 'Drive from Leh via Chumathang and Loma. The journey takes 6-7 hours through remote terrain. Road conditions vary, and permits are required.',
      thingsToDo: ['Visit the Astronomical Observatory', 'Stargazing and astrophotography', 'Explore Hanle Monastery', 'Experience remote village life', 'Photography of pristine landscapes'],
      accommodation: 'Basic guesthouses and homestays in the village. Camping is possible but challenging due to altitude and weather conditions.',
      tips: ['Inner Line Permits required', 'Carry warm clothes for night temperatures', 'Best for astronomy enthusiasts', 'Limited connectivity and facilities', 'Respect local customs and environment'],
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    }
  }
];

const experiences: Experience[] = [
  {
    id: 'monastery-tour',
    title: 'Ancient Monasteries Trail',
    description: 'Spiritual journey through centuries-old Buddhist monasteries and meditation centers.',
    image: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=600',
    duration: '3 days',
    price: 8500,
    rating: 4.7,
    category: 'Spiritual'
  },
  {
    id: 'photography-workshop',
    title: 'Himalayan Photography Workshop',
    description: 'Capture the raw beauty of Ladakh with professional photography guidance.',
    image: 'https://images.pexels.com/photos/1049298/pexels-photo-1049298.jpeg?auto=compress&cs=tinysrgb&w=600',
    duration: '5 days',
    price: 18000,
    rating: 4.8,
    category: 'Photography'
  },
  {
    id: 'cultural-immersion',
    title: 'Ladakhi Cultural Immersion',
    description: 'Live with local families, learn traditional crafts, and experience authentic culture.',
    image: 'https://images.pexels.com/photos/2325446/pexels-photo-2325446.jpeg?auto=compress&cs=tinysrgb&w=600',
    duration: '4 days',
    price: 12000,
    rating: 4.6,
    category: 'Cultural'
  }
];

// Performance-optimized image component with lazy loading
const OptimizedImage = React.memo(({ src, alt, className, ...props }: {
  src: string;
  alt: string;
  className?: string;
  [key: string]: any;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  if (hasError) {
    return (
      <div className={`${className} bg-gray-800 flex items-center justify-center`}>
        <Mountain className="w-12 h-12 text-gray-600" />
      </div>
    );
  }

  return (
    <div className="relative">
      {!isLoaded && (
        <div className={`${className} bg-gray-800 animate-pulse flex items-center justify-center absolute inset-0`}>
          <Mountain className="w-12 h-12 text-gray-600" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        {...props}
      />
    </div>
  );
});

export function ExploreLadakh() {
  const { state } = useApp();
  const { requireAuth } = useAuth();
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [expandedDestination, setExpandedDestination] = useState<string | null>(null);
  const [activeExperienceFilter, setActiveExperienceFilter] = useState<string>('All');
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -50]);

  // Memoize bike tours for performance
  const memoizedBikeTours = useMemo(() => {
    PerformanceMonitor.startProfile('memoize-bike-tours');
    const result = bikeTourPlans;
    PerformanceMonitor.endProfile('memoize-bike-tours');
    return result;
  }, []);

  // Performance monitoring
  React.useEffect(() => {
    PerformanceMonitor.startProfile('ExploreLadakh-render');
    return () => {
      PerformanceMonitor.endProfile('ExploreLadakh-render');
    };
  });

  // Memoize filtered experiences for performance
  const filteredExperiences = useMemo(() => {
    PerformanceMonitor.startProfile('filter-experiences');
    const result = activeExperienceFilter === 'All' 
      ? experiences 
      : experiences.filter(exp => exp.category === activeExperienceFilter);
    PerformanceMonitor.endProfile('filter-experiences');
    return result;
  }, [activeExperienceFilter]);

  // Memoize difficulty color calculation
  const getDifficultyColor = useCallback((difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400';
      case 'Moderate': return 'text-yellow-400';
      case 'Challenging': return 'text-red-400';
      default: return 'text-white';
    }
  }, []);

  const handleBookExperience = useCallback((experience: Experience) => {
    requireAuth(() => {
      setSelectedExperience(experience);
      setShowBookingModal(true);
    });
  }, [requireAuth]);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ 
            y: y1,
            backgroundImage: 'url(https://images.pexels.com/photos/1049298/pexels-photo-1049298.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2)',
            filter: 'brightness(0.3)'
          }}
          className="absolute inset-0 bg-cover bg-center"
        />
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
              Explore
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent block">
                Ladakh
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 leading-relaxed">
              Land of High Passes • Where Earth Touches Sky • Adventure Awaits
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="group">
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Watch Journey
              </Button>
              <Button variant="glass" size="lg">
                <Navigation className="w-5 h-5 mr-2" />
                Plan Your Trip
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Floating Stats */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2 }}
          className="absolute left-6 bottom-20 hidden lg:block"
        >
          <GlassCard className="p-4">
            <div className="flex items-center gap-3 text-white">
              <Mountain className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold">3,524m</p>
                <p className="text-sm text-white/70">Average Altitude</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.4 }}
          className="absolute right-6 bottom-20 hidden lg:block"
        >
          <GlassCard className="p-4">
            <div className="flex items-center gap-3 text-white">
              <Thermometer className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold">-20°C</p>
                <p className="text-sm text-white/70">Winter Low</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* Weather & Best Time */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              When to Visit
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Ladakh's extreme climate creates distinct seasons, each offering unique experiences
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                season: 'Summer',
                months: 'May - September',
                icon: Sun,
                temp: '15°C - 30°C',
                description: 'Perfect for road trips and trekking',
                color: 'from-yellow-400 to-orange-500'
              },
              {
                season: 'Autumn',
                months: 'October - November',
                icon: Wind,
                temp: '5°C - 20°C',
                description: 'Clear skies and golden landscapes',
                color: 'from-orange-400 to-red-500'
              },
              {
                season: 'Winter',
                months: 'December - February',
                icon: Moon,
                temp: '-20°C - 5°C',
                description: 'Frozen rivers and snow adventures',
                color: 'from-blue-400 to-purple-500'
              },
              {
                season: 'Spring',
                months: 'March - April',
                icon: Mountain,
                temp: '0°C - 15°C',
                description: 'Melting snow and blooming valleys',
                color: 'from-green-400 to-blue-500'
              }
            ].map((season, index) => (
              <motion.div
                key={season.season}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-6 text-center group hover:scale-105 transition-transform duration-300">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${season.color} mx-auto mb-4 flex items-center justify-center`}>
                    <season.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{season.season}</h3>
                  <p className="text-white/60 text-sm mb-3">{season.months}</p>
                  <p className="text-white font-medium mb-3">{season.temp}</p>
                  <p className="text-white/80 text-sm">{season.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Destinations */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Must-Visit Destinations
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              From pristine lakes to ancient monasteries, discover Ladakh's most breathtaking locations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {destinations.map((destination, index) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <GlassCard className="overflow-hidden group cursor-pointer">
                  <div className="relative h-64 overflow-hidden">
                    <OptimizedImage
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    <div className="absolute top-4 right-4 flex gap-2">
                      <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1">
                        <span className="text-white text-sm font-medium">{destination.altitude}</span>
                      </div>
                      <div className={`bg-white/20 backdrop-blur-md rounded-full px-3 py-1`}>
                        <span className={`text-sm font-medium ${getDifficultyColor(destination.difficulty)}`}>
                          {destination.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-bold text-white mb-2">{destination.name}</h3>
                      <div className="flex items-center gap-2 text-white/80 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{destination.distance}</span>
                        <Clock className="w-4 h-4 ml-2" />
                        <span>{destination.bestTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-white/80 mb-4 leading-relaxed">{destination.description}</p>
                    
                    <div className="mb-4">
                      <h4 className="text-white font-medium mb-2">Highlights:</h4>
                      <div className="flex flex-wrap gap-2">
                        {destination.highlights.map((highlight, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Button 
                      variant="glass" 
                      className="w-full group"
                      onClick={() => setSelectedDestination(destination)}
                    >
                      Explore {destination.name}
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Experiences */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Curated Experiences
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Handpicked adventures that showcase the best of Ladakh's culture, spirituality, and natural beauty
            </p>
          </motion.div>

          {/* Experience Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {['All', 'Adventure', 'Cultural', 'Spiritual', 'Photography'].map((filter) => (
              <Button
                key={filter}
                variant={activeExperienceFilter === filter ? 'primary' : 'glass'}
                size="sm"
                onClick={() => setActiveExperienceFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredExperiences.map((experience, index) => (
              <motion.div
                key={experience.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="overflow-hidden group">
                  <div className="relative h-48 overflow-hidden">
                    <OptimizedImage
                      src={experience.image}
                      alt={experience.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {experience.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white font-medium text-sm">{experience.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-white">{experience.title}</h3>
                      <span className="text-2xl font-bold text-white">₹{experience.price.toLocaleString()}</span>
                    </div>

                    <p className="text-white/80 mb-4 leading-relaxed">{experience.description}</p>

                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2 text-white/60">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{experience.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/60">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">Group Experience</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        className="flex-1"
                        onClick={() => handleBookExperience(experience)}
                      >
                        Book Experience
                      </Button>
                      <Button variant="glass" size="md">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bike Tour Plans Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Bike Tour 
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                {" "}Plans
              </span>
            </h2>
            <p className="text-white/80 text-lg max-w-3xl mx-auto leading-relaxed">
              Experience the ultimate motorcycle adventure through the Himalayas with our carefully crafted tour plans.
              From short circuits to grand expeditions, find the perfect ride for your skill level.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {memoizedBikeTours.map((tour, index) => (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <BikeTourCard tour={tour} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <GlassCard className="p-12 max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready for Your
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
                  Ladakh Adventure?
                </span>
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                From the moment you arrive in Leh to your final sunset at Pangong Lake, 
                we'll ensure your Himalayan journey is nothing short of extraordinary.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="group">
                  <Calendar className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Plan Your Journey
                </Button>
                <Button variant="glass" size="lg">
                  <Camera className="w-5 h-5 mr-2" />
                  View Gallery
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Experience Booking Modal */}
      <ExperienceBookingModal
        experience={selectedExperience}
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedExperience(null);
        }}
      />
    </div>
  );
}