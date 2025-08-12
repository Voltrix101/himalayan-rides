import { memo, useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OptimizedGlass } from '../ui/OptimizedGlass';
import { Button } from '../ui/Button';
import OptimizedExperienceCard from '../experiences/OptimizedExperienceCard';
import { useOptimizedScroll } from '../../hooks/useOptimizedScroll';

interface Experience {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  image: string;
  highlights: string[];
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  season: string;
  category: string;
  rating: number;
}

interface OptimizedExploreProps {
  experiences: Experience[];
  onBookExperience: (experience: Experience) => void;
  onClose: () => void;
}

// Filter categories
const CATEGORIES = ['All', 'Adventure', 'Cultural', 'Scenic', 'Spiritual', 'Photography'];
const DIFFICULTIES = ['All', 'Easy', 'Moderate', 'Challenging'];
const PRICE_RANGES = [
  { label: 'All', min: 0, max: Infinity },
  { label: 'Under ₹10k', min: 0, max: 10000 },
  { label: '₹10k - ₹25k', min: 10000, max: 25000 },
  { label: '₹25k - ₹50k', min: 25000, max: 50000 },
  { label: 'Above ₹50k', min: 50000, max: Infinity }
];

// Animation variants
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

const filterVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const }
  }
};

const gridVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
      staggerChildren: 0.05
    }
  }
};

// Virtual grid implementation for performance
const VirtualGrid = memo<{
  items: Experience[];
  onBookExperience: (experience: Experience) => void;
}>(({ items, onBookExperience }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 12 });
  
  // Intersection observer for virtual scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            if (index > visibleRange.end - 6) {
              setVisibleRange(prev => ({
                start: prev.start,
                end: Math.min(prev.end + 6, items.length)
              }));
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    const grid = gridRef.current;
    if (grid) {
      const lastVisible = grid.children[visibleRange.end - 1];
      if (lastVisible) observer.observe(lastVisible);
    }

    return () => observer.disconnect();
  }, [visibleRange, items.length]);

  const visibleItems = items.slice(visibleRange.start, visibleRange.end);

  return (
    <div 
      ref={gridRef}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {visibleItems.map((experience, index) => (
        <div key={experience.id} data-index={visibleRange.start + index}>
          <OptimizedExperienceCard
            experience={experience}
            onBook={onBookExperience}
            index={visibleRange.start + index}
          />
        </div>
      ))}
    </div>
  );
});

VirtualGrid.displayName = 'VirtualGrid';

const OptimizedExplore = memo<OptimizedExploreProps>(({ 
  experiences, 
  onBookExperience, 
  onClose 
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating'>('name');

  // Optimized scroll with parallax
  const { scrollY, parallaxY } = useOptimizedScroll({
    enableParallax: true,
    parallaxStrength: 0.5
  });

  // Memoized filtered and sorted experiences
  const filteredExperiences = useMemo(() => {
    const priceRange = PRICE_RANGES[selectedPriceRange];
    
    return experiences
      .filter(exp => {
        const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;
        const matchesDifficulty = selectedDifficulty === 'All' || exp.difficulty === selectedDifficulty;
        const matchesPrice = exp.price >= priceRange.min && exp.price <= priceRange.max;
        const matchesSearch = searchQuery === '' || 
          exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exp.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesCategory && matchesDifficulty && matchesPrice && matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price': return a.price - b.price;
          case 'rating': return b.rating - a.rating;
          case 'name': 
          default: return a.title.localeCompare(b.title);
        }
      });
  }, [experiences, selectedCategory, selectedDifficulty, selectedPriceRange, searchQuery, sortBy]);

  // Optimized filter handlers
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleDifficultyChange = useCallback((difficulty: string) => {
    setSelectedDifficulty(difficulty);
  }, []);

  const handlePriceRangeChange = useCallback((index: number) => {
    setSelectedPriceRange(index);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as 'name' | 'price' | 'rating');
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background with parallax */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-indigo-900/95"
        style={{ y: parallaxY }}
      />
      
      {/* Content Container */}
      <div className="relative h-full overflow-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-4 py-8"
        >
          {/* Header */}
          <motion.div 
            variants={filterVariants}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Explore Ladakh
              </h1>
              <p className="text-purple-200">
                Discover {filteredExperiences.length} amazing experiences
              </p>
            </div>
            <Button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </motion.div>

          {/* Filters */}
          <motion.div variants={filterVariants}>
            <OptimizedGlass intensity="medium" className="p-6 mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Search */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search experiences..."
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    {CATEGORIES.map(category => (
                      <option key={category} value={category} className="bg-gray-800">
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => handleDifficultyChange(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    {DIFFICULTIES.map(difficulty => (
                      <option key={difficulty} value={difficulty} className="bg-gray-800">
                        {difficulty}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="name" className="bg-gray-800">Name</option>
                    <option value="price" className="bg-gray-800">Price</option>
                    <option value="rating" className="bg-gray-800">Rating</option>
                  </select>
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-purple-200 mb-3">
                  Price Range
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRICE_RANGES.map((range, index) => (
                    <button
                      key={index}
                      onClick={() => handlePriceRangeChange(index)}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                        selectedPriceRange === index
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/10 text-purple-200 hover:bg-white/20'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </OptimizedGlass>
          </motion.div>

          {/* Experiences Grid */}
          <motion.div variants={gridVariants}>
            <AnimatePresence mode="wait">
              {filteredExperiences.length > 0 ? (
                <motion.div
                  key="experiences"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <VirtualGrid 
                    items={filteredExperiences}
                    onBookExperience={onBookExperience}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-16"
                >
                  <OptimizedGlass intensity="medium" className="max-w-md mx-auto p-8">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      No experiences found
                    </h3>
                    <p className="text-purple-200">
                      Try adjusting your filters to see more results
                    </p>
                  </OptimizedGlass>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
});

OptimizedExplore.displayName = 'OptimizedExplore';

export default OptimizedExplore;
