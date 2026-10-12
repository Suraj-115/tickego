import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import EventCard from '../components/EventCard';
import ClubEventCard from '../components/ClubEventCard';
import ParticipantsModal from '../components/ParticipantsModal.jsx';
import Navbar from '../components/Navbar';
import TicketModal from '../components/TicketModal';
import { 
  Calendar, 
  BookmarkCheck, 
  Search, 
  Building2, 
  Filter, 
  X, 
  PlusCircle, 
  QrCode, 
  Sparkles,
  RefreshCw,
  Ticket as TicketIcon
} from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab from URL query param ('all' or 'booked')
  const currentTab = searchParams.get('tab') === 'booked' ? 'booked' : 'all';

  // Events & tickets state
  const [events, setEvents] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [clubsList, setClubsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedClub, setSelectedClub] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');

  // Selected ticket for modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Redirect if not authenticated or admin default
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'admin' && !searchParams.has('tab')) {
      navigate('/admin/dashboard');
    }
  }, [user, navigate, searchParams]);

  // Fetch available clubs for club name filter (Requirement 3)
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await api.get('/api/clubs/public');
        setClubsList(res.data || []);
      } catch (err) {
        console.error('Error fetching clubs list', err);
      }
    };
    fetchClubs();
  }, []);

  // Fetch All Events
  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedClub && selectedClub !== 'all') params.append('club', selectedClub);
      if (category && category !== 'all') params.append('category', category);
      if (type && type !== 'all') params.append('type', type);

      const url = user?.role === 'club' 
        ? `/api/events/club/${user._id}`
        : `/api/events?${params.toString()}`;

      const res = await api.get(url);
      
      // Auto-omit passed events (Requirement 5)
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const activeEvents = (res.data || []).filter(e => {
        if (!e.date) return false;
        return new Date(e.date) >= startOfToday;
      });

      setEvents(activeEvents);
    } catch (err) {
      console.error('Error fetching events', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch User's Booked Tickets (Requirement 4)
  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/tickets/my-tickets');
      setMyTickets(res.data || []);
    } catch (err) {
      console.error('Error fetching booked tickets', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data according to current active tab
  useEffect(() => {
    if (!user) return;
    if (currentTab === 'all') {
      fetchAllEvents();
      // Also fetch user's tickets in background so we know which events are booked
      api.get('/api/tickets/my-tickets').then(res => setMyTickets(res.data || [])).catch(() => {});
    } else {
      fetchMyTickets();
    }
  }, [user, currentTab, search, selectedClub, category, type]);

  // Set active tab
  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  // Reset all filters
  const resetFilters = () => {
    setSearch('');
    setSelectedClub('');
    setCategory('');
    setType('');
  };

  // Check if an event is already booked by the user
  const getBookedTicketForEvent = (eventId) => {
    return myTickets.find(t => t.eventId?._id === eventId || t.eventId === eventId);
  };

  // Card action handlers
  const handleEventAction = (event, ticket) => {
    if (ticket) {
      setSelectedTicket(ticket);
    } else {
      navigate(`/events/${event._id}`);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Welcome Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-surface/80 via-surface/50 to-primary/10 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                {user.role === 'club' ? 'Club Organizer' : user.role === 'admin' ? 'Campus Admin' : 'Student'}
              </span>
              <span className="text-xs text-gray-400">Tickego Campus Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Hello, {user.name} 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1 max-w-xl">
              {currentTab === 'all' 
                ? 'Discover and book tickets for upcoming campus club events and workshops.'
                : 'View your confirmed event registrations, access your entry tickets, and scan passes.'}
            </p>
          </div>

          {/* Quick Organizer Actions */}
          {user.role === 'club' && (
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => navigate('/create-event')}
                className="px-4 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" /> Create Event
              </button>
              <button 
                onClick={() => navigate('/scanner')}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold rounded-xl text-xs sm:text-sm transition flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" /> Scan QR
              </button>
            </div>
          )}
        </div>

        {/* Tab Switcher: All Events vs Booked Events (Requirement 2 & 4) */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <button
            onClick={() => setTab('all')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
              currentTab === 'all'
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>All Events</span>
            {currentTab === 'all' && (
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-white/20">
                {events.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab('booked')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
              currentTab === 'booked'
                ? 'bg-secondary text-white shadow-lg shadow-secondary/30'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>Booked Events</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-white/20">
              {myTickets.length}
            </span>
          </button>
        </div>

        {/* ================= ALL EVENTS SECTION ================= */}
        {currentTab === 'all' && (
          <div className="space-y-6">
            {/* Filter Bar (Requirement 3: Filter by club name) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-surface/50 border border-white/10 backdrop-blur-xl shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Filter className="w-4 h-4 text-primary" /> Filter Events
                </div>
                {(search || selectedClub || category || type) && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-primary hover:text-white flex items-center gap-1 font-semibold transition"
                  >
                    <X className="w-3.5 h-3.5" /> Clear Filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Search Text */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by event title..."
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-gray-500"
                  />
                </div>

                {/* Requirement 3: Filter by Club Name */}
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
                  <select
                    value={selectedClub}
                    onChange={(e) => setSelectedClub(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 pl-10 pr-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-surface text-gray-300">All Clubs</option>
                    {clubsList.map((club) => (
                      <option 
                        key={club._id} 
                        value={club.clubName || club.name} 
                        className="bg-surface text-white"
                      >
                        {club.clubName || club.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Event Type Filter */}
                <div>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-surface text-gray-300">All Formats (Offline/Online)</option>
                    <option value="offline" className="bg-surface text-white">Offline (On Campus)</option>
                    <option value="online" className="bg-surface text-white">Online (Virtual)</option>
                    <option value="hybrid" className="bg-surface text-white">Hybrid</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-surface text-gray-300">All Categories</option>
                    <option value="coding" className="bg-surface text-white">Coding / Tech</option>
                    <option value="dance" className="bg-surface text-white">Dance / Cultural</option>
                    <option value="music" className="bg-surface text-white">Music</option>
                    <option value="gaming" className="bg-surface text-white">Gaming / E-Sports</option>
                    <option value="workshop" className="bg-surface text-white">Workshop</option>
                    <option value="sports" className="bg-surface text-white">Sports</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Events Grid in Card Format (Requirement 6 & 7) */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm">Loading active events...</p>
              </div>
            ) : events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => {
                  const bookedTicket = getBookedTicketForEvent(event._id);
                  return user?.role === 'club' || user?.role === 'admin' ? (
                    <ClubEventCard
                      key={event._id}
                      event={event}
                      onEdit={() => handleEdit(event)}
                      onVerifyTickets={() => handleVerifyTickets(event)}
                      onViewParticipants={() => setSelectedEvent(event)}
                      onDelete={() => handleDelete(event)}
                    />
                  ) : (
                    <EventCard
                      key={event._id}
                      event={event}
                      isBooked={Boolean(bookedTicket)}
                      ticket={bookedTicket}
                      role={user?.role}
                      actionLabel={bookedTicket ? 'Show Ticket' : 'Book'}
                      onAction={() => {
                        if (bookedTicket) {
                          setSelectedTicket(bookedTicket);
                        } else {
                          navigate(`/events/${event._id}`);
                        }
                      }}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center rounded-2xl bg-surface/30 border border-white/5 p-8">
                <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No upcoming events found</h3>
                <p className="text-gray-400 text-sm max-w-sm mx-auto mb-4">
                  {selectedClub 
                    ? `No active upcoming events found for ${selectedClub}. Try clearing filters.`
                    : 'No active upcoming events right now. Check back soon for new campus announcements!'}
                </p>
                {(search || selectedClub || category || type) && (
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= BOOKED EVENTS SECTION (Requirement 4 & 9) ================= */}
        {currentTab === 'booked' && (
          <div className="space-y-6">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-secondary" />
                <p className="text-sm">Loading your booked events...</p>
              </div>
            ) : myTickets.length > 0 ? (
              <div className="space-y-4">
                <div className="text-xs text-gray-400 font-medium">
                  Showing {myTickets.length} confirmed event {myTickets.length === 1 ? 'ticket' : 'tickets'}. Click <strong>Show Ticket</strong> to display your entry pass and unique ID.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myTickets.map((t) => (
                    <EventCard
                      key={t._id}
                      event={t.eventId}
                      isBooked={true}
                      ticket={t}
                      role={user.role}
                      actionLabel="Show Ticket"
                      onAction={() => setSelectedTicket(t)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center rounded-2xl bg-surface/30 border border-white/5 p-8">
                <BookmarkCheck className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No booked events yet</h3>
                <p className="text-gray-400 text-sm max-w-sm mx-auto mb-4">
                  You haven't booked any tickets yet. Explore upcoming campus events in the All Events tab to register!
                </p>
                <button
                  onClick={() => setTab('all')}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition"
                >
                  Browse All Events
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Ticket Modal (Requirement 9: Show Ticket) */}
      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}

      {/* Participants Roster Modal */}
      {selectedEvent && (
        <ParticipantsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
