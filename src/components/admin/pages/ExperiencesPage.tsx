import React, { useEffect, useState } from 'react';
import { experiencesService } from '../../../services/experiencesService';
import { Experience } from '../../../types';
import { Plus, Edit, Trash2 } from 'lucide-react';

export function ExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [form, setForm] = useState<Partial<Experience>>({});

  useEffect(() => {
    const unsubscribe = experiencesService.subscribeToExperiences(setExperiences);
    return unsubscribe;
  }, []);

  const openModal = (exp?: Experience) => {
    setEditing(exp || null);
    setForm(exp ? { ...exp } : { title: '', description: '', tags: [], coverImage: '', isFeatured: false });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) return;
    try {
      if (editing) {
        await experiencesService.updateExperience(editing.id, form);
      } else {
        await experiencesService.addExperience({
          ...form,
          tags: form.tags || [],
          coverImage: form.coverImage || '',
          isFeatured: form.isFeatured || false,
        } as Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>);
      }
      closeModal();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this experience?')) {
      await experiencesService.deleteExperience(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Curated Experiences Management</h1>
        <button onClick={() => openModal()} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:shadow-lg transition-all">
          <Plus className="w-5 h-5" /> Add Experience
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {experiences.map(exp => (
          <div key={exp.id} className="bg-white/10 rounded-xl p-6 flex flex-col gap-2">
            <img src={exp.coverImage} alt={exp.title} className="h-32 w-full object-cover rounded-lg mb-2" />
            <h2 className="text-xl font-bold text-white">{exp.title}</h2>
            <p className="text-white/70 text-sm">{exp.description}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {exp.tags.map((t, i) => (
                <span key={i} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs">{t}</span>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => openModal(exp)} className="flex-1 bg-blue-500/20 text-blue-300 px-3 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-500/30 transition-colors"><Edit className="w-4 h-4" />Edit</button>
              <button onClick={() => handleDelete(exp.id)} className="bg-red-500/20 text-red-300 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-gray-900 border border-white/20 rounded-xl p-8 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-white mb-4">{editing ? 'Edit' : 'Add'} Experience</h2>
            <input type="text" placeholder="Title" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50" required />
            <textarea placeholder="Description" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50" rows={3} required />
            <input type="text" placeholder="Tags (comma separated)" value={form.tags ? form.tags.join(', ') : ''} onChange={e => setForm(f => ({ ...f, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50" />
            <input type="text" placeholder="Cover Image URL" value={form.coverImage || ''} onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50" />
            <label className="flex items-center gap-2 text-white/70">
              <input type="checkbox" checked={!!form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="w-4 h-4" /> Featured
            </label>
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