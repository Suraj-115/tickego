import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Mail, Lock, UserPlus } from 'lucide-react';

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'admin'
  });
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register organization');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-12">
      <div className="absolute top-[-10%] left-[30%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-primary/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-2xl bg-surface/50 backdrop-blur-xl border border-white/10 shadow-2xl z-10"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 bg-secondary/10 border border-secondary/30 rounded-2xl flex items-center justify-center mb-4">
            <Building2 className="w-7 h-7 text-secondary" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">
            Setup Organization
          </h1>
          <p className="text-gray-400 mt-2 text-sm">One-time registration for your college admin</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300 ml-1">Organization / College Name</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input 
                name="name" type="text" onChange={handleChange} value={formData.name}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
                placeholder="e.g. IIT Delhi" required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300 ml-1">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input 
                name="email" type="email" onChange={handleChange} value={formData.email}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
                placeholder="admin@college.edu" required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input 
                name="password" type="password" onChange={handleChange} value={formData.password}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
                placeholder="Set admin password" required
              />
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="w-full bg-gradient-to-r from-secondary to-primary text-white font-semibold py-3 rounded-xl shadow-lg shadow-secondary/30 flex items-center justify-center gap-2 mt-4"
          >
            <UserPlus className="w-5 h-5" /> Register Organization
          </motion.button>
        </form>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Already registered? <Link to="/login" className="text-primary hover:text-white transition-colors">Sign in</Link>
        </p>
        <p className="text-center text-gray-500 mt-2 text-xs">
          Are you a student? <Link to="/signup" className="text-secondary hover:text-white transition-colors">Student Signup</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default AdminSignup;
