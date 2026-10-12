import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Users, 
  QrCode, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Tag, 
  ExternalLink,
  FileSpreadsheet
} from 'lucide-react';

const ClubEventCard = ({ 
  event, 
  onEdit, 
  onVerifyTickets, 
  onViewParticipants, 
  onDelete 
}) => {
  if (!event) return null;

  const isPaid = (event.price || 0) > 0;
  const eventDate = new Date(event.date);

  const formattedDate = !isNaN(eventDate.getTime())
    ? eventDate.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Date TBA';

  const formattedTime = !isNaN(eventDate.getTime())
    ? eventDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  const totalBooked = event.totalBooked || event.currentParticipants || 0;
  const capacity = event.aimingParticipants || 100;
  const percentageBooked = Math.min(100, Math.round((totalBooked / capacity) * 100));
  const attendedCount = event.attendedCount || 0;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group bg-surface/70 backdrop-blur-xl border border-white/10 hover:border-primary/50 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all flex flex-col justify-between"
    >
      <div>
        {/* Poster Image with overlays */}
        <div className="h-44 sm:h-52 relative overflow-hidden bg-gradient-to-br from-primary/30 via-surface to-secondary/30">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 gap-2">
              <Calendar className="w-12 h-12" />
              <span className="text-xs uppercase tracking-wider font-semibold text-white/60">
                {event.clubName || 'Department Event'}
              </span>
            </div>
          )}

          {/* Top Badges */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between">
            {/* Format badge */}
            <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-full text-[11px] font-bold text-gray-200 uppercase tracking-wide border border-white/15">
              {event.eventType || 'offline'}
            </span>

            {/* Price Badge */}
            <span className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-xs sm:text-sm font-extrabold border border-white/15 shadow-lg">
              {isPaid ? (
                <span className="text-emerald-400">₹{event.price}</span>
              ) : (
                <span className="text-primary">FREE</span>
              )}
            </span>
          </div>

          {/* Bottom Live Attendance Overlay */}
          <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-xs">
            <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md rounded-xl text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1.5 shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{attendedCount} Admitted</span>
            </span>

            <button
              onClick={() => onViewParticipants(event)}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-white font-semibold border border-white/20 flex items-center gap-1 transition text-[11px]"
              title="View attendee list"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Roster</span>
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white line-clamp-1 group-hover:text-primary transition-colors">
              {event.title}
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 mt-1">
              {event.description}
            </p>
          </div>

          {/* Date, Time & Venue */}
          <div className="space-y-2 text-xs sm:text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium text-white">{formattedDate}</span>
              {formattedTime && (
                <span className="text-gray-400">at {formattedTime}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>

          {/* Registration Capacity Progress Bar */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-black/20 border border-white/5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 font-medium">Capacity</span>
              <span className="text-white font-bold">
                {totalBooked} / {capacity} <span className="text-gray-400 font-normal">registered</span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  percentageBooked >= 90 ? 'bg-amber-400' : 'bg-gradient-to-r from-primary to-secondary'
                }`}
                style={{ width: `${percentageBooked}%` }}
              ></div>
            </div>
          </div>

          {/* Category / Theme Tags */}
          {event.categories && event.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {event.categories.map((cat, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-gray-300 capitalize"
                >
                  #{cat}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Action Buttons (Requirement 4: Two buttons - Edit and Verify tickets) */}
      <div className="p-5 sm:p-6 pt-0 space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          {/* Button 1: Edit (Requirement 5) */}
          <button
            onClick={() => onEdit(event)}
            className="w-full py-2.5 px-3 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Edit3 className="w-4 h-4 text-amber-400" />
            <span>Edit</span>
          </button>

          {/* Button 2: Verify tickets (Requirement 6) */}
          <button
            onClick={() => onVerifyTickets(event)}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md shadow-primary/20"
          >
            <QrCode className="w-4 h-4 text-white" />
            <span>Verify tickets</span>
          </button>
        </div>

        {/* Secondary Organizer Options (Participants & Delete) */}
        <div className="flex items-center justify-between pt-1 text-xs text-gray-400">
          <button
            onClick={() => onViewParticipants(event)}
            className="hover:text-white flex items-center gap-1 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>View Roster & CSV</span>
          </button>

          {onDelete && (
            <button
              onClick={() => onDelete(event)}
              className="hover:text-red-400 flex items-center gap-1 transition text-gray-500"
              title="Delete Event"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ClubEventCard;
