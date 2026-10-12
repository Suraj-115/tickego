import React, { useState } from 'react';
import api from '../api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, KeyRound } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const defaultEmail = searchParams.get('email') || '';
  
  const [formData, setFormData] = useState({ email: defaultEmail, otp: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/reset-password', formData);
      setMessage(res.data.message);
      setError('');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password');
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md p-8 rounded-2xl bg-surface/50 backdrop-blur-xl border border-white/10 shadow-2xl">
        <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
        <p className="text-gray-400 mb-8 text-sm">Enter the OTP sent to your email.</p>

        {message && <div className="bg-green-500/10 border border-green-500/30 text-green-500 p-3 rounded-xl mb-6 text-sm">{message}</div>}
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-xl mb-6 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="hidden" value={formData.email} />
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">OTP</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input type="text" value={formData.otp} onChange={(e) => setFormData({...formData, otp: e.target.value})} required maxLength="6"
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-center tracking-widest text-lg" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input type="password" value={formData.newPassword} onChange={(e) => setFormData({...formData, newPassword: e.target.value})} required
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-xl transition hover:shadow-lg hover:shadow-primary/20">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
