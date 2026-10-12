import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Copy, 
  Check, 
  QrCode, 
  Calendar, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  Ticket as TicketIcon
} from 'lucide-react';

const TicketModal = ({ ticket, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!ticket) return null;

  const event = ticket.eventId || {};
  const club = event.clubId || {};
  const clubName = club.clubName || club.name || 'College Club';
  const eventDate = event.date ? new Date(event.date) : null;

  const formattedDate = eventDate && !isNaN(eventDate.getTime())
    ? eventDate.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Date TBA';

  const copyTicketId = () => {
    if (ticket.ticketId) {
      navigator.clipboard.writeText(ticket.ticketId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-surface border border-white/15 rounded-3xl overflow-hidden shadow-2xl text-white my-8"
        >
          {/* Header banner */}
          <div className="relative bg-gradient-to-r from-primary via-indigo-600 to-secondary p-6 text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition focus:outline-none"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-xs font-semibold mb-2">
              <TicketIcon className="w-3.5 h-3.5 text-secondary" />
              <span>OFFICIAL EVENT PASS</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight">{event.title || 'Event Ticket'}</h2>
            <p className="text-xs text-white/80 mt-1 flex items-center justify-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> Organized by {clubName}
            </p>
          </div>

          {/* Ticket Body */}
          <div className="p-6 space-y-6">
            {/* Status Banner */}
            <div className={`flex items-center justify-center gap-2 p-3 rounded-2xl text-xs sm:text-sm font-bold border ${
              ticket.attendanceStatus
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              {ticket.attendanceStatus ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>Participant Entered (Ticket Used)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valid Entry Pass (Ready for Check-in)</span>
                </>
              )}
            </div>

            {/* QR Code Centerpiece */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-white/20 shadow-inner">
              {ticket.qrDataURI ? (
                <img 
                  src={ticket.qrDataURI} 
                  alt="Ticket QR Code" 
                  className="w-48 h-48 object-contain"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-gray-500">
                  <QrCode className="w-24 h-24" />
                </div>
              )}
              <span className="text-[11px] font-semibold text-gray-600 mt-2">
                Scan QR at the venue for instant entry
              </span>
            </div>

            {/* Unique Ticket ID Box */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span className="font-medium">Unique Ticket ID</span>
                <button
                  onClick={copyTicketId}
                  className="flex items-center gap-1 text-primary hover:text-white transition font-semibold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy ID'}</span>
                </button>
              </div>
              <p className="font-mono text-xs sm:text-sm text-gray-100 break-all select-all font-semibold">
                {ticket.ticketId}
              </p>
            </div>

            {/* Event Info Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> Date
                </span>
                <p className="font-semibold text-white">{formattedDate}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> Venue
                </span>
                <p className="font-semibold text-white truncate">{event.location || 'College Campus'}</p>
              </div>
            </div>

            {/* Footer Close */}
            <button
              onClick={onClose}
              className="w-full py-3 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold rounded-xl text-sm transition"
            >
              Done / Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TicketModal;
