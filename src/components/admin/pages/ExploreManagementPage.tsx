import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Eye, Video, Tag, Star } from 'lucide-react';
import { AdminContentService } from '../../../services/adminContentService';
import { ExplorePlan } from '../../../types';
import toast from 'react-hot-toast';

export function ExploreManagementPage() {
  const [explorePlans, setExplorePlans] = useState<ExplorePlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<ExplorePlan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ExplorePlan | null>(null);
  const [formData, setFormData] = useState<Partial<ExplorePlan>>({});

  useEffect(() => {
    loadExplorePlans();
  }, []);

  useEffect(() => {
    const filtered = explorePlans.filter(plan =>
      plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredPlans(filtered);
  }, [searchTerm, explorePlans]);

  const loadExplorePlans = async () => {
    setIsLoading(true);
    try {
      const plans = await AdminContentService.getAllExplorePlans();
      setExplorePlans(plans);
    } catch (error) {
      toast.error('Failed to load explore plans');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (plan?: ExplorePlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData(plan);
    } else {
      setEditingPlan(null);
      setFormData({
        title: '',
        description: '',
        videoURL: '',
        highlights: [],
        tags: [],
        coverImage: '',
        isFeatured: false
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
    
    if (!formData.title || !formData.description || !formData.videoURL) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingPlan) {
        await AdminContentService.updateExplorePlan(editingPlan.id, formData);
      } else {
        await AdminContentService.addExplorePlan(formData as Omit<ExplorePlan, 'id' | 'createdAt' | 'updatedAt'>);
      }
      
      await loadExplorePlans();
      closeModal();
    } catch (error) {
      // Error already handled in service
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await AdminContentService.deleteExplorePlan(id);
        await loadExplorePlans();
      } catch (error) {
        // Error already handled in service
      }
    }
  };

  const handleArrayInput = (field: 'highlights' | 'tags', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, [field]: items }));
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
          <h1 className="text-3xl font-bold text-white">Explore Plans Management</h1>
          <p className="text-white/70 mt-1">Manage bike tours and exploration content</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Explore Plan
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
        <input
          type="text"
          placeholder="Search explore plans..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white">Total Plans</h3>
          <p className="text-3xl font-bold text-blue-400 mt-2">{explorePlans.length}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white">Featured Plans</h3>
          <p className="text-3xl font-bold text-purple-400 mt-2">
            {explorePlans.filter(plan => plan.isFeatured).length}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white">Total Tags</h3>
          <p className="text-3xl font-bold text-green-400 mt-2">
            {new Set(explorePlans.flatMap(plan => plan.tags)).size}
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
              <div className="relative h-48 bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                {plan.coverImage ? (
                  <img
                    src={plan.coverImage}
                    alt={plan.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Video className="w-12 h-12 text-white/50" />
                  </div>
                )}
                {plan.isFeatured && (
                  <div className="absolute top-3 left-3 bg-yellow-500 text-black px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
                    <Star className="w-3 h-3" />
                    Featured
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2">{plan.title}</h3>
                <p className="text-white/70 text-sm mb-3 line-clamp-2">{plan.description}</p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {plan.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {plan.tags.length > 3 && (
                    <span className="text-white/50 text-xs">+{plan.tags.length - 3} more</span>
                  )}
                </div>

                {/* Highlights */}
                <div className="mb-4">
                  <p className="text-white/50 text-xs mb-1">Highlights:</p>
                  <p className="text-white/70 text-sm">
                    {plan.highlights.slice(0, 2).join(', ')}
                    {plan.highlights.length > 2 && ` +${plan.highlights.length - 2} more`}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(plan.videoURL, '_blank')}
                    className="flex-1 bg-blue-500/20 text-blue-300 px-3 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-500/30 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={() => openModal(plan)}
                    className="bg-white/10 text-white px-3 py-2 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
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
          <Video className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No explore plans found</h3>
          <p className="text-white/70 mb-6">
            {searchTerm ? 'No plans match your search criteria' : 'Get started by adding your first explore plan'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => openModal()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium"
            >
              Add First Explore Plan
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
              className="bg-gray-900 border border-white/20 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {editingPlan ? 'Edit Explore Plan' : 'Add New Explore Plan'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter plan title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter plan description"
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Video URL *
                    </label>
                    <input
                      type="url"
                      value={formData.videoURL || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, videoURL: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://youtube.com/watch?v=..."
                      required
                    />
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

                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Highlights (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.highlights?.join(', ') || ''}
                      onChange={(e) => handleArrayInput('highlights', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Leh, Nubra Valley, Pangong Lake"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags?.join(', ') || ''}
                      onChange={(e) => handleArrayInput('tags', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="adventure, biking, himalayas"
                    />
                  </div>

                  <div className="flex items-center gap-3">
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
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
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
