import React, { useEffect, useState } from 'react';
import { bikeToursService } from '../../../services/bikeToursService';
import { BikeTourPlan } from '../../../types';
import { Plus, Edit, Trash2 } from 'lucide-react';

export function BikeToursPage() {
  const [tours, setTours] = useState<BikeTourPlan[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BikeTourPlan | null>(null);
  const [form, setForm] = useState<Partial<BikeTourPlan> & { itineraryText?: string }>({});

  useEffect(() => {
    const unsubscribe = bikeToursService.subscribeToBikeTours(setTours);
    return unsubscribe;
  }, []);

  const openModal = (tour?: BikeTourPlan) => {
    setEditing(tour || null);
    setForm(tour ? {
      ...tour,
      itineraryText: (tour.itinerary || []).map(day => `Day ${day.day}: ${day.title ? day.title + ' - ' : ''}${day.description}`).join('\n')
    } : { title: '', duration: '', price: 0, highlights: [], itinerary: [], description: '', coverImage: '', isFeatured: false, itineraryText: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm({});
  };

  // Parse itinerary text into array of objects
  function parseItinerary(text: string) {
    return text.split(/\r?\n/).filter(Boolean).map((line, idx) => {
      const match = line.match(/^Day\s*(\d+)\s*:?\s*(.*)$/i);
      if (match) {
        const [, day, rest] = match;
        const [title, ...descArr] = rest.split(' - ');
        return {
          day: Number(day),
          title: title.trim() || '',
          description: descArr.join(' - ').trim() || ''
        };
      }
      // fallback: just description
      return {
        day: idx + 1,
        title: '',
        description: line.trim()
      };
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.duration || !form.price) return;
    try {
      const itinerary = form.itineraryText ? parseItinerary(form.itineraryText) : [];
      if (editing) {
        await bikeToursService.updateBikeTourPlan(editing.id, { ...form, itinerary });
      } else {
        await bikeToursService.addBikeTourPlan({
          ...form,
          highlights: form.highlights || [],
          itinerary,
          coverImage: form.coverImage || '',
          isFeatured: form.isFeatured || false,
        } as Omit<BikeTourPlan, 'id' | 'createdAt' | 'updatedAt'>);
      }
      closeModal();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this bike tour plan?')) {
      await bikeToursService.deleteBikeTourPlan(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Bike Tour Plans Management</h1>
        <button onClick={() => openModal()} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:shadow-lg transition-all">
          <Plus className="w-5 h-5" /> Add Bike Tour
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tours.map(tour => (
          <div key={tour.id} className="bg-white/10 rounded-xl p-6 flex flex-col gap-2">
            <img src={tour.coverImage} alt={tour.title} className="h-32 w-full object-cover rounded-lg mb-2" />
            <h2 className="text-xl font-bold text-white">{tour.title}</h2>
            <p className="text-white/70 text-sm">{tour.description}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {tour.highlights.map((h, i) => (
                <span key={i} className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs">{h}</span>
              ))}
            </div>
            <div className="flex gap-2 text-white/70 text-xs mt-2">
              <span>Duration: {tour.duration}</span>
              <span>Price: ₹{tour.price}</span>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => openModal(tour)} className="flex-1 bg-blue-500/20 text-blue-300 px-3 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-500/30 transition-colors"><Edit className="w-4 h-4" />Edit</button>
              <button onClick={() => handleDelete(tour.id)} className="bg-red-500/20 text-red-300 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-gray-900 border border-white/20 rounded-xl p-8 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-white mb-4">{editing ? 'Edit' : 'Add'} Bike Tour</h2>
            <input type="text" placeholder="Title" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50" required />
            <input type="text" placeholder="Duration" value={form.duration || ''} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50" required />
            <input type="number" placeholder="Price" value={form.price || ''} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50" required />
            <textarea placeholder="Description" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50" rows={3} />
            <input type="text" placeholder="Highlights (comma separated)" value={form.highlights ? form.highlights.join(', ') : ''} onChange={e => setForm(f => ({ ...f, highlights: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50" />
            <input type="text" placeholder="Cover Image URL" value={form.coverImage || ''} onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50" />
            <label className="flex items-center gap-2 text-white/70">
              <input type="checkbox" checked={!!form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="w-4 h-4" /> Featured
            </label>
            <div>
              <h3 className="text-white font-semibold mb-2">Itinerary</h3>
              <textarea
                placeholder={"Paste itinerary as:\nDay 1: Description\nDay 2: Description"}
                value={form.itineraryText || ''}
                onChange={e => setForm(f => ({ ...f, itineraryText: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 min-h-[120px]"
                rows={6}
                required
              />
              <p className="text-xs text-white/50 mt-2">Format: Day 1: Description\nDay 2: Description</p>
            </div>
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={closeModal} className="flex-1 px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors">Cancel</button>
              <button type="submit" className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all">{editing ? 'Update' : 'Add'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 