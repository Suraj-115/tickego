import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import Navbar from '../components/Navbar';
import {
  ArrowLeft, Calendar, Shield, Clock, MapPin, Users,
  Ticket, ExternalLink, QrCode, Search, Sparkles, AlertCircle,
  BarChart2, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

const ClubEvents = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tab filter: 'upcoming' (default) or 'past' or 'all'
  const [tab, setTab] = useState('upcoming');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchClubAndEvents();
  }, [id, user, navigate]);

  const fetchClubAndEvents = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch club profile and club events in parallel
      const [clubRes, eventsRes] = await Promise.all([
        api.get(`/api/clubs/${id}`),
        api.get(`/api/events/club/${id}`)
      ]);

      setClub(clubRes.data);
      setEvents(eventsRes.data || []);
    } catch (err) {
      console.error('Failed to load club events', err);
      setError(err.response?.data?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.date) >= now);
  const pastEvents = events.filter(e => new Date(e.date) < now);

  const currentList = tab === 'upcoming'
    ? upcomingEvents
    : tab === 'past'
    ? pastEvents
    : events;

  const filteredEvents = currentList.filter(e =>
    !search ||
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    (e.location || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3">
          <RefreshCw className="w-10 h-10 animate-spin text-primary" />
          <p className="text-gray-400 text-sm">Loading club events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white flex flex-col selection:bg-primary selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-gray-300 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Clubs
          </Link>

          <Link
            to={`/admin/clubs/${id}/statistics`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 text-sm font-semibold transition"
          >
            <BarChart2 className="w-4 h-4" />
            <span>Club Statistics</span>
          </Link>
        </div>

        {/* Club Mini Header */}
        {club && (
          <div className="p-6 rounded-3xl bg-surface/50 border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                {club.clubLogo ? (
                  <img src={club.clubLogo} alt={club.clubName} className="w-full h-full object-cover" />
                ) : (
                  <Shield className="w-8 h-8 text-primary" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white">{club.clubName || club.name}</h1>
                  <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                    {club.clubType || 'Club'}
                  </span>
                </div>
                {(club.clubMotto || club.motto) && (
                  <p className="text-xs text-amber-300/80 italic mt-0.5">
                    "{club.clubMotto || club.motto}"
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Lead: <span className="text-gray-200">{club.name}</span> • <span className="text-gray-200">{club.email}</span>
                </p>
              </div>
            </div>

            {/* Event Counter Summary */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-black/30 border border-white/5 text-center">
                <span className="text-lg font-black text-primary">{upcomingEvents.length}</span>
                <p className="text-[10px] uppercase font-bold text-gray-400">Upcoming</p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-black/30 border border-white/5 text-center">
                <span className="text-lg font-black text-gray-300">{pastEvents.length}</span>
                <p className="text-[10px] uppercase font-bold text-gray-400">Past</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 p-1 bg-black/30 rounded-2xl border border-white/10 w-fit">
            <button
              onClick={() => setTab('upcoming')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                tab === 'upcoming'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Upcoming Events ({upcomingEvents.length})</span>
            </button>
            <button
              onClick={() => setTab('past')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                tab === 'past'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Past Events ({pastEvents.length})</span>
            </button>
            <button
              onClick={() => setTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                tab === 'all'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>All ({events.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by event title..."
              className="w-full bg-surface/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((ev, i) => {
              const isPast = new Date(ev.date) < now;
              const fillRate = ev.aimingParticipants > 0
                ? Math.round(((ev.totalBooked || 0) / ev.aimingParticipants) * 100)
                : 0;

              return (
                <motion.div
                  key={ev._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative bg-surface/60 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 flex flex-col"
                >
                  {/* Poster Image */}
                  <div className="relative h-48 w-full bg-black/40 overflow-hidden">
                    {ev.imageUrl ? (
                      <img
                        src={ev.imageUrl}
                        alt={ev.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                        <Calendar className="w-12 h-12 text-gray-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

                    {/* Price Tag */}
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-black backdrop-blur-md bg-black/60 border border-white/10 text-white shadow-lg">
                      {ev.eventType === 'paid' ? `₹${ev.price}` : 'FREE'}
                    </div>

                    {/* Status Tag */}
                    <div className="absolute top-3 left-3">
                      <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border backdrop-blur-md ${
                        isPast
                          ? 'bg-black/60 border-gray-600 text-gray-400'
                          : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      }`}>
                        {isPast ? 'Completed' : 'Upcoming'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-extrabold text-white group-hover:text-primary transition-colors line-clamp-1">
                        {ev.title}
                      </h3>

                      <div className="space-y-1.5 text-xs text-gray-400">
                        <p className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>
                            {new Date(ev.date).toLocaleDateString(undefined, {
                              weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                            })} at {new Date(ev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </p>
                        {ev.location && (
                          <p className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-secondary" />
                            <span className="truncate">{ev.location}</span>
                          </p>
                        )}
                      </div>

                      {ev.description && (
                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed pt-1">
                          {ev.description}
                        </p>
                      )}
                    </div>

                    {/* Booking Stats / Fill Gauge */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-gray-400 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{ev.totalBooked || 0} registered</span>
                        </span>
                        <span className="text-gray-300">
                          Target: {ev.aimingParticipants || 'Open'} ({fillRate}%)
                        </span>
                      </div>

                      <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(fillRate, 100)}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            fillRate >= 80 ? 'bg-emerald-500' : 'bg-primary'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Link
                        to={`/events/${ev._id}`}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-primary" />
                        Details
                      </Link>
                      <Link
                        to="/scanner"
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-semibold transition"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        Verify
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center rounded-3xl bg-surface/30 border border-white/5 p-8">
            <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">
              {tab === 'upcoming' ? 'No Upcoming Events' : 'No Events Found'}
            </h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto mb-4">
              {search
                ? 'No events match your search query.'
                : tab === 'upcoming'
                ? 'This club has not scheduled any upcoming events at the moment.'
                : 'No events have been created for this club yet.'}
            </p>
            {tab !== 'all' && (
              <button
                onClick={() => setTab('all')}
                className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-xl text-xs font-semibold transition"
              >
                View All Club Events
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClubEvents;
