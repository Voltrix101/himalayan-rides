import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Plus } from 'lucide-react';
import { Button } from '../../ui/Button';
import { OptimizedGlass } from '../../ui/OptimizedGlass';
import { Experience, adminFirebaseService } from '../../../services/adminFirebaseService';
import { ImageUploader } from './ImageUploader';
import toast from 'react-hot-toast';

interface ExperienceFormProps {
  isOpen: boolean;
  onClose: () => void;
  experience?: Experience | null;
  mode: 'create' | 'edit';
}

export function ExperienceForm({ isOpen, onClose, experience, mode }: ExperienceFormProps) {
  const [formData, setFormData] = useState<Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    description: '',
    price: 0,
    duration: '1 Day',
    highlights: [],
    image: '',
    category: 'Adventure',
    rating: 4.5,
    inclusions: [],
    exclusions: [],
    difficulty: 'Easy',
    maxGroupSize: 10,
    bestTime: 'Year Round',
    location: 'Ladakh',
    isActive: true
  });

  const [newHighlight, setNewHighlight] = useState('');
  const [newInclusion, setNewInclusion] = useState('');
  const [newExclusion, setNewExclusion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (experience && mode === 'edit') {
      setFormData({
        title: experience.title,
        description: experience.description,
        price: experience.price,
        duration: experience.duration,
        highlights: experience.highlights,
        image: experience.image,
        category: experience.category,
        rating: experience.rating,
        inclusions: experience.inclusions,
        exclusions: experience.exclusions,
        difficulty: experience.difficulty,
        maxGroupSize: experience.maxGroupSize,
        bestTime: experience.bestTime,
        location: experience.location,
        isActive: experience.isActive
      });
    } else if (mode === 'create') {
      setFormData({
        title: '', 
        description: '', 
        price: 0, 
        duration: '1 Day', 
        highlights: [], 
        image: '',
        category: 'Adventure', 
        rating: 4.5, 
        inclusions: [], 
        exclusions: [],
        difficulty: 'Easy', 
        maxGroupSize: 10, 
        bestTime: 'Year Round',
        location: 'Ladakh',
        isActive: true
      });
    }
  }, [experience, mode, isOpen]);

  const addToList = (key: 'highlights' | 'inclusions' | 'exclusions', value: string) => {
    if (!value.trim()) return;
    setFormData(prev => ({ 
      ...prev, 
      [key]: [...(prev[key as keyof typeof prev] as string[]), value.trim()] 
    }));
  };

  const removeFromList = (key: 'highlights' | 'inclusions' | 'exclusions', value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [key]: (prev[key as keyof typeof prev] as string[]).filter((v: string) => v !== value) 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (mode === 'create') {
        await adminFirebaseService.createExperience(formData);
        toast.success('Experience created successfully!');
      } else if (mode === 'edit' && experience?.id) {
        await adminFirebaseService.updateExperience(experience.id, formData);
        toast.success('Experience updated successfully!');
      }
      onClose();
    } catch (error) {
      console.error('Error submitting experience:', error);
      toast.error('Failed to save experience. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <OptimizedGlass intensity="heavy" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">{mode === 'create' ? 'Add Experience' : 'Edit Experience'}</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/10">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-white/90 mb-2">Title</label>
                <input className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div>
                <label className="block text-white/90 mb-2">Price (₹)</label>
                <input type="number" className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })} min={0} required />
              </div>
              <div>
                <label className="block text-white/90 mb-2">Duration</label>
                <input type="text" className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g., 3 Days, 1 Week" required />
              </div>
              <div>
                <label className="block text-white/90 mb-2">Category</label>
                <select className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}>
                  <option value="Adventure">Adventure</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Spiritual">Spiritual</option>
                  <option value="Photography">Photography</option>
                </select>
              </div>
              <div>
                <label className="block text-white/90 mb-2">Difficulty</label>
                <select className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white" value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}>
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Challenging">Challenging</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-white/90 mb-2">Image</label>
                <div className="flex items-center gap-3">
                  <input type="url" className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 text-white" placeholder="https://..." value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
                  <ImageUploader onUploaded={(url) => setFormData({ ...formData, image: url })} />
                </div>
                {formData.image && (
                  <div className="mt-3 w-full aspect-video bg-white/10 rounded-lg overflow-hidden">
                    <img src={formData.image} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-white/90 mb-2">Description</label>
              <textarea className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white h-28 resize-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white/90 mb-2">Max Group Size</label>
                <input type="number" className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white" value={formData.maxGroupSize} onChange={(e) => setFormData({ ...formData, maxGroupSize: parseInt(e.target.value) })} min={1} required />
              </div>
              <div>
                <label className="block text-white/90 mb-2">Best Time</label>
                <input type="text" className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white" value={formData.bestTime} onChange={(e) => setFormData({ ...formData, bestTime: e.target.value })} placeholder="e.g., March to June" required />
              </div>
              <div>
                <label className="block text-white/90 mb-2">Location</label>
                <input type="text" className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-white/90">
                <input 
                  type="checkbox" 
                  checked={formData.isActive} 
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded bg-white/10 border border-white/20 text-purple-600 focus:ring-purple-500"
                />
                Active Experience
              </label>
            </div>

            <div>
              <label className="block text-white/90 mb-2">Highlights</label>
              <div className="flex gap-2 mb-2">
                <input className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 text-white" value={newHighlight} onChange={(e) => setNewHighlight(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList('highlights', newHighlight), setNewHighlight(''))} placeholder="Add highlight" />
                <Button type="button" onClick={() => (addToList('highlights', newHighlight), setNewHighlight(''))} className="px-4 py-3 bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.highlights.map((h, i) => (
                  <span key={i} className="px-3 py-1 bg-purple-600/30 text-purple-200 rounded-full text-sm flex items-center gap-2">
                    {h}
                    <button type="button" onClick={() => removeFromList('highlights', h)} className="text-purple-300 hover:text-white"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/90 mb-2">Inclusions</label>
                <div className="flex gap-2 mb-2">
                  <input className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 text-white" value={newInclusion} onChange={(e) => setNewInclusion(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList('inclusions', newInclusion), setNewInclusion(''))} placeholder="Add inclusion" />
                  <Button type="button" onClick={() => (addToList('inclusions', newInclusion), setNewInclusion(''))} className="px-4 py-3 bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.inclusions.map((v, i) => (
                    <span key={i} className="px-3 py-1 bg-green-600/20 text-green-200 rounded-full text-sm flex items-center gap-2">
                      {v}
                      <button type="button" onClick={() => removeFromList('inclusions', v)} className="text-green-300 hover:text-white"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-white/90 mb-2">Exclusions</label>
                <div className="flex gap-2 mb-2">
                  <input className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 text-white" value={newExclusion} onChange={(e) => setNewExclusion(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList('exclusions', newExclusion), setNewExclusion(''))} placeholder="Add exclusion" />
                  <Button type="button" onClick={() => (addToList('exclusions', newExclusion), setNewExclusion(''))} className="px-4 py-3 bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.exclusions.map((v, i) => (
                    <span key={i} className="px-3 py-1 bg-red-600/20 text-red-200 rounded-full text-sm flex items-center gap-2">
                      {v}
                      <button type="button" onClick={() => removeFromList('exclusions', v)} className="text-red-300 hover:text-white"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <Button type="button" variant="ghost" onClick={onClose} className="flex-1 text-white border border-white/20 hover:bg-white/10">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Experience' : 'Update Experience'}
              </Button>
            </div>
          </form>
        </OptimizedGlass>
      </motion.div>
    </div>
  );
}


