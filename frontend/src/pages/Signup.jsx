import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  UserPlus, 
  Building2, 
  Tag, 
  KeyRound, 
  Send, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

const Signup = () => {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    clubName: '',
    clubType: 'technical',
    clubDescription: '',
    otp: ''
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSuccessMessage, setOtpSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      setError('Please enter your email address first to receive an OTP');
      return;
    }
    try {
      setOtpLoading(true);
      setError('');
      const res = await api.post('/api/auth/send-registration-otp', { email: formData.email });
      setOtpSent(true);
      setOtpSuccessMessage(res.data.message || 'Verification OTP sent to your email');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please check your email.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      if (role === 'club' && !otpSent) {
        setError('Please request and verify the OTP sent to your email before completing registration');
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        role,
        clubName: role === 'club' ? formData.clubName : undefined,
        clubType: role === 'club' ? formData.clubType : undefined,
      };

      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-12 px-4 sm:px-6">
      {/* Background glow */}
      <div className="absolute top-[10%] right-[-10%] w-[45%] h-[45%] bg-primary/20 rounded-full blur-[140px] mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-secondary/20 rounded-full blur-[140px] mix-blend-screen pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-surface/60 backdrop-blur-2xl border border-white/10 shadow-2xl z-10"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Campus Registration Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Create an Account
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Sign up to manage or discover campus events
          </p>
        </div>

        {/* Role Selector Tabs (Requirement 1) */}
        <div className="flex bg-black/30 rounded-2xl p-1 mb-6 border border-white/10">
          <button
            type="button"
            onClick={() => { setRole('student'); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              role === 'student'
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Student Account
          </button>
          <button
            type="button"
            onClick={() => { setRole('club'); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              role === 'club'
                ? 'bg-secondary text-white shadow-lg shadow-secondary/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Department / Club
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-3.5 rounded-xl mb-6 text-xs sm:text-sm text-center">
            {error}
          </div>
        )}

        {otpSuccessMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 p-3.5 rounded-xl mb-6 text-xs sm:text-sm text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{otpSuccessMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Representative Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 ml-1">
              {role === 'club' ? 'Lead / Coordinator Name' : 'Full Name'}
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input 
                name="name" 
                type="text" 
                required
                onChange={handleChange} 
                value={formData.name}
                placeholder={role === 'club' ? 'e.g. Prof. Sharma / Club President' : 'e.g. Suraj Agarwal'}
                className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          {/* Department / Club Name (Only for Club role) */}
          {role === 'club' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300 ml-1">Department / Club Name</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary w-4 h-4" />
                <input 
                  name="clubName" 
                  type="text" 
                  required
                  onChange={handleChange} 
                  value={formData.clubName}
                  placeholder="e.g. Computer Science Department / Robotics Club"
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>
          )}

          {/* Category / Theme (Only for Club role) */}
          {role === 'club' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300 ml-1">Category / Type</label>
              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary w-4 h-4 pointer-events-none" />
                <select
                  name="clubType"
                  value={formData.clubType}
                  onChange={handleChange}
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="technical" className="bg-surface text-white">Technical / Coding</option>
                  <option value="cultural" className="bg-surface text-white">Cultural / Arts</option>
                  <option value="sports" className="bg-surface text-white">Sports</option>
                  <option value="workshop" className="bg-surface text-white">Academic / Workshop</option>
                  <option value="gaming" className="bg-surface text-white">Gaming / E-Sports</option>
                  <option value="departmental" className="bg-surface text-white">College Department</option>
                </select>
              </div>
            </div>
          )}

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 ml-1">
              {role === 'club' ? 'Department / Club Official Email' : 'Email Address'}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input 
                  name="email" 
                  type="email" 
                  required
                  onChange={handleChange} 
                  value={formData.email}
                  placeholder={role === 'club' ? 'club@college.edu' : 'student@college.edu'}
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              {/* Requirement 1: OTP button for Club Signup */}
              {role === 'club' && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading || !formData.email}
                  className="px-4 py-3 bg-secondary/20 hover:bg-secondary/30 border border-secondary/40 text-secondary hover:text-white font-bold rounded-xl text-xs whitespace-nowrap transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {otpLoading ? (
                    <span>Sending...</span>
                  ) : otpSent ? (
                    <span>Resend OTP</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send OTP</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* OTP Input (Shown when role is club) */}
          {role === 'club' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300 ml-1">
                Verification OTP (Received on Email)
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary w-4 h-4" />
                <input 
                  name="otp" 
                  type="text" 
                  maxLength="6"
                  required
                  onChange={handleChange} 
                  value={formData.otp}
                  placeholder="Enter 6-digit OTP"
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white font-mono placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 tracking-widest text-center transition-all"
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input 
                name="password" 
                type="password" 
                required
                onChange={handleChange} 
                value={formData.password}
                placeholder="••••••••"
                className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Complete {role === 'club' ? 'Department' : 'Student'} Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-gray-400">
          Already registered?{' '}
          <Link to="/login" className="text-primary hover:text-white font-bold transition-colors">
            Log in here
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
