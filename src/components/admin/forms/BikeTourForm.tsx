import { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Calendar, MapPin, Clock } from 'lucide-react';
import { OptimizedGlass } from '../../ui/OptimizedGlass';
import { Button } from '../../ui/Button';
import { adminFirebaseService, BikeTour } from '../../../services/adminFirebaseService';
import toast from 'react-hot-toast';

interface BikeTourFormProps {
  isOpen: boolean;
  onClose: () => void;
  bikeTour?: BikeTour | null;
  mode: 'create' | 'edit';
}

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  accommodation: string;
  meals: string[];
  distance?: string;
  altitude?: string;
}

export const BikeTourForm = memo(({ isOpen, onClose, bikeTour, mode }: BikeTourFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    region: '',
    duration: 1,
    difficulty: 'Moderate',
    pricePerPerson: 0,
    maxGroupSize: 1,
    startLocation: '',
    endLocation: '',
    image: '',
    highlights: [''],
    inclusions: [''],
    exclusions: [''],
    bestTime: '',
    termsAndConditions: '',
    isActive: true
  });

  const [itinerary, setItinerary] = useState<ItineraryDay[]>([
    {
      day: 1,
      title: '',
      description: '',
      activities: [''],
      accommodation: '',
      meals: [''],
      distance: '',
      altitude: ''
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (bikeTour && mode === 'edit') {
      setFormData({
        name: bikeTour.name,
        description: bikeTour.description,
        region: bikeTour.region,
        duration: bikeTour.duration,
        difficulty: bikeTour.difficulty,
        pricePerPerson: bikeTour.pricePerPerson,
        maxGroupSize: bikeTour.maxGroupSize,
        startLocation: bikeTour.startLocation,
        endLocation: bikeTour.endLocation,
        image: bikeTour.image,
        highlights: bikeTour.highlights.length > 0 ? bikeTour.highlights : [''],
        inclusions: bikeTour.inclusions.length > 0 ? bikeTour.inclusions : [''],
        exclusions: bikeTour.exclusions.length > 0 ? bikeTour.exclusions : [''],
        bestTime: bikeTour.bestTime,
        termsAndConditions: bikeTour.termsAndConditions || '',
        isActive: bikeTour.isActive
      });
      
      if (bikeTour.itinerary && bikeTour.itinerary.length > 0) {
        setItinerary(bikeTour.itinerary);
      }
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        description: '',
        region: '',
        duration: 1,
        difficulty: 'Moderate',
        pricePerPerson: 0,
        maxGroupSize: 1,
        startLocation: '',
        endLocation: '',
        image: '',
        highlights: [''],
        inclusions: [''],
        exclusions: [''],
        bestTime: '',
        termsAndConditions: '',
        isActive: true
      });
      setItinerary([{
        day: 1,
        title: '',
        description: '',
        activities: [''],
        accommodation: '',
        meals: [''],
        distance: '',
        altitude: ''
      }]);
    }
  }, [bikeTour, mode]);

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle array field changes
  const handleArrayFieldChange = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Itinerary management
  const addItineraryDay = () => {
    setItinerary(prev => [...prev, {
      day: prev.length + 1,
      title: '',
      description: '',
      activities: [''],
      accommodation: '',
      meals: [''],
      distance: '',
      altitude: ''
    }]);
  };

  const removeItineraryDay = (index: number) => {
    setItinerary(prev => prev.filter((_, i) => i !== index).map((day, i) => ({ ...day, day: i + 1 })));
  };

  const updateItineraryDay = (index: number, field: string, value: any) => {
    setItinerary(prev => prev.map((day, i) => 
      i === index ? { ...day, [field]: value } : day
    ));
  };

  const updateItineraryActivity = (dayIndex: number, activityIndex: number, value: string) => {
    setItinerary(prev => prev.map((day, i) => 
      i === dayIndex 
        ? { ...day, activities: day.activities.map((activity, j) => j === activityIndex ? value : activity) }
        : day
    ));
  };

  const addItineraryActivity = (dayIndex: number) => {
    setItinerary(prev => prev.map((day, i) => 
      i === dayIndex 
        ? { ...day, activities: [...day.activities, ''] }
        : day
    ));
  };

  const removeItineraryActivity = (dayIndex: number, activityIndex: number) => {
    setItinerary(prev => prev.map((day, i) => 
      i === dayIndex 
        ? { ...day, activities: day.activities.filter((_, j) => j !== activityIndex) }
        : day
    ));
  };

  const updateItineraryMeal = (dayIndex: number, mealIndex: number, value: string) => {
    setItinerary(prev => prev.map((day, i) => 
      i === dayIndex 
        ? { ...day, meals: day.meals.map((meal, j) => j === mealIndex ? value : meal) }
        : day
    ));
  };

  const addItineraryMeal = (dayIndex: number) => {
    setItinerary(prev => prev.map((day, i) => 
      i === dayIndex 
        ? { ...day, meals: [...day.meals, ''] }
        : day
    ));
  };

  const removeItineraryMeal = (dayIndex: number, mealIndex: number) => {
    setItinerary(prev => prev.map((day, i) => 
      i === dayIndex 
        ? { ...day, meals: day.meals.filter((_, j) => j !== mealIndex) }
        : day
    ));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.region) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const bikeTourData: Omit<BikeTour, 'id' | 'createdAt' | 'updatedAt'> = {
        ...formData,
        highlights: formData.highlights.filter(h => h.trim() !== ''),
        inclusions: formData.inclusions.filter(i => i.trim() !== ''),
        exclusions: formData.exclusions.filter(e => e.trim() !== ''),
        itinerary: itinerary.map(day => ({
          ...day,
          activities: day.activities.filter(a => a.trim() !== ''),
          meals: day.meals.filter(m => m.trim() !== '')
        }))
      };

      if (mode === 'create') {
        await adminFirebaseService.createBikeTour(bikeTourData);
        toast.success('Bike tour created successfully');
      } else if (bikeTour?.id) {
        await adminFirebaseService.updateBikeTour(bikeTour.id, bikeTourData);
        toast.success('Bike tour updated successfully');
      }

      onClose();
    } catch (error) {
      console.error('Error saving bike tour:', error);
      toast.error('Failed to save bike tour');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          <OptimizedGlass intensity="high" className="relative">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <h2 className="text-2xl font-bold text-white">
                {mode === 'create' ? 'Create Bike Tour' : 'Edit Bike Tour'}
              </h2>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Form */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Tour Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                      placeholder="Enter tour name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Region <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.region}
                      onChange={(e) => handleInputChange('region', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                      placeholder="e.g., Ladakh, Himachal Pradesh"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Duration (Days)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => handleInputChange('difficulty', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Challenging">Challenging</option>
                      <option value="Extreme">Extreme</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Price per Person (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.pricePerPerson}
                      onChange={(e) => handleInputChange('pricePerPerson', parseInt(e.target.value))}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Max Group Size</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxGroupSize}
                      onChange={(e) => handleInputChange('maxGroupSize', parseInt(e.target.value))}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Start Location</label>
                    <input
                      type="text"
                      value={formData.startLocation}
                      onChange={(e) => handleInputChange('startLocation', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                      placeholder="Starting point of the tour"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">End Location</label>
                    <input
                      type="text"
                      value={formData.endLocation}
                      onChange={(e) => handleInputChange('endLocation', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                      placeholder="Ending point of the tour"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                    placeholder="Detailed description of the tour"
                    required
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-white font-medium mb-2">Image URL</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Highlights */}
                <div>
                  <label className="block text-white font-medium mb-2">Tour Highlights</label>
                  {formData.highlights.map((highlight, index) => (
                    <div key={index} className="flex gap-3 mb-3">
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) => handleArrayFieldChange('highlights', index, e.target.value)}
                        className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                        placeholder="Tour highlight"
                      />
                      <Button
                        type="button"
                        onClick={() => removeArrayField('highlights', index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={() => addArrayField('highlights')}
                    variant="ghost"
                    size="sm"
                    className="text-purple-400 hover:text-purple-300"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Highlight
                  </Button>
                </div>

                {/* Inclusions & Exclusions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Inclusions</label>
                    {formData.inclusions.map((inclusion, index) => (
                      <div key={index} className="flex gap-3 mb-3">
                        <input
                          type="text"
                          value={inclusion}
                          onChange={(e) => handleArrayFieldChange('inclusions', index, e.target.value)}
                          className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                          placeholder="What's included"
                        />
                        <Button
                          type="button"
                          onClick={() => removeArrayField('inclusions', index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      onClick={() => addArrayField('inclusions')}
                      variant="ghost"
                      size="sm"
                      className="text-purple-400 hover:text-purple-300"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Inclusion
                    </Button>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Exclusions</label>
                    {formData.exclusions.map((exclusion, index) => (
                      <div key={index} className="flex gap-3 mb-3">
                        <input
                          type="text"
                          value={exclusion}
                          onChange={(e) => handleArrayFieldChange('exclusions', index, e.target.value)}
                          className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                          placeholder="What's excluded"
                        />
                        <Button
                          type="button"
                          onClick={() => removeArrayField('exclusions', index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      onClick={() => addArrayField('exclusions')}
                      variant="ghost"
                      size="sm"
                      className="text-purple-400 hover:text-purple-300"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Exclusion
                    </Button>
                  </div>
                </div>

                {/* Best Time */}
                <div>
                  <label className="block text-white font-medium mb-2">Best Time to Visit</label>
                  <input
                    type="text"
                    value={formData.bestTime}
                    onChange={(e) => handleInputChange('bestTime', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                    placeholder="e.g., May to September"
                  />
                </div>

                {/* Itinerary */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-white font-medium">Tour Itinerary</label>
                    <Button
                      type="button"
                      onClick={addItineraryDay}
                      variant="ghost"
                      size="sm"
                      className="text-purple-400 hover:text-purple-300"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Day
                    </Button>
                  </div>

                  {itinerary.map((day, dayIndex) => (
                    <div key={dayIndex} className="bg-white/5 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-medium flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Day {day.day}
                        </h4>
                        <Button
                          type="button"
                          onClick={() => removeItineraryDay(dayIndex)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-white/80 text-sm mb-2">Day Title</label>
                          <input
                            type="text"
                            value={day.title}
                            onChange={(e) => updateItineraryDay(dayIndex, 'title', e.target.value)}
                            className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white text-sm"
                            placeholder="Day title"
                          />
                        </div>

                        <div>
                          <label className="block text-white/80 text-sm mb-2">Accommodation</label>
                          <input
                            type="text"
                            value={day.accommodation}
                            onChange={(e) => updateItineraryDay(dayIndex, 'accommodation', e.target.value)}
                            className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white text-sm"
                            placeholder="Hotel/Camp name"
                          />
                        </div>

                        <div>
                          <label className="block text-white/80 text-sm mb-2">Distance</label>
                          <input
                            type="text"
                            value={day.distance || ''}
                            onChange={(e) => updateItineraryDay(dayIndex, 'distance', e.target.value)}
                            className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white text-sm"
                            placeholder="e.g., 250 km"
                          />
                        </div>

                        <div>
                          <label className="block text-white/80 text-sm mb-2">Altitude</label>
                          <input
                            type="text"
                            value={day.altitude || ''}
                            onChange={(e) => updateItineraryDay(dayIndex, 'altitude', e.target.value)}
                            className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white text-sm"
                            placeholder="e.g., 3500m"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-white/80 text-sm mb-2">Description</label>
                        <textarea
                          value={day.description}
                          onChange={(e) => updateItineraryDay(dayIndex, 'description', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white text-sm"
                          placeholder="Day description"
                        />
                      </div>

                      {/* Activities */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-white/80 text-sm">Activities</label>
                          <Button
                            type="button"
                            onClick={() => addItineraryActivity(dayIndex)}
                            variant="ghost"
                            size="sm"
                            className="text-purple-400 hover:text-purple-300 text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                          </Button>
                        </div>
                        {day.activities.map((activity, activityIndex) => (
                          <div key={activityIndex} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={activity}
                              onChange={(e) => updateItineraryActivity(dayIndex, activityIndex, e.target.value)}
                              className="flex-1 px-3 py-2 rounded bg-white/10 border border-white/20 text-white text-sm"
                              placeholder="Activity"
                            />
                            <Button
                              type="button"
                              onClick={() => removeItineraryActivity(dayIndex, activityIndex)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Meals */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-white/80 text-sm">Meals</label>
                          <Button
                            type="button"
                            onClick={() => addItineraryMeal(dayIndex)}
                            variant="ghost"
                            size="sm"
                            className="text-purple-400 hover:text-purple-300 text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                          </Button>
                        </div>
                        {day.meals.map((meal, mealIndex) => (
                          <div key={mealIndex} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={meal}
                              onChange={(e) => updateItineraryMeal(dayIndex, mealIndex, e.target.value)}
                              className="flex-1 px-3 py-2 rounded bg-white/10 border border-white/20 text-white text-sm"
                              placeholder="e.g., Breakfast, Lunch, Dinner"
                            />
                            <Button
                              type="button"
                              onClick={() => removeItineraryMeal(dayIndex, mealIndex)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Terms and Conditions */}
                <div>
                  <label className="block text-white font-medium mb-2">Terms and Conditions</label>
                  <textarea
                    value={formData.termsAndConditions}
                    onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                    placeholder="Terms and conditions for the tour"
                  />
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="isActive" className="text-white">
                    Active (visible to customers)
                  </label>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-6 border-t border-white/20">
                  <Button
                    type="button"
                    onClick={onClose}
                    variant="ghost"
                    className="text-white/70 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isLoading ? 'Saving...' : mode === 'create' ? 'Create Tour' : 'Update Tour'}
                  </Button>
                </div>
              </form>
            </div>
          </OptimizedGlass>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});

BikeTourForm.displayName = 'BikeTourForm';

export default BikeTourForm;
