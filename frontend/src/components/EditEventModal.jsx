import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { 
  X, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Users, 
  Save, 
  Image as ImageIcon, 
  Layers, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

const EditEventModal = ({ event, onClose, onUpdated }) => {
  if (!event) return null;

  // Format date for datetime-local input
  const initialDateString = event.date 
    ? new Date(event.date).toISOString().slice(0, 16) 
    : '';

  const [form, setEditForm] = useState({
    title: event.title || '',
    description: event.description || '',
    date: initialDateString,
    location: event.location || '',
    price: event.price || 0,
    aimingParticipants: event.aimingParticipants || 100,
    imageUrl: event.imageUrl || '',
    eventType: event.eventType || 'offline',
    rounds: event.rounds || 1,
    categories: Array.isArray(event.categories) ? event.categories.join(', ') : ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const payload = {
        ...form,
        price: Number(form.price),
        aimingParticipants: Number(form.aimingParticipants),
        rounds: Number(form.rounds),
        date: new Date(form.date)
      };

      const res = await api.put(`/api/events/${event._id}`, payload);
      onUpdated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-surface border border-white/15 rounded-3xl overflow-hidden shadow-2xl text-white my-8 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div>
              <h2 className="text-xl font-bold">Edit Event Details</h2>
              <p className="text-xs text-gray-400">Update event schedule, venue, capacity, or guidelines</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {error}
              </div>
            )}

            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300">Event Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={e => setEditForm({ ...form, title: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Date & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={form.date}
                  onChange={e => setEditForm({ ...form, date: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Location / Venue</label>
                <input
                  type="text"
                  required
                  value={form.location}
                  onChange={e => setEditForm({ ...form, location: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* Poster Image */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300">Poster Image URL</label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={e => setEditForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Price, Capacity, Format, Rounds */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={e => setEditForm({ ...form, price: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Max Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={form.aimingParticipants}
                  onChange={e => setEditForm({ ...form, aimingParticipants: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Format</label>
                <select
                  value={form.eventType}
                  onChange={e => setEditForm({ ...form, eventType: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-2 px-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                >
                  <option value="offline" className="bg-surface text-white">Offline</option>
                  <option value="online" className="bg-surface text-white">Online</option>
                  <option value="hybrid" className="bg-surface text-white">Hybrid</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Rounds</label>
                <input
                  type="number"
                  min="1"
                  value={form.rounds}
                  onChange={e => setEditForm({ ...form, rounds: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* Themes / Categories */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300">Theme / Tags</label>
              <input
                type="text"
                value={form.categories}
                onChange={e => setEditForm({ ...form, categories: e.target.value })}
                placeholder="Technical, Coding, Workshop"
                className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300">Description & Guidelines</label>
              <textarea
                rows="4"
                required
                value={form.description}
                onChange={e => setEditForm({ ...form, description: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-sm transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-sm shadow-lg shadow-primary/20 hover:opacity-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditEventModal;
