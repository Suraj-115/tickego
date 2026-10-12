import React, { useState } from 'react';
import { X, Save, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const EditClubModal = ({ club, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: club.name || '',
    email: club.email || '',
    clubName: club.clubName || '',
    clubLogo: club.clubLogo || '',
    clubDescription: club.clubDescription || '',
    clubType: club.clubType || 'technical',
    motto: club.motto || club.clubMotto || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(club._id, form);
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-extrabold text-white">Edit Club Details</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Club Name</label>
              <input
                type="text"
                value={form.clubName}
                onChange={e => setForm({ ...form, clubName: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Club Type</label>
              <select
                value={form.clubType}
                onChange={e => setForm({ ...form, clubType: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
              >
                <option value="technical">Technical</option>
                <option value="coding">Coding</option>
                <option value="cultural">Cultural</option>
                <option value="sports">Sports</option>
                <option value="music">Music</option>
                <option value="drama">Drama</option>
                <option value="social">Social</option>
                <option value="health">Health & Wellness</option>
                <option value="literary">Literary</option>
                <option value="photography">Photography</option>
                <option value="robotics">Robotics</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Head Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Login Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Logo URL</label>
            <input
              type="url"
              value={form.clubLogo}
              onChange={e => setForm({ ...form, clubLogo: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-gray-500"
            />
          </div>

          {form.clubLogo && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
              <img src={form.clubLogo} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-white/10" onError={(e) => e.target.style.display = 'none'} />
              <span className="text-xs text-gray-400">Logo Preview</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Motto / Tagline</label>
            <input
              type="text"
              value={form.motto}
              onChange={e => setForm({ ...form, motto: e.target.value })}
              placeholder="e.g. Innovate, Create, Inspire"
              className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={form.clubDescription}
              onChange={e => setForm({ ...form, clubDescription: e.target.value })}
              className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-700 rounded-xl text-white font-bold text-sm shadow-lg shadow-primary/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold text-sm transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditClubModal;
