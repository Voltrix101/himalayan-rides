import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  where,
  DocumentData 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PerformanceMonitor } from '../../utils/performanceMonitor';
import { useOptimizedScroll } from '../../hooks/useOptimizedScroll';
import { LiquidGlass } from '../ui/LiquidGlass';
import { NeonText } from '../ui/NeonText';
import { FluidButton } from '../ui/FluidButton';
import { OptimizedImage } from '../ui/OptimizedImage';
import { 
  Mountain, 
  Calendar, 
  Users, 
  Star,
  MapPin,
  Clock,
  Flame,
  Zap
} from 'lucide-react';

interface LadakhTour {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  image: string;
  highlights: string[];
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  category: 'Adventure' | 'Cultural' | 'Spiritual' | 'Photography';
  rating: number;
  maxGroupSize: number;
  isPopular?: boolean;
  isNew?: boolean;
  createdAt: any;
  updatedAt: any;
}

// Optimized animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 60,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      mass: 0.8
    }
  }
};

const heroVariants = {
  hidden: { opacity: 0, scale: 1.1 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.2,
      ease: "easeOut" as const
    }
  }
};

// Background images for slideshow
const heroImages = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=2000&q=80'
];

export const ExploreLadakh = () => {
  const [tours, setTours] = useState<LadakhTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Optimized scroll with performance monitoring
  const { scrollY, parallaxY } = useOptimizedScroll({
    enableParallax: true,
    parallaxStrength: 0.3
  });

  // Hero slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Real-time Firebase data with performance optimization
  useEffect(() => {
    PerformanceMonitor.startProfile('ladakh-tours-fetch');
    
    const toursQuery = query(
      collection(db, 'ladakhTours'),
      orderBy('createdAt', 'desc'),
      limit(20) // Efficient limit for performance
    );

    const unsubscribe = onSnapshot(
      toursQuery,
      (snapshot) => {
        const tourData: LadakhTour[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as DocumentData;
          tourData.push({
            id: doc.id,
            ...data
          } as LadakhTour);
        });
        
        setTours(tourData);
        setLoading(false);
        PerformanceMonitor.endProfile('ladakh-tours-fetch');
      },
      (error) => {
        console.error('Error fetching Ladakh tours:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Optimized category filtering with useMemo
  const filteredTours = useMemo(() => {
    if (selectedCategory === 'All') return tours;
    return tours.filter(tour => tour.category === selectedCategory);
  }, [tours, selectedCategory]);

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(tours.map(tour => tour.category))];
    return cats;
  }, [tours]);

  // Optimized handlers
  const handleCategoryChange = useCallback((category: string) => {
    PerformanceMonitor.startProfile('category-filter');
    setSelectedCategory(category);
    PerformanceMonitor.endProfile('category-filter');
  }, []);

  const handleBookTour = useCallback((tour: LadakhTour) => {
    PerformanceMonitor.startProfile('tour-booking');
    // Booking logic here
    console.log('Booking tour:', tour.title);
    PerformanceMonitor.endProfile('tour-booking');
  }, []);

  // Optimized scroll transforms
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  const overlayOpacity = useTransform(scrollY, [0, 300], [0.3, 0.8]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <LiquidGlass className="p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
            <NeonText className="text-lg">Loading Ladakh Adventures...</NeonText>
          </div>
        </LiquidGlass>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden"
    >
      {/* Hero Section with Slideshow */}
      <motion.div 
        className="relative h-screen flex items-center justify-center"
        style={{ y: heroY }}
      >
        {/* Background Slideshow */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHeroIndex}
            variants={heroVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute inset-0"
          >
            <OptimizedImage
              src={heroImages[currentHeroIndex]}
              alt="Ladakh Landscape"
              className="w-full h-full object-cover"
              enableMotion={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Parallax Overlay */}
        <motion.div 
          className="absolute inset-0 bg-black/20"
          style={{ opacity: overlayOpacity }}
        />

        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          <NeonText 
            as="h1" 
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            Explore Ladakh
          </NeonText>
          
          <motion.p 
            className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Land of High Passes • Where Earth Touches Sky • Adventure Awaits
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <FluidButton
              onClick={() => containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              icon={<Mountain className="w-5 h-5" />}
            >
              Discover Tours
            </FluidButton>
            
            <FluidButton
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              icon={<MapPin className="w-5 h-5" />}
            >
              Plan Your Journey
            </FluidButton>
          </motion.div>
        </motion.div>

        {/* Slideshow Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHeroIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentHeroIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </motion.div>

      {/* Content Section */}
      <div className="relative z-10 px-4 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Category Filters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <LiquidGlass className="p-6">
              <div className="flex flex-wrap gap-3 justify-center">
                {categories.map((category) => (
                  <FluidButton
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    variant={selectedCategory === category ? 'primary' : 'outline'}
                    size="sm"
                    className={
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'border-white/20 text-white/80 hover:bg-white/10'
                    }
                  >
                    {category}
                  </FluidButton>
                ))}
              </div>
            </LiquidGlass>
          </motion.div>

          {/* Tours Grid */}
          {filteredTours.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <LiquidGlass className="p-12 max-w-md mx-auto">
                <Mountain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <NeonText className="text-2xl mb-4">No Tours Available</NeonText>
                <p className="text-white/70">
                  Check back soon for amazing Ladakh adventures!
                </p>
              </LiquidGlass>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredTours.map((tour) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  onBook={handleBookTour}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

// Optimized Tour Card Component
const TourCard = ({ tour, onBook }: { tour: LadakhTour; onBook: (tour: LadakhTour) => void }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-400/20';
      case 'Moderate': return 'text-yellow-400 bg-yellow-400/20';
      case 'Challenging': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <motion.div variants={cardVariants} className="h-full">
      <LiquidGlass className="h-full overflow-hidden group hover:scale-105 transition-transform duration-300">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          <OptimizedImage
            src={tour.image}
            alt={tour.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {tour.isNew && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-xs font-semibold text-white">
                <Zap className="w-3 h-3" />
                New
              </div>
            )}
            {tour.isPopular && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-xs font-semibold text-white">
                <Flame className="w-3 h-3" />
                Popular
              </div>
            )}
          </div>

          {/* Price Badge */}
          <div className="absolute top-4 right-4">
            <LiquidGlass className="px-3 py-1">
              <span className="text-white font-bold">₹{tour.price.toLocaleString()}</span>
            </LiquidGlass>
          </div>

          {/* Difficulty Badge */}
          <div className="absolute bottom-4 right-4">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tour.difficulty)}`}>
              {tour.difficulty}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
              {tour.title}
            </h3>
            <p className="text-white/70 text-sm line-clamp-3">
              {tour.description}
            </p>
          </div>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-sm text-white/60">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {tour.duration}
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              Max {tour.maxGroupSize}
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              {tour.rating}
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-purple-300">Highlights</h4>
            <div className="flex flex-wrap gap-2">
              {tour.highlights.slice(0, 3).map((highlight, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-400/30"
                >
                  {highlight}
                </span>
              ))}
              {tour.highlights.length > 3 && (
                <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-full">
                  +{tour.highlights.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Book Button */}
          <FluidButton
            onClick={() => onBook(tour)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            icon={<Calendar className="w-4 h-4" />}
          >
            Book Adventure
          </FluidButton>
        </div>
      </LiquidGlass>
    </motion.div>
  );
};
