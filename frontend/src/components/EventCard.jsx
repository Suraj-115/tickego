import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Ticket as TicketIcon, 
  QrCode, 
  Sparkles,
  Building2,
  CheckCircle2
} from 'lucide-react';

const EventCard = ({ 
  event, 
  onAction, 
  actionLabel = 'Book', 
  isBooked = false,
  ticket = null,
  role = 'student' 
}) => {
  if (!event) return null;

  const isPaid = event.price > 0;
  const clubName = event.clubId?.clubName || event.clubId?.name || 'College Club';
  const eventDate = new Date(event.date);

  // Formatted date string
  const formattedDate = !isNaN(eventDate.getTime()) 
    ? eventDate.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Date TBA';

  return (
    <motion.div 
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group bg-surface/60 backdrop-blur-xl border border-white/10 hover:border-primary/40 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all flex flex-col justify-between"
    >
      <div>
        {/* Banner Image or Gradient Fallback */}
        <div className="h-44 sm:h-48 relative overflow-hidden bg-gradient-to-br from-primary/30 via-surface to-secondary/30">
          {event.imageUrl ? (
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 gap-2">
              <Calendar className="w-12 h-12" />
              <span className="text-xs uppercase tracking-wider font-semibold text-white/50">{clubName}</span>
            </div>
          )}

          {/* Price Badge */}
          <div className="absolute top-3 right-3 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-xs sm:text-sm font-bold text-white border border-white/15 shadow-lg flex items-center gap-1">
            {isPaid ? (
              <span className="text-emerald-400 font-extrabold">₹{event.price}</span>
            ) : (
              <span className="text-primary font-extrabold">FREE</span>
            )}
          </div>

          {/* Event Type Badge */}
          {event.eventType && (
            <div className="absolute top-3 left-3 px-2.5 py-0.5 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-semibold text-gray-200 uppercase tracking-wide border border-white/10">
              {event.eventType}
            </div>
          )}

          {/* Booked Indicator Badge */}
          {isBooked && (
            <div className="absolute bottom-3 left-3 px-3 py-1 bg-emerald-500/90 backdrop-blur-md rounded-full text-xs font-bold text-white shadow-lg flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Booked
            </div>
          )}
        </div>
        
        {/* Card Body */}
        <div className="p-5">
          {/* Club Name Badge */}
          <div className="flex items-center gap-1.5 text-xs text-primary font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span className="truncate">{clubName}</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          
          <p className="text-gray-400 text-xs sm:text-sm mb-4 line-clamp-2">
            {event.description}
          </p>
          
          {/* Event Details metadata */}
          <div className="space-y-2 mb-4 text-xs sm:text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">{formattedDate}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>

            {(role === 'club' || role === 'admin') && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-secondary shrink-0" />
                <span>{event.currentParticipants || 0} / {event.aimingParticipants} participants</span>
              </div>
            )}
          </div>

          {/* Category Tags */}
          {event.categories && event.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {event.categories.slice(0, 3).map((cat, idx) => (
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

      {/* Card Action Button */}
      <div className="p-5 pt-0">
        {isBooked ? (
          /* Requirement 9: In booked events, event card has a button to show the ticket rather than book */
          <button 
            onClick={() => onAction(event, ticket)}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            <span>Show Ticket</span>
          </button>
        ) : (
          /* Requirement 7: Each card has a Book button */
          <button 
            onClick={() => onAction(event)}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2"
          >
            <TicketIcon className="w-4 h-4" />
            <span>{actionLabel}</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default EventCard;
