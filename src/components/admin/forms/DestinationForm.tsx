import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Plus } from 'lucide-react';
import { Button } from '../../ui/Button';
import { OptimizedGlass } from '../../ui/OptimizedGlass';
import { Destination, adminFirebaseService } from '../../../services/adminFirebaseService';
import toast from 'react-hot-toast';

interface DestinationFormProps {
  isOpen: boolean;
  onClose: () => void;
  destination?: Destination | null;
  mode: 'create' | 'edit';
}

export function DestinationForm({ isOpen, onClose, destination, mode }: DestinationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    altitude: '',
    bestTime: '',
    difficulty: 'Easy' as 'Easy' | 'Moderate' | 'Challenging',
    highlights: [] as string[],
    distance: '',
    price: 0,
    rating: 4.5,
    isActive: true
  });

  const [newHighlight, setNewHighlight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (destination && mode === 'edit') {
      setFormData({
        name: destination.name,
        description: destination.description,
        image: destination.image,
        altitude: destination.altitude,
        bestTime: destination.bestTime,
        difficulty: destination.difficulty,
        highlights: destination.highlights,
        distance: destination.distance,
        price: destination.price,
        rating: destination.rating,
        isActive: destination.isActive
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        description: '',
        image: '',
        altitude: '',
        bestTime: '',
        difficulty: 'Easy',
        highlights: [],
        distance: '',
        price: 0,
        rating: 4.5,
        isActive: true
      });
    }
  }, [destination, mode, isOpen]);

  const addHighlight = () => {
    if (newHighlight.trim() && !formData.highlights.includes(newHighlight.trim())) {
      setFormData(prev => ({
        ...prev,
        highlights: [...prev.highlights, newHighlight.trim()]
      }));
      setNewHighlight('');
    }
  };

  const removeHighlight = (highlight: string) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter(h => h !== highlight)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        await adminFirebaseService.createDestination(formData);
        toast.success('Destination created successfully!');
      } else if (destination) {
        await adminFirebaseService.updateDestination(destination.id, formData);
        toast.success('Destination updated successfully!');
      }
      onClose();
    } catch (error) {
      console.error('Error saving destination:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <OptimizedGlass intensity="heavy" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {mode === 'create' ? 'Add New Destination' : 'Edit Destination'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-white/90 mb-2">Destination Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                  placeholder="e.g., Pangong Tso"
                  required
                />
              </div>

              <div>
                <label className="block text-white/90 mb-2">Altitude</label>
                <input
                  type="text"
                  value={formData.altitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, altitude: e.target.value }))}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                  placeholder="e.g., 4,350m"
                  required
                />
              </div>

              <div>
                <label className="block text-white/90 mb-2">Distance</label>
                <input
                  type="text"
                  value={formData.distance}
                  onChange={(e) => setFormData(prev => ({ ...prev, distance: e.target.value }))}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                  placeholder="e.g., 160km from Leh"
                  required
                />
              </div>

              <div>
                <label className="block text-white/90 mb-2">Best Time to Visit</label>
                <input
                  type="text"
                  value={formData.bestTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, bestTime: e.target.value }))}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                  placeholder="e.g., May - September"
                  required
                />
              </div>

              <div>
                <label className="block text-white/90 mb-2">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
                >
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Challenging">Challenging</option>
                </select>
              </div>

              <div>
                <label className="block text-white/90 mb-2">Price (₹)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-white/90 mb-2">Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-white/90 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 h-32 resize-none"
                placeholder="Describe the destination..."
                required
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-white/90 mb-2">Image URL</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>

            {/* Highlights */}
            <div>
              <label className="block text-white/90 mb-2">Highlights</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                  className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                  placeholder="Add a highlight..."
                />
                <Button
                  type="button"
                  onClick={addHighlight}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.highlights.map((highlight, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-600/30 text-purple-200 rounded-full text-sm flex items-center gap-2"
                  >
                    {highlight}
                    <button
                      type="button"
                      onClick={() => removeHighlight(highlight)}
                      className="text-purple-300 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4"
              />
              <label htmlFor="isActive" className="text-white/90">
                Active (visible to users)
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="flex-1 text-white border border-white/20 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Destination' : 'Update Destination'}
              </Button>
            </div>
          </form>
        </OptimizedGlass>
      </motion.div>
    </div>
  );
}
