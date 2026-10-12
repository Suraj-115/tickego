import React, { useState, useEffect, useContext, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  QrCode, 
  Keyboard, 
  User, 
  Mail, 
  Calendar, 
  AlertTriangle,
  RefreshCw,
  Search,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Scanner = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Mode: 'camera' or 'manual'
  const [mode, setMode] = useState('manual');
  const [manualTicketId, setManualTicketId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Scan or verification response
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const scannerRef = useRef(null);

  useEffect(() => {
    if (!user || (user.role !== 'club' && user.role !== 'admin')) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Handle camera scanner initialization when in camera mode
  useEffect(() => {
    if (mode !== 'camera') {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
      return;
    }

    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 250, height: 250 },
      fps: 6,
    });
    scannerRef.current = scanner;

    scanner.render(onScanSuccess, () => {});

    async function onScanSuccess(decodedText) {
      if (!decodedText) return;
      scanner.pause();
      await verifyTicket(decodedText.trim());
      setTimeout(() => {
        try {
          scanner.resume();
        } catch {}
      }, 3500);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [mode]);

  // Core verification function (Requirement 10)
  const verifyTicket = async (ticketIdToVerify) => {
    if (!ticketIdToVerify) return;

    try {
      setSubmitting(true);
      setError(null);
      setResult(null);

      const res = await api.post('/api/tickets/scan', {
        ticketId: ticketIdToVerify.trim()
      });

      setResult({
        success: true,
        message: res.data.message || 'Participant admitted successfully!',
        user: res.data.user,
        event: res.data.event,
        ticketId: res.data.ticketId
      });

      // Add to session check-in history
      setHistory(prev => [
        {
          ticketId: res.data.ticketId,
          user: res.data.user,
          event: res.data.event,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'admitted'
        },
        ...prev
      ]);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Verification failed';
      const isAlreadyUsed = Boolean(err.response?.data?.alreadyUsed);

      setError({
        message: errorMsg,
        alreadyUsed: isAlreadyUsed,
        user: err.response?.data?.user,
        event: err.response?.data?.event,
        ticketId: ticketIdToVerify
      });

      if (isAlreadyUsed) {
        setHistory(prev => [
          {
            ticketId: ticketIdToVerify,
            user: err.response?.data?.user,
            event: err.response?.data?.event,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'rejected_used'
          },
          ...prev
        ]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualTicketId.trim()) return;
    verifyTicket(manualTicketId.trim());
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-400 hover:text-white transition font-medium mb-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Event Entry & Ticket Verification
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Check in participants by scanning their QR code or typing their unique Ticket ID. Once verified, tickets become invalid for re-entry.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-2xl bg-surface/70 border border-white/10 p-1 self-start sm:self-auto">
            <button
              onClick={() => { setMode('manual'); setResult(null); setError(null); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                mode === 'manual'
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              <span>Enter Ticket ID</span>
            </button>

            <button
              onClick={() => { setMode('camera'); setResult(null); setError(null); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                mode === 'camera'
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Camera Scanner</span>
            </button>
          </div>
        </div>

        {/* Verification Card */}
        <div className="bg-surface/60 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          
          {/* ================= MANUAL TICKET ID INPUT (Requirement 10) ================= */}
          {mode === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4 max-w-xl mx-auto">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-200">
                  Fill / Paste Participant Ticket ID:
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={manualTicketId}
                    onChange={(e) => setManualTicketId(e.target.value)}
                    placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                    required
                    className="w-full bg-black/40 border border-white/15 rounded-2xl py-3.5 pl-12 pr-4 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 placeholder-gray-500"
                  />
                </div>
                <p className="text-xs text-gray-400">
                  Enter the 36-character unique ticket UUID from the participant's pass.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || !manualTicketId.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Ticket ID...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Verify & Admit Participant</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================= CAMERA SCANNER MODE ================= */}
          {mode === 'camera' && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div 
                id="reader" 
                className="w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-black/50"
              ></div>
              <p className="text-xs text-gray-400 text-center max-w-sm">
                Point your camera at the QR code on the participant's Ticket pass. Entry check-in will trigger automatically.
              </p>
            </div>
          )}

          {/* ================= FEEDBACK RESULTS ================= */}
          <AnimatePresence>
            {/* SUCCESS: Ticket Valid & Marked as Used */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-3"
              >
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-base sm:text-lg">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <span>ENTRY APPROVED — TICKET MARKED AS USED</span>
                </div>
                
                <p className="text-xs sm:text-sm text-gray-200">
                  Attendance recorded successfully. This ticket ID has now been consumed and cannot be used again.
                </p>

                {result.user && (
                  <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 text-xs text-white space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      <span><strong>Participant:</strong> {result.user.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-emerald-400" />
                      <span><strong>Email:</strong> {result.user.email}</span>
                    </div>
                    {result.event && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span><strong>Event:</strong> {result.event.title}</span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ERROR: Ticket Already Used / Invalid */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 space-y-3"
              >
                <div className="flex items-center gap-2 text-red-400 font-extrabold text-base sm:text-lg">
                  <XCircle className="w-6 h-6 shrink-0" />
                  <span>{error.alreadyUsed ? 'ENTRY DENIED — TICKET ALREADY USED' : 'VERIFICATION FAILED'}</span>
                </div>

                <p className="text-xs sm:text-sm text-gray-200">
                  {error.message}
                </p>

                {error.alreadyUsed && error.user && (
                  <div className="p-3.5 rounded-xl bg-black/40 border border-red-500/20 text-xs text-white space-y-1">
                    <p className="text-amber-400 font-bold text-[11px] uppercase">Original Registered User:</p>
                    <p><strong>Name:</strong> {error.user.name}</p>
                    <p><strong>Email:</strong> {error.user.email}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Recent Session History */}
        {history.length > 0 && (
          <div className="bg-surface/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
              Recent Check-ins ({history.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {history.map((item, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {item.status === 'admitted' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span className="font-semibold text-white truncate">
                      {item.user?.name || 'Participant'}
                    </span>
                    <span className="text-gray-400 font-mono hidden sm:inline">
                      ({item.ticketId?.slice(0, 8)}...)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-gray-400">{item.time}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      item.status === 'admitted' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {item.status === 'admitted' ? 'Admitted' : 'Already Used'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Scanner;
