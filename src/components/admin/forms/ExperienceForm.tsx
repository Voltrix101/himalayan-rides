import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Plus } from 'lucide-react';
import { Button } from '../../ui/Button';
import { OptimizedGlass } from '../../ui/OptimizedGlass';
import { CuratedExperience } from '../../../types/curatedExperience';
import { ImageUploader } from './ImageUploader';

interface ExperienceFormProps {
  isOpen: boolean;
  onClose: () => void;
  experience?: CuratedExperience | null;
  mode: 'create' | 'edit';
  onSubmit: (payload: Omit<CuratedExperience, 'id'> | Partial<CuratedExperience>) => Promise<void>;
}

export function ExperienceForm({ isOpen, onClose, experience, mode, onSubmit }: ExperienceFormProps) {
  const [formData, setFormData] = useState<Omit<CuratedExperience, 'id'>>({
    title: '',
    description: '',
    price: 0,
    days: 1,
    highlights: [],
    image: '',
    category: 'Adventure',
    rating: 4.5,
    inclusions: [],
    exclusions: [],
    difficulty: 'Easy',
    maxParticipants: 10,
    itinerary: []
  });

  const [newHighlight, setNewHighlight] = useState('');
  const [newInclusion, setNewInclusion] = useState('');
  const [newExclusion, setNewExclusion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (experience && mode === 'edit') {
      const { id, ...rest } = experience;
      setFormData(rest);
    } else if (mode === 'create') {
      setFormData({
        title: '', description: '', price: 0, days: 1, highlights: [], image: '',
        category: 'Adventure', rating: 4.5, inclusions: [], exclusions: [],
        difficulty: 'Easy', maxParticipants: 10, itinerary: []
      });
    }
  }, [experience, mode, isOpen]);

  const addToList = (key: 'highlights' | 'inclusions' | 'exclusions', value: string) => {
    if (!value.trim()) return;
    setFormData(prev => ({ ...prev, [key]: [...(prev as any)[key], value.trim()] }));
  };

  const removeFromList = (key: 'highlights' | 'inclusions' | 'exclusions', value: string) => {
    setFormData(prev => ({ ...prev, [key]: (prev as any)[key].filter((v: string) => v !== value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(mode === 'create' ? formData : { id: (experience as any).id, ...formData });
      onClose();
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
                <label className="block text-white/90 mb-2">Days</label>
                <input type="number" className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white" value={formData.days} onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) })} min={1} required />
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


