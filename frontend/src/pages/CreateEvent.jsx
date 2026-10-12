import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Users, 
  ArrowLeft, 
  Image as ImageIcon, 
  Sparkles, 
  Layers, 
  Tag, 
  Clock, 
  CheckCircle2, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const SAMPLE_POSTERS = [
  { name: 'Hackathon / Tech', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Music / Cultural', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Workshop / Academic', url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Gaming / E-Sports', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Sports / Athletics', url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80' }
];

const THEMES = [
  'Technical', 'Coding', 'Cultural', 'Music', 'Robotics', 
  'Workshop', 'Gaming', 'Sports', 'Hackathon', 'Literary', 'Design'
];

const CreateEvent = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    price: 0,
    isPaid: false,
    aimingParticipants: 100,
    eventType: 'offline',
    rounds: 1,
    imageUrl: '',
    theme: 'Technical',
    categories: 'Technical'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user || (user.role !== 'club' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-background text-text flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
          <h2 className="text-xl font-bold">Organizer Access Required</h2>
          <p className="text-gray-400 text-sm mt-1 mb-4">Only registered college clubs or departments can create events.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleThemeClick = (themeName) => {
    setFormData(prev => ({
      ...prev,
      theme: themeName,
      categories: themeName
    }));
  };

  const handleSelectPoster = (url) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      if (!formData.date) {
        setError('Please specify the date and time of the event');
        setLoading(false);
        return;
      }

      const submissionData = {
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date),
        location: formData.location,
        price: formData.isPaid ? Number(formData.price) : 0,
        aimingParticipants: Number(formData.aimingParticipants),
        eventType: formData.eventType,
        rounds: Number(formData.rounds),
        imageUrl: formData.imageUrl,
        categories: formData.categories
          ? formData.categories.split(',').map(c => c.trim().toLowerCase()).filter(Boolean)
          : [formData.theme.toLowerCase()]
      };

      await api.post('/api/events', submissionData);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create event. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        
        {/* Navigation Breadcrumb */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-400 hover:text-white transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Current Events
        </button>

        {/* Form Container */}
        <div className="bg-surface/60 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl space-y-8">
          
          {/* Header */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Event Launchpad
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Create Campus Event
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Publish your upcoming event on the Tickego college portal for students to register.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Event Name / Title (Requirement 3) */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-gray-200">
                Event Name <span className="text-primary">*</span>
              </label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. HackSprint 2026 / Annual Robotics Championship / Battle of Bands"
                className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
              />
            </div>

            {/* 2. Theme / Category Selection (Requirement 3) */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-gray-200 flex items-center justify-between">
                <span>Theme / Category <span className="text-primary">*</span></span>
                <span className="text-xs text-gray-400 font-normal">Click a theme or type custom tags</span>
              </label>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {THEMES.map((themeName) => (
                  <button
                    type="button"
                    key={themeName}
                    onClick={() => handleThemeClick(themeName)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      formData.theme === themeName
                        ? 'bg-primary text-white shadow-md shadow-primary/30 border border-primary/50'
                        : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {themeName}
                  </button>
                ))}
              </div>

              <input 
                type="text"
                value={formData.categories}
                onChange={e => setFormData({ ...formData, categories: e.target.value, theme: e.target.value })}
                placeholder="Comma separated tags: Technical, Hackathon, Coding"
                className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-4 text-xs sm:text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* 3. Date & Time (Requirement 3) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Event Date & Time <span className="text-primary">*</span></span>
                </label>
                <input 
                  type="datetime-local" 
                  required
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                />
              </div>

              {/* Venue / Campus Location */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-200 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Venue / Campus Location <span className="text-primary">*</span></span>
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Main Auditorium / Lab 4B / Online Zoom"
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* 4. Poster Image URL & Live Preview (Requirement 3) */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-gray-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  <span>Poster Image URL</span>
                </span>
                <span className="text-xs text-gray-400 font-normal">Direct image link (Unsplash, Imgur, Cloudinary)</span>
              </label>

              <input 
                type="url"
                value={formData.imageUrl}
                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/... or choose preset below"
                className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />

              {/* Sample Posters Quick Picker */}
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                <span className="text-xs text-gray-400 shrink-0 font-medium">Quick Presets:</span>
                {SAMPLE_POSTERS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPoster(preset.url)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-[11px] text-gray-300 hover:text-white shrink-0 border border-white/10 transition"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>

              {/* Poster Live Preview */}
              {formData.imageUrl && (
                <div className="h-44 sm:h-52 rounded-2xl overflow-hidden border border-white/15 relative bg-black/40 mt-2">
                  <img 
                    src={formData.imageUrl} 
                    alt="Poster Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Poster Preview
                  </div>
                </div>
              )}
            </div>

            {/* 5. Participants Capacity & Rounds (Requirement 3) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-200 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary" />
                  <span>Max Participants <span className="text-primary">*</span></span>
                </label>
                <input 
                  type="number" 
                  min="1"
                  required
                  value={formData.aimingParticipants}
                  onChange={e => setFormData({ ...formData, aimingParticipants: e.target.value })}
                  placeholder="100"
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-200">
                  Event Format
                </label>
                <select 
                  value={formData.eventType}
                  onChange={e => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                >
                  <option value="offline" className="bg-surface text-white">Offline (On Campus)</option>
                  <option value="online" className="bg-surface text-white">Online (Virtual)</option>
                  <option value="hybrid" className="bg-surface text-white">Hybrid</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-gray-200 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-primary" />
                  <span>Rounds / Stages</span>
                </label>
                <input 
                  type="number" 
                  min="1" 
                  max="10"
                  value={formData.rounds}
                  onChange={e => setFormData({ ...formData, rounds: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* 6. Pricing Toggle & Amount (Free vs Paid) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-black/25 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Ticket Pricing</h4>
                  <p className="text-xs text-gray-400">Choose whether registration is free or requires payment</p>
                </div>

                <div className="flex bg-black/40 rounded-xl p-1 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPaid: false, price: 0 })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      !formData.isPaid ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Free Entry
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPaid: true, price: formData.price || 99 })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      formData.isPaid ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Paid Ticket
                  </button>
                </div>
              </div>

              {formData.isPaid && (
                <div className="pt-2">
                  <label className="text-xs font-semibold text-gray-300">Ticket Price (in INR ₹)</label>
                  <div className="relative mt-1 max-w-xs">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">₹</span>
                    <input 
                      type="number"
                      min="1"
                      required={formData.isPaid}
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 pl-8 pr-4 text-sm text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 7. Detailed Description & Rules */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-gray-200 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" />
                <span>Description, Guidelines & Rules <span className="text-primary">*</span></span>
              </label>
              <textarea 
                rows="4"
                required
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the event format, eligibility, prizes, judging criteria, and instructions for participants..."
                className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all leading-relaxed"
              />
            </div>

            {/* Submit Action */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white font-extrabold rounded-2xl text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Publishing Event...</span>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Publish Campus Event</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateEvent;
