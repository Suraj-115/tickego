import React from 'react';
import {
  Shield, Edit2, Trash2, Calendar, BarChart3,
  Users, TrendingUp, ExternalLink
} from 'lucide-react';

const AdminClubCard = ({ club, onEdit, onDelete, onViewEvents, onViewStats }) => {
  const typeColors = {
    technical: 'from-blue-500 to-cyan-500',
    coding: 'from-emerald-500 to-green-500',
    cultural: 'from-pink-500 to-rose-500',
    sports: 'from-orange-500 to-amber-500',
    music: 'from-purple-500 to-violet-500',
    drama: 'from-red-500 to-pink-500',
    social: 'from-teal-500 to-cyan-500',
    health: 'from-lime-500 to-green-500',
    literary: 'from-indigo-500 to-blue-500',
    photography: 'from-fuchsia-500 to-pink-500',
    robotics: 'from-slate-500 to-zinc-500',
    other: 'from-gray-500 to-slate-500',
  };

  const gradient = typeColors[club.clubType] || typeColors.other;

  return (
    <div className="group relative bg-surface/60 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
      {/* Top gradient accent */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />

      <div className="p-5 space-y-4">
        {/* Club Header */}
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden shrink-0 border border-white/5">
            {club.clubLogo ? (
              <img src={club.clubLogo} alt={club.clubName} className="w-full h-full object-cover" />
            ) : (
              <Shield className="w-7 h-7 text-gray-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-extrabold text-white truncate">{club.clubName || club.name}</h3>
            <p className="text-xs text-gray-400 truncate">Head: {club.name}</p>
            <span className={`inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${gradient} text-white`}>
              {club.clubType || 'Club'}
            </span>
          </div>
        </div>

        {/* Description */}
        {club.clubDescription && (
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
            {club.clubDescription}
          </p>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-black/20 border border-white/5">
            <Calendar className="w-3.5 h-3.5 mx-auto text-primary mb-1" />
            <p className="text-sm font-bold text-white">{club.totalEvents || 0}</p>
            <p className="text-[10px] text-gray-500">Events</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-black/20 border border-white/5">
            <Users className="w-3.5 h-3.5 mx-auto text-emerald-400 mb-1" />
            <p className="text-sm font-bold text-white">{club.totalRegistrations || 0}</p>
            <p className="text-[10px] text-gray-500">Registrations</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-black/20 border border-white/5">
            <TrendingUp className="w-3.5 h-3.5 mx-auto text-amber-400 mb-1" />
            <p className="text-sm font-bold text-white">{club.upcomingEvents || 0}</p>
            <p className="text-[10px] text-gray-500">Upcoming</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition"
          >
            <Edit2 className="w-3.5 h-3.5 text-blue-400" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
          <button
            onClick={onViewEvents}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-semibold transition"
          >
            <Calendar className="w-3.5 h-3.5" />
            Events
          </button>
          <button
            onClick={onViewStats}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 text-xs font-semibold transition"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Statistics
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminClubCard;
