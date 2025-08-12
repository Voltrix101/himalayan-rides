import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit, Trash2, MapPin, Clock, Users, Star } from 'lucide-react';
import { AdminContentService } from '../../../services/adminContentService';
import { TripPlan, TourItinerary } from '../../../types';
import toast from 'react-hot-toast';

export function TripPlansPage() {
  const [tripPlans, setTripPlans] = useState<TripPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<TripPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TripPlan | null>(null);
  const [formData, setFormData] = useState<Partial<TripPlan>>({});

  useEffect(() => {
    loadTripPlans();
  }, []);

  useEffect(() => {
    const filtered = tripPlans.filter(plan =>
      plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.route.some(location => location.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredPlans(filtered);
  }, [searchTerm, tripPlans]);

  const loadTripPlans = async () => {
    setIsLoading(true);
    try {
      const plans = await AdminContentService.getAllTripPlans();
      setTripPlans(plans);
    } catch (error) {
      toast.error('Failed to load trip plans');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (plan?: TripPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData(plan);
    } else {
      setEditingPlan(null);
      setFormData({
        title: '',
        route: [],
        duration: '',
        price: 0,
        description: '',
        coverImage: '',
        isFeatured: false,
        highlights: [],
        itinerary: [],
        difficulty: 'Moderate',
        bestSeason: [],
        groupSize: { min: 1, max: 10 }
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPlan(null);
    setFormData({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.duration) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const planData = {
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Omit<TripPlan, 'id'>;

      if (editingPlan) {
        await AdminContentService.updateTripPlan(editingPlan.id, formData);
      } else {
        await AdminContentService.addTripPlan(planData);
      }
      
      await loadTripPlans();
      closeModal();
    } catch (error) {
      // Error already handled in service
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await AdminContentService.deleteTripPlan(id);
        await loadTripPlans();
      } catch (error) {
        // Error already handled in service
      }
    }
  };

  const handleArrayInput = (field: 'route' | 'highlights' | 'bestSeason', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  const addItineraryDay = () => {
    const newDay: TourItinerary = {
      day: (formData.itinerary?.length || 0) + 1,
      title: '',
      description: ''
    };
    setFormData(prev => ({
      ...prev,
      itinerary: [...(prev.itinerary || []), newDay]
    }));
  };

  const updateItineraryDay = (index: number, field: keyof TourItinerary, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary?.map((day, i) => 
        i === index ? { ...day, [field]: value } : day
      ) || []
    }));
  };

  const removeItineraryDay = (index: number) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary?.filter((_, i) => i !== index) || []
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Trip Plans Management</h1>
          <p className="text-white/70 mt-1">Create and manage custom trip itineraries</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Trip Plan
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
        <input
          type="text"
          placeholder="Search trip plans..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white">Total Plans</h3>
          <p className="text-3xl font-bold text-green-400 mt-2">{tripPlans.length}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white">Featured Plans</h3>
          <p className="text-3xl font-bold text-blue-400 mt-2">
            {tripPlans.filter(plan => plan.isFeatured).length}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white">Avg. Price</h3>
          <p className="text-3xl font-bold text-purple-400 mt-2">
            ₹{tripPlans.length > 0 ? Math.round(tripPlans.reduce((sum, plan) => sum + plan.price, 0) / tripPlans.length) : 0}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white">Total Routes</h3>
          <p className="text-3xl font-bold text-yellow-400 mt-2">
            {new Set(tripPlans.flatMap(plan => plan.route)).size}
          </p>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredPlans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden hover:shadow-xl transition-all group"
            >
              {/* Cover Image */}
              <div className="relative h-48 bg-gradient-to-r from-green-500/20 to-blue-500/20">
                {plan.coverImage ? (
                  <img
                    src={plan.coverImage}
                    alt={plan.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <MapPin className="w-12 h-12 text-white/50" />
                  </div>
                )}
                {plan.isFeatured && (
                  <div className="absolute top-3 left-3 bg-yellow-500 text-black px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
                    <Star className="w-3 h-3" />
                    Featured
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {plan.difficulty}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2">{plan.title}</h3>
                <p className="text-white/70 text-sm mb-3 line-clamp-2">{plan.description}</p>
                
                {/* Trip Details */}
                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div className="flex items-center gap-1 text-white/70">
                    <Clock className="w-4 h-4" />
                    {plan.duration}
                  </div>
                  <div className="flex items-center gap-1 text-white/70">
                    <Users className="w-4 h-4" />
                    {plan.groupSize.min}-{plan.groupSize.max} people
                  </div>
                </div>

                {/* Route */}
                <div className="mb-3">
                  <p className="text-white/50 text-xs mb-1">Route:</p>
                  <p className="text-white/70 text-sm">
                    {plan.route.slice(0, 3).join(' → ')}
                    {plan.route.length > 3 && ` +${plan.route.length - 3} more`}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <p className="text-2xl font-bold text-green-400">₹{plan.price.toLocaleString()}</p>
                  <p className="text-white/50 text-xs">per person</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(plan)}
                    className="flex-1 bg-blue-500/20 text-blue-300 px-3 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-500/30 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id, plan.title)}
                    className="bg-red-500/20 text-red-300 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredPlans.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No trip plans found</h3>
          <p className="text-white/70 mb-6">
            {searchTerm ? 'No plans match your search criteria' : 'Get started by adding your first trip plan'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => openModal()}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium"
            >
              Add First Trip Plan
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-white/20 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {editingPlan ? 'Edit Trip Plan' : 'Add New Trip Plan'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter trip title"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">
                        Duration *
                      </label>
                      <input
                        type="text"
                        value={formData.duration || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 5 Days, 10 Days"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter trip description"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        value={formData.price || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="10000"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">
                        Difficulty
                      </label>
                      <select
                        value={formData.difficulty || 'Moderate'}
                        onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Challenging">Challenging</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3 pt-8">
                      <input
                        type="checkbox"
                        id="isFeatured"
                        checked={formData.isFeatured || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="isFeatured" className="text-white/70 text-sm font-medium">
                        Featured Plan
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Cover Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.coverImage || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">
                        Route (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formData.route?.join(', ') || ''}
                        onChange={(e) => handleArrayInput('route', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Leh, Nubra Valley, Pangong Lake"
                      />
                    </div>

                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">
                        Best Season (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formData.bestSeason?.join(', ') || ''}
                        onChange={(e) => handleArrayInput('bestSeason', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="May, June, July, August, September"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Highlights (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.highlights?.join(', ') || ''}
                      onChange={(e) => handleArrayInput('highlights', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Khardung La Pass, Magnetic Hill, Nubra Valley"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">
                        Min Group Size
                      </label>
                      <input
                        type="number"
                        value={formData.groupSize?.min || 1}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          groupSize: { ...prev.groupSize, min: parseInt(e.target.value) || 1, max: prev.groupSize?.max || 10 }
                        }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">
                        Max Group Size
                      </label>
                      <input
                        type="number"
                        value={formData.groupSize?.max || 10}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          groupSize: { min: prev.groupSize?.min || 1, ...prev.groupSize, max: parseInt(e.target.value) || 10 }
                        }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Itinerary Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-white/70 text-sm font-medium">
                        Itinerary
                      </label>
                      <button
                        type="button"
                        onClick={addItineraryDay}
                        className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                      >
                        Add Day
                      </button>
                    </div>

                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {formData.itinerary?.map((day, index) => (
                        <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-medium">Day {day.day}</h4>
                            <button
                              type="button"
                              onClick={() => removeItineraryDay(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={day.title}
                              onChange={(e) => updateItineraryDay(index, 'title', e.target.value)}
                              placeholder="Day title"
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                            />
                            <textarea
                              value={day.description}
                              onChange={(e) => updateItineraryDay(index, 'description', e.target.value)}
                              placeholder="Day description"
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                              rows={2}
                            />
                          </div>
                        </div>
                      )) || []}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                    >
                      {editingPlan ? 'Update Plan' : 'Add Plan'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
