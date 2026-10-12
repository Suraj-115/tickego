import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import AdminClubCard from '../components/AdminClubCard';
import EditClubModal from '../components/EditClubModal';
import {
  Shield, PlusCircle, Layers, Search, RefreshCw,
  Building2, Users, Calendar, TrendingUp, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentTab = searchParams.get('tab') === 'create' ? 'create' : 'clubs';

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [editingClub, setEditingClub] = useState(null);

  // Create Club form state
  const [createForm, setCreateForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    clubName: '', clubLogo: '', clubDescription: '', clubType: 'technical',
    motto: ''
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role === 'admin' && currentTab === 'clubs') {
      fetchClubs();
    }
  }, [user, currentTab]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/clubs');
      setClubs(res.data || []);
    } catch (err) {
      console.error('Error fetching clubs', err);
    } finally {
      setLoading(false);
    }
  };

  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  const handleDelete = async (clubId) => {
    if (!window.confirm('Are you sure you want to delete this club? All associated events and tickets will be permanently removed.')) return;
    try {
      await api.delete(`/api/clubs/${clubId}`);
      fetchClubs();
    } catch (err) {
      alert('Error deleting club');
    }
  };

  const handleUpdateClub = async (clubId, data) => {
    try {
      await api.put(`/api/clubs/${clubId}`, data);
      setEditingClub(null);
      fetchClubs();
    } catch (err) {
      alert('Error updating club');
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    if (createForm.password !== createForm.confirmPassword) {
      setCreateError('Passwords do not match');
      return;
    }
    if (createForm.password.length < 6) {
      setCreateError('Password must be at least 6 characters');
      return;
    }

    try {
      setCreateLoading(true);
      await api.post('/api/auth/create-club', {
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
        clubName: createForm.clubName,
        clubLogo: createForm.clubLogo,
        clubDescription: createForm.clubDescription,
        clubType: createForm.clubType,
        motto: createForm.motto,
      });
      setCreateSuccess('Club created successfully!');
      setCreateForm({
        name: '', email: '', password: '', confirmPassword: '',
        clubName: '', clubLogo: '', clubDescription: '', clubType: 'technical',
        motto: ''
      });
      setTimeout(() => {
        setTab('clubs');
        setCreateSuccess('');
      }, 1500);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Error creating club');
    } finally {
      setCreateLoading(false);
    }
  };

  // Filter clubs
  const filteredClubs = clubs.filter(club => {
    const matchesSearch = !search ||
      (club.clubName || club.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (club.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || club.clubType === typeFilter;
    return matchesSearch && matchesType;
  });

  // Aggregate stats
  const totalClubs = clubs.length;
  const totalEvents = clubs.reduce((sum, c) => sum + (c.totalEvents || 0), 0);
  const totalRegistrations = clubs.reduce((sum, c) => sum + (c.totalRegistrations || 0), 0);
  const upcomingEvents = clubs.reduce((sum, c) => sum + (c.upcomingEvents || 0), 0);

  const clubTypes = [...new Set(clubs.map(c => c.clubType).filter(Boolean))];

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Shield className="w-5 h-5 text-white" />
              </div>
              Admin Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-1">Manage all clubs and organizations</p>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Total Clubs', value: totalClubs, icon: Building2, color: 'from-primary to-indigo-600', shadow: 'shadow-primary/20' },
            { label: 'Total Events', value: totalEvents, icon: Calendar, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
            { label: 'Registrations', value: totalRegistrations, icon: Users, color: 'from-purple-500 to-fuchsia-500', shadow: 'shadow-purple-500/20' },
            { label: 'Upcoming', value: upcomingEvents, icon: TrendingUp, color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-4 rounded-2xl bg-surface/50 border border-white/10 backdrop-blur-xl shadow-lg ${stat.shadow}`}
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-4.5 h-4.5 text-white" />
              </div>
              <p className="text-2xl font-extrabold text-white">{stat.value}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <button
            onClick={() => setTab('clubs')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
              currentTab === 'clubs'
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Current Clubs</span>
            {currentTab === 'clubs' && (
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-white/20">
                {filteredClubs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab('create')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
              currentTab === 'create'
                ? 'bg-secondary text-white shadow-lg shadow-secondary/30'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Club</span>
          </button>
        </div>

        {/* =============== CURRENT CLUBS TAB =============== */}
        {currentTab === 'clubs' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-surface/50 border border-white/10 backdrop-blur-xl shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Search className="w-4 h-4 text-primary" /> Search & Filter
                </div>
                {(search || typeFilter) && (
                  <button
                    onClick={() => { setSearch(''); setTypeFilter(''); }}
                    className="text-xs text-primary hover:text-white flex items-center gap-1 font-semibold transition"
                  >
                    <X className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by club name or email..."
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-gray-500"
                  />
                </div>
                <div>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-surface text-gray-300">All Types</option>
                    {clubTypes.map(t => (
                      <option key={t} value={t} className="bg-surface text-white capitalize">{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Clubs Grid */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm">Loading clubs...</p>
              </div>
            ) : filteredClubs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClubs.map((club, i) => (
                  <motion.div
                    key={club._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <AdminClubCard
                      club={club}
                      onEdit={() => setEditingClub(club)}
                      onDelete={() => handleDelete(club._id)}
                      onViewEvents={() => navigate(`/admin/clubs/${club._id}/events`)}
                      onViewStats={() => navigate(`/admin/clubs/${club._id}/statistics`)}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center rounded-2xl bg-surface/30 border border-white/5 p-8">
                <Building2 className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No clubs found</h3>
                <p className="text-gray-400 text-sm max-w-sm mx-auto mb-4">
                  {search || typeFilter
                    ? 'No clubs match your search criteria. Try clearing the filters.'
                    : 'No clubs have been created yet. Create your first club to get started!'}
                </p>
                {!search && !typeFilter && (
                  <button
                    onClick={() => setTab('create')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 rounded-xl text-white font-semibold transition"
                  >
                    <PlusCircle className="w-4 h-4" /> Create First Club
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* =============== CREATE CLUB TAB =============== */}
        {currentTab === 'create' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="p-6 sm:p-8 rounded-2xl bg-surface/50 border border-white/10 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <PlusCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white">Create New Club</h2>
                  <p className="text-sm text-gray-400">Fill in all the details to register a new club/department</p>
                </div>
              </div>

              {createError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
                  {createError}
                </div>
              )}
              {createSuccess && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-medium">
                  {createSuccess}
                </div>
              )}

              <form onSubmit={handleCreateClub} className="space-y-5">
                {/* Club Identity Section */}
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">Club Identity</h3>
                  <p className="text-xs text-gray-500">Basic information about the club</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Club / Department Name *</label>
                    <input
                      type="text"
                      required
                      value={createForm.clubName}
                      onChange={e => setCreateForm({ ...createForm, clubName: e.target.value })}
                      placeholder="e.g. Coding Club"
                      className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Club Type *</label>
                    <select
                      value={createForm.clubType}
                      onChange={e => setCreateForm({ ...createForm, clubType: e.target.value })}
                      className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                    >
                      <option value="technical">Technical</option>
                      <option value="coding">Coding</option>
                      <option value="cultural">Cultural</option>
                      <option value="sports">Sports</option>
                      <option value="music">Music</option>
                      <option value="drama">Drama</option>
                      <option value="social">Social</option>
                      <option value="health">Health & Wellness</option>
                      <option value="literary">Literary</option>
                      <option value="photography">Photography</option>
                      <option value="robotics">Robotics</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Club Logo URL</label>
                  <input
                    type="url"
                    value={createForm.clubLogo}
                    onChange={e => setCreateForm({ ...createForm, clubLogo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-gray-500"
                  />
                </div>

                {createForm.clubLogo && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
                    <img src={createForm.clubLogo} alt="Preview" className="w-14 h-14 rounded-lg object-cover border border-white/10" onError={(e) => e.target.style.display = 'none'} />
                    <span className="text-xs text-gray-400">Logo Preview</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={createForm.clubDescription}
                    onChange={e => setCreateForm({ ...createForm, clubDescription: e.target.value })}
                    placeholder="Brief description of the club's mission, activities, and goals..."
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-gray-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Motto</label>
                  <input
                    type="text"
                    value={createForm.motto}
                    onChange={e => setCreateForm({ ...createForm, motto: e.target.value })}
                    placeholder="e.g. Code, Create, Conquer"
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-gray-500"
                  />
                </div>

                {/* Club Head Login Section */}
                <div className="pt-4 border-t border-white/10 space-y-1">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">Club Head Login Credentials</h3>
                  <p className="text-xs text-gray-500">These will be used by the club head to log in</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Head Name *</label>
                    <input
                      type="text"
                      required
                      value={createForm.name}
                      onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Login Email *</label>
                    <input
                      type="email"
                      required
                      value={createForm.email}
                      onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                      placeholder="club@college.edu"
                      className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Password *</label>
                    <input
                      type="password"
                      required
                      value={createForm.password}
                      onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      value={createForm.confirmPassword}
                      onChange={e => setCreateForm({ ...createForm, confirmPassword: e.target.value })}
                      placeholder="Re-enter password"
                      className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-gray-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={createLoading}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl text-white font-bold text-sm shadow-lg shadow-emerald-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {createLoading ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Creating...</>
                  ) : (
                    <><PlusCircle className="w-4 h-4" /> Create Club</>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Edit Club Modal */}
        <AnimatePresence>
          {editingClub && (
            <EditClubModal
              club={editingClub}
              onClose={() => setEditingClub(null)}
              onSave={handleUpdateClub}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
