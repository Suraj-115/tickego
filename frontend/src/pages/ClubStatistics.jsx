import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import Navbar from '../components/Navbar';
import {
  ArrowLeft, Shield, Calendar, Users, TrendingUp, Award,
  CheckCircle2, AlertTriangle, Star, Download, BarChart2,
  DollarSign, Activity, Sparkles, Filter, Search, Clock,
  MapPin, Ticket, ExternalLink, ChevronRight, PieChart, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

const ClubStatistics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters for events list
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'past', 'upcoming'
  const [perfFilter, setPerfFilter] = useState('all'); // 'all', 'excellent', 'good', 'average', 'poor'

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchStatistics();
  }, [id, user, navigate]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/api/clubs/${id}/statistics`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load club statistics', err);
      setError(err.response?.data?.message || 'Failed to load club statistics');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!data || !data.events || data.events.length === 0) {
      alert('No event data available to export');
      return;
    }

    const headers = [
      'Event Name',
      'Date',
      'Venue',
      'Type',
      'Aiming/Expected Participants',
      'Total Registered',
      'Actual Attended',
      'Fill Rate (%)',
      'Attendance Rate (%)',
      'Revenue (INR)',
      'Performance Verdict'
    ];

    const rows = data.events.map(ev => [
      `"${ev.title.replace(/"/g, '""')}"`,
      new Date(ev.date).toLocaleDateString(),
      `"${(ev.location || '').replace(/"/g, '""')}"`,
      ev.eventType || 'Free',
      ev.aimingParticipants || 0,
      ev.totalBooked || 0,
      ev.attended || 0,
      `${ev.fillRate}%`,
      `${ev.attendanceRate}%`,
      ev.revenue || 0,
      ev.performance ? ev.performance.toUpperCase() : 'PENDING'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${(data.club?.clubName || 'club').replace(/\s+/g, '_')}_statistics_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPerformanceBadge = (perf, isPast) => {
    if (!isPast) {
      return {
        label: 'Upcoming Event',
        color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        icon: <Clock className="w-3.5 h-3.5" />,
        analysis: 'Registrations are currently open for this event.'
      };
    }
    switch (perf) {
      case 'excellent':
        return {
          label: 'Blockbuster 🌟',
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          icon: <Star className="w-3.5 h-3.5 fill-emerald-400" />,
          analysis: 'Outstanding performance! High attendance and target exceeded.'
        };
      case 'good':
        return {
          label: 'Successful 👍',
          color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          analysis: 'Healthy participant turnout and solid engagement achieved.'
        };
      case 'average':
        return {
          label: 'Moderate 😐',
          color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          icon: <Activity className="w-3.5 h-3.5" />,
          analysis: 'Satisfactory turnout, but could benefit from broader promotion.'
        };
      case 'poor':
      default:
        return {
          label: 'Needs Attention ⚠️',
          color: 'bg-red-500/10 text-red-400 border-red-500/20',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          analysis: 'Low attendance or high drop-off rate detected.'
        };
    }
  };

  const getHealthGrade = (score) => {
    if (score >= 85) return { grade: 'A+ Elite', color: 'from-emerald-400 to-green-500', desc: 'Outstanding active club with exceptional participation' };
    if (score >= 70) return { grade: 'A Strong', color: 'from-blue-400 to-cyan-500', desc: 'Consistently hosts successful events with good engagement' };
    if (score >= 50) return { grade: 'B Moderate', color: 'from-amber-400 to-orange-500', desc: 'Active organization with room for turnout growth' };
    return { grade: 'C Action Needed', color: 'from-red-400 to-rose-500', desc: 'Underperforming engagement or irregular event frequency' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3">
          <RefreshCw className="w-10 h-10 animate-spin text-primary" />
          <p className="text-gray-400 text-sm">Analyzing club performance & events data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Club Statistics Unavailable</h2>
          <p className="text-gray-400 text-sm mb-6">{error || 'Could not find details for this club.'}</p>
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary rounded-xl font-semibold hover:bg-primary/90 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { club, summary, performanceDistribution, monthlyTrend, events, categoryBreakdown } = data;
  const health = getHealthGrade(summary.healthScore || 0);

  // Filter events
  const filteredEvents = (events || []).filter(ev => {
    const matchesSearch = !search ||
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      (ev.location || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesTime = timeFilter === 'all'
      ? true
      : timeFilter === 'past'
      ? ev.isPast
      : !ev.isPast;

    const matchesPerf = perfFilter === 'all'
      ? true
      : ev.performance === perfFilter;

    return matchesSearch && matchesTime && matchesPerf;
  });

  return (
    <div className="min-h-screen bg-background text-white flex flex-col selection:bg-primary selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-gray-300 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Clubs
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface hover:bg-white/10 border border-white/10 text-sm font-semibold text-gray-300 hover:text-white transition shadow-sm"
              title="Download club audit CSV report"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <Link
              to={`/admin/clubs/${club._id}/events`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-sm font-bold text-white shadow-lg shadow-primary/30 transition"
            >
              <Calendar className="w-4 h-4" />
              <span>Upcoming Events ({summary.upcomingEvents || 0})</span>
            </Link>
          </div>
        </div>

        {/* Club Profile Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface via-surface/80 to-surface/40 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-black/40 border border-white/10 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                {club.clubLogo ? (
                  <img src={club.clubLogo} alt={club.clubName} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <Shield className="w-10 h-10 text-primary" />
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {club.clubName || club.name}
                  </h1>
                  <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">
                    {club.clubType || 'Club'}
                  </span>
                </div>
                {(club.clubMotto || club.motto) && (
                  <p className="text-sm text-amber-300/90 italic flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    "{club.clubMotto || club.motto}"
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 pt-1">
                  <span>Head: <strong className="text-gray-200">{club.name}</strong></span>
                  <span>Email: <strong className="text-gray-200">{club.email}</strong></span>
                  {club.createdAt && (
                    <span>Est: <strong className="text-gray-200">{new Date(club.createdAt).toLocaleDateString()}</strong></span>
                  )}
                </div>
              </div>
            </div>

            {/* Overall Health Score Card */}
            <div className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-black/30 border border-white/10 shrink-0">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-white/10"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-primary transition-all duration-1000 ease-out"
                    strokeDasharray={`${summary.healthScore || 0}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg sm:text-xl font-black text-white">{summary.healthScore || 0}</span>
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">/ 100</span>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">Health Rating</p>
                <p className={`text-base sm:text-lg font-black bg-gradient-to-r ${health.color} bg-clip-text text-transparent`}>
                  {health.grade}
                </p>
                <p className="text-[11px] text-gray-400 max-w-[180px] leading-tight mt-0.5">
                  {health.desc}
                </p>
              </div>
            </div>
          </div>

          {club.clubDescription && (
            <div className="mt-5 pt-5 border-t border-white/10">
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-4xl">
                {club.clubDescription}
              </p>
            </div>
          )}
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Total Events */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface/50 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400">Total Events</span>
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">{summary.totalEvents || 0}</p>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-400">
              <span className="text-emerald-400 font-semibold">{summary.upcomingEvents || 0} upcoming</span>
              <span>•</span>
              <span>{summary.pastEvents || 0} completed</span>
            </div>
          </div>

          {/* Card 2: Total Registrations */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface/50 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400">Total Registrations</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">{summary.totalRegistrations || 0}</p>
            <p className="text-[11px] text-gray-400 mt-2">
              Avg {summary.totalEvents > 0 ? Math.round(summary.totalRegistrations / summary.totalEvents) : 0} per event
            </p>
          </div>

          {/* Card 3: Actual Attendance */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface/50 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400">Turnout / Attendance</span>
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">{summary.avgAttendanceRate || 0}%</p>
            <p className="text-[11px] text-gray-400 mt-2">
              {summary.totalAttendees || 0} checked-in participants
            </p>
          </div>

          {/* Card 4: Average Fill Rate */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface/50 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400">Target Fill Rate</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">{summary.avgFillRate || 0}%</p>
            <p className="text-[11px] text-gray-400 mt-2">
              Capacity booked vs targeted
            </p>
          </div>

          {/* Card 5: Revenue Generated */}
          <div className="col-span-2 lg:col-span-1 p-4 sm:p-5 rounded-2xl bg-surface/50 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400">Total Revenue</span>
              <DollarSign className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">₹{summary.totalRevenue || 0}</p>
            <p className="text-[11px] text-gray-400 mt-2">
              Ticket sales for paid events
            </p>
          </div>
        </div>

        {/* Performance Distribution & Monthly Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Verdict Distribution Card */}
          <div className="p-6 rounded-2xl bg-surface/50 border border-white/10 backdrop-blur-xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" /> Event Performance Audit
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Automated rating based on target fill & attendance</p>
              </div>
            </div>

            {/* Segmented Distribution Bar */}
            {summary.totalEvents > 0 ? (
              <>
                <div className="h-3 w-full rounded-full bg-black/40 overflow-hidden flex">
                  <div
                    style={{ width: `${(performanceDistribution.excellent / summary.totalEvents) * 100}%` }}
                    className="bg-emerald-500 h-full transition-all duration-500"
                    title={`Excellent: ${performanceDistribution.excellent}`}
                  />
                  <div
                    style={{ width: `${(performanceDistribution.good / summary.totalEvents) * 100}%` }}
                    className="bg-blue-500 h-full transition-all duration-500"
                    title={`Good: ${performanceDistribution.good}`}
                  />
                  <div
                    style={{ width: `${(performanceDistribution.average / summary.totalEvents) * 100}%` }}
                    className="bg-amber-500 h-full transition-all duration-500"
                    title={`Average: ${performanceDistribution.average}`}
                  />
                  <div
                    style={{ width: `${(performanceDistribution.poor / summary.totalEvents) * 100}%` }}
                    className="bg-red-500 h-full transition-all duration-500"
                    title={`Poor: ${performanceDistribution.poor}`}
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-black/20 border border-emerald-500/10">
                    <span className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-emerald-400" /> Blockbuster (80%+ Fill & 70%+ Turnout)
                    </span>
                    <strong className="text-white font-bold">{performanceDistribution.excellent}</strong>
                  </div>

                  <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-black/20 border border-blue-500/10">
                    <span className="flex items-center gap-2 text-blue-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Successful (60%+ Fill & 50%+ Turnout)
                    </span>
                    <strong className="text-white font-bold">{performanceDistribution.good}</strong>
                  </div>

                  <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-black/20 border border-amber-500/10">
                    <span className="flex items-center gap-2 text-amber-400 font-semibold">
                      <Activity className="w-3.5 h-3.5" /> Moderate (Satisfactory Participation)
                    </span>
                    <strong className="text-white font-bold">{performanceDistribution.average}</strong>
                  </div>

                  <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-black/20 border border-red-500/10">
                    <span className="flex items-center gap-2 text-red-400 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" /> Needs Attention (&lt;30% Target / Low Turnout)
                    </span>
                    <strong className="text-white font-bold">{performanceDistribution.poor}</strong>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-xs text-gray-400">
                No completed events to analyze yet.
              </div>
            )}
          </div>

          {/* 12-Month Trends Visualization */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-surface/50 border border-white/10 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-primary" /> Activity & Registrations (Past 12 Months)
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Monthly distribution of hosted events and registrations</p>
              </div>
            </div>

            {/* Custom Bar Graph */}
            {monthlyTrend && monthlyTrend.length > 0 ? (
              <div className="pt-4">
                <div className="h-44 flex items-end justify-between gap-1 sm:gap-2 px-2 pb-2 border-b border-white/10">
                  {monthlyTrend.map((m, idx) => {
                    const maxReg = Math.max(...monthlyTrend.map(t => t.registrations), 10);
                    const heightPercent = Math.max((m.registrations / maxReg) * 100, m.events > 0 ? 15 : 4);
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                        {/* Hover Tooltip */}
                        <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-black/90 border border-white/20 text-white rounded-lg px-2.5 py-1 text-[10px] whitespace-nowrap z-20 shadow-xl">
                          <p className="font-bold text-primary">{m.month}</p>
                          <p>{m.events} Events • {m.registrations} Registrations</p>
                          <p>{m.attended} Attended</p>
                        </div>

                        {/* Bar */}
                        <div className="w-full max-w-[28px] h-36 flex items-end">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full rounded-t-md transition-all duration-500 ${
                              m.events > 0
                                ? 'bg-gradient-to-t from-primary/60 to-primary group-hover:brightness-125'
                                : 'bg-white/5'
                            }`}
                          />
                        </div>
                        {/* Month Label */}
                        <span className="text-[10px] text-gray-500 truncate w-full text-center">
                          {m.month.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between pt-3 text-xs text-gray-400">
                  <span>Last 12 Months Activity</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-primary" /> Active Month</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-white/10" /> Inactive</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Detailed Events Analysis Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" /> Event-by-Event Analysis
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Expected vs actual participants, fill rates, and performance breakdown
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search events..."
                  className="bg-surface border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              {/* Time filter */}
              <select
                value={timeFilter}
                onChange={e => setTimeFilter(e.target.value)}
                className="bg-surface border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="all">All Events</option>
                <option value="past">Past Events ({summary.pastEvents || 0})</option>
                <option value="upcoming">Upcoming Events ({summary.upcomingEvents || 0})</option>
              </select>

              {/* Performance filter */}
              <select
                value={perfFilter}
                onChange={e => setPerfFilter(e.target.value)}
                className="bg-surface border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="all">All Ratings</option>
                <option value="excellent">Blockbuster 🌟</option>
                <option value="good">Successful 👍</option>
                <option value="average">Moderate 😐</option>
                <option value="poor">Needs Attention ⚠️</option>
              </select>
            </div>
          </div>

          {/* Events List / Cards */}
          {filteredEvents.length > 0 ? (
            <div className="space-y-3">
              {filteredEvents.map((ev) => {
                const badge = getPerformanceBadge(ev.performance, ev.isPast);
                return (
                  <motion.div
                    key={ev._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-surface/50 border border-white/10 hover:border-white/20 backdrop-blur-xl transition shadow-lg space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Event Main Info */}
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                          {ev.imageUrl ? (
                            <img src={ev.imageUrl} alt={ev.title} className="w-full h-full object-cover" />
                          ) : (
                            <Calendar className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-white">{ev.title}</h3>
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${badge.color} flex items-center gap-1`}>
                              {badge.icon} {badge.label}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300">
                              {ev.eventType === 'paid' ? `₹${ev.price}` : 'Free'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-primary" />
                              {new Date(ev.date).toLocaleDateString()} at {new Date(ev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {ev.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-secondary" /> {ev.location}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 italic pt-0.5">{badge.analysis}</p>
                        </div>
                      </div>

                      {/* Expected vs Actual & Rates */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/20 p-3 rounded-xl border border-white/5 shrink-0">
                        {/* Expected */}
                        <div className="text-center px-2">
                          <p className="text-[10px] uppercase font-bold text-gray-500">Expected</p>
                          <p className="text-base font-black text-white">{ev.aimingParticipants || 0}</p>
                          <p className="text-[10px] text-gray-400">Target</p>
                        </div>

                        {/* Registered */}
                        <div className="text-center px-2">
                          <p className="text-[10px] uppercase font-bold text-gray-500">Registered</p>
                          <p className="text-base font-black text-emerald-400">{ev.totalBooked || 0}</p>
                          <p className="text-[10px] text-emerald-400/80 font-semibold">{ev.fillRate}% fill</p>
                        </div>

                        {/* Attended */}
                        <div className="text-center px-2">
                          <p className="text-[10px] uppercase font-bold text-gray-500">Attended</p>
                          <p className="text-base font-black text-blue-400">{ev.attended || 0}</p>
                          <p className="text-[10px] text-blue-400/80 font-semibold">{ev.attendanceRate}% turnout</p>
                        </div>

                        {/* Revenue */}
                        <div className="text-center px-2">
                          <p className="text-[10px] uppercase font-bold text-gray-500">Revenue</p>
                          <p className="text-base font-black text-purple-400">₹{ev.revenue || 0}</p>
                          <p className="text-[10px] text-gray-400">Generated</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Fill Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-gray-400 font-semibold">
                        <span>Registration Fill Rate ({ev.totalBooked} / {ev.aimingParticipants} aimed)</span>
                        <span className={ev.fillRate >= 80 ? 'text-emerald-400' : 'text-gray-300'}>
                          {ev.fillRate}% {ev.fillRate >= 100 ? '(Full Capacity)' : ''}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(ev.fillRate, 100)}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            ev.fillRate >= 80 ? 'bg-emerald-500' : ev.fillRate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center rounded-2xl bg-surface/30 border border-white/5 p-8">
              <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No events match the filter</h3>
              <p className="text-gray-400 text-sm max-w-sm mx-auto mb-4">
                Try adjusting your search query or filter settings.
              </p>
              {(search || timeFilter !== 'all' || perfFilter !== 'all') && (
                <button
                  onClick={() => { setSearch(''); setTimeFilter('all'); setPerfFilter('all'); }}
                  className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-xl text-xs font-semibold transition"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClubStatistics;
