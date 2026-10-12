import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { User, Mail, Lock, Briefcase, ArrowLeft, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const CreateClub = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', clubName: '', clubLogo: '', clubDescription: '', clubType: 'tech'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/auth/create-club', formData);
      setSuccess('Club created successfully!');
      setError('');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating club');
      setSuccess('');
    }
  };

  if (!user || user.role !== 'admin') return <p className="text-white p-6">Unauthorized access</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-2xl bg-surface/50 backdrop-blur-xl border border-white/10 shadow-2xl"
      >
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-2">
          Create New Club
        </h1>
        <p className="text-gray-400 mb-8">Set up a club account so they can post events.</p>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">{error}</div>}
        {success && <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-3 rounded-lg mb-6 text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300 ml-1">Head of Club (Name)</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input name="name" type="text" onChange={handleChange} value={formData.name} required
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300 ml-1">Club Login Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input name="email" type="email" onChange={handleChange} value={formData.email} required
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300 ml-1">Temporary Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input name="password" type="password" onChange={handleChange} value={formData.password} required
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300 ml-1">Official Club Name</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input name="clubName" type="text" onChange={handleChange} value={formData.clubName} required
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>
            
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Club Logo URL</label>
              <input name="clubLogo" type="text" onChange={handleChange} value={formData.clubLogo} placeholder="https://example.com/logo.png"
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Club Description</label>
              <textarea name="clubDescription" onChange={handleChange} value={formData.clubDescription} required rows="3"
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Club Type</label>
              <select name="clubType" onChange={handleChange} value={formData.clubType}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option className="bg-surface" value="coding">Coding</option>
                <option className="bg-surface" value="tech">Tech & Dev</option>
                <option className="bg-surface" value="drama">Drama</option>
                <option className="bg-surface" value="singing">Singing / Music</option>
                <option className="bg-surface" value="social">Social</option>
                <option className="bg-surface" value="health">Health & Wellness</option>
                <option className="bg-surface" value="other">Other</option>
              </select>
            </div>
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" 
            className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 mt-4"
          >
            <UserPlus className="w-5 h-5" /> Create Club
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateClub;
