import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      setMessage(res.data.message);
      setError('');
      setTimeout(() => navigate(`/reset-password?email=${email}`), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending OTP');
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md p-8 rounded-2xl bg-surface/50 backdrop-blur-xl border border-white/10 shadow-2xl">
        <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>
        
        <h1 className="text-3xl font-bold mb-2">Forgot Password</h1>
        <p className="text-gray-400 mb-8 text-sm">Enter your email to receive an OTP.</p>

        {message && <div className="bg-green-500/10 border border-green-500/30 text-green-500 p-3 rounded-xl mb-6 text-sm">{message}</div>}
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-xl mb-6 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition hover:shadow-lg hover:shadow-primary/20">
            Send OTP <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
