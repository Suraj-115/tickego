import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { 
  X, 
  Users, 
  Download, 
  Search, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Copy, 
  Check, 
  FileSpreadsheet,
  Calendar,
  AlertCircle
} from 'lucide-react';

const ParticipantsModal = ({ event, onClose }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const fetchParticipants = async () => {
    if (!event?._id) return;
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/api/events/${event._id}/participants`);
      setParticipants(res.data?.participants || []);
    } catch (err) {
      console.error('Error fetching participants', err);
      setError(err.response?.data?.message || 'Failed to load participant list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [event?._id]);

  const copyTicketId = (ticketId) => {
    navigator.clipboard.writeText(ticketId);
    setCopiedId(ticketId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter participants
  const filteredParticipants = participants.filter((p) => {
    const term = search.toLowerCase();
    const nameMatch = p.userId?.name?.toLowerCase().includes(term);
    const emailMatch = p.userId?.email?.toLowerCase().includes(term);
    const ticketMatch = p.ticketId?.toLowerCase().includes(term);
    return nameMatch || emailMatch || ticketMatch;
  });

  // Calculate statistics
  const total = participants.length;
  const attended = participants.filter((p) => p.attendanceStatus).length;
  const pending = total - attended;

  // Export to CSV Functionality (Requirement 7: College-level organizer tools)
  const handleExportCSV = () => {
    if (!participants.length) return;

    const headers = ['Serial No', 'Participant Name', 'Participant Email', 'Ticket ID', 'Payment Status', 'Attendance Status', 'Registration Date'];
    
    const rows = participants.map((p, index) => [
      index + 1,
      `"${p.userId?.name || 'N/A'}"`,
      `"${p.userId?.email || 'N/A'}"`,
      `"${p.ticketId || 'N/A'}"`,
      `"${p.paymentStatus || 'free'}"`,
      p.attendanceStatus ? 'Admitted' : 'Pending',
      `"${new Date(p.createdAt).toLocaleString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const sanitizedTitle = (event.title || 'event').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.href = url;
    link.setAttribute('download', `${sanitizedTitle}_participants.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!event) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl bg-surface border border-white/15 rounded-3xl overflow-hidden shadow-2xl text-white my-6 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                  Participant Roster
                </span>
                <span className="text-xs text-gray-400">
                  {event.title}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Registered Participants
              </h2>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={handleExportCSV}
                disabled={participants.length === 0}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs sm:text-sm font-bold transition disabled:opacity-50"
                title="Download CSV"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              <button
                onClick={fetchParticipants}
                disabled={loading}
                className="p-2 bg-white/5 hover:bg-white/15 rounded-xl text-gray-300 hover:text-white transition"
                title="Refresh Roster"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={onClose}
                className="p-2 bg-white/5 hover:bg-white/15 rounded-xl text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 p-4 sm:p-5 bg-black/20 border-b border-white/10 text-center">
            <div className="p-2 sm:p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-xs text-gray-400">Total Registered</div>
              <div className="text-lg sm:text-2xl font-black text-white">{total}</div>
            </div>
            <div className="p-2 sm:p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-xs text-emerald-400">Admitted / Present</div>
              <div className="text-lg sm:text-2xl font-black text-emerald-300">{attended}</div>
            </div>
            <div className="p-2 sm:p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div className="text-xs text-amber-400">Pending Check-in</div>
              <div className="text-lg sm:text-2xl font-black text-amber-300">{pending}</div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-4 sm:p-5 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search participant by student name, email, or ticket ID..."
                className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Participants Table / List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center text-gray-400 gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm">Loading registered participants...</p>
              </div>
            ) : error ? (
              <div className="py-12 text-center text-red-400 space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto" />
                <p className="text-sm">{error}</p>
              </div>
            ) : filteredParticipants.length > 0 ? (
              <div className="space-y-2">
                {/* Desktop Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-white/5">
                  <div className="col-span-1">#</div>
                  <div className="col-span-4">Student Name & Email</div>
                  <div className="col-span-4">Ticket ID</div>
                  <div className="col-span-3 text-right">Status</div>
                </div>

                {/* Participant Rows */}
                {filteredParticipants.map((p, idx) => (
                  <div
                    key={p._id || idx}
                    className="p-3.5 sm:p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-3 md:items-center"
                  >
                    {/* Index */}
                    <div className="hidden md:block col-span-1 text-xs text-gray-400 font-mono">
                      {idx + 1}
                    </div>

                    {/* Name & Email */}
                    <div className="md:col-span-4">
                      <div className="font-bold text-white text-sm">
                        {p.userId?.name || 'Anonymous Student'}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {p.userId?.email || 'No email registered'}
                      </div>
                    </div>

                    {/* Ticket ID */}
                    <div className="md:col-span-4 flex items-center gap-2">
                      <code className="text-xs font-mono bg-black/40 px-2 py-1 rounded text-primary border border-primary/20 truncate max-w-[200px]">
                        {p.ticketId}
                      </code>
                      <button
                        onClick={() => copyTicketId(p.ticketId)}
                        className="p-1 rounded bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition"
                        title="Copy Ticket ID"
                      >
                        {copiedId === p.ticketId ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Status Badges */}
                    <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-2 pt-2 md:pt-0 border-t border-white/5 md:border-0">
                      <span className="text-[11px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                        {p.paymentStatus === 'paid' ? 'Paid' : 'Free'}
                      </span>

                      {p.attendanceStatus ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Admitted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-gray-400 space-y-2">
                <Users className="w-10 h-10 mx-auto text-gray-600" />
                <p className="text-sm font-semibold">No participants found</p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {search ? 'No registered students match your search criteria.' : 'No students have registered for this event yet.'}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-white/10 bg-white/5 flex items-center justify-between text-xs text-gray-400">
            <span>
              Showing {filteredParticipants.length} of {participants.length} total participants
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ParticipantsModal;
