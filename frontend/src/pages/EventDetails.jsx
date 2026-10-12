import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import TicketModal from '../components/TicketModal';
import { 
  MapPin, 
  Calendar, 
  Users, 
  ArrowLeft, 
  QrCode, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  Sparkles,
  Ticket as TicketIcon,
  Copy,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [existingTicket, setExistingTicket] = useState(null);
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchEventAndTicket = async () => {
      try {
        setLoading(true);
        // Fetch event details
        const res = await api.get(`/api/events/${id}`);
        setEvent(res.data);

        // Check if user already booked this event
        try {
          const ticketsRes = await api.get('/api/tickets/my-tickets');
          const matched = (ticketsRes.data || []).find(
            (t) => t.eventId?._id === id || t.eventId === id
          );
          if (matched) {
            setExistingTicket(matched);
          }
        } catch {}
      } catch (err) {
        console.error('Error fetching event', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndTicket();
  }, [id, user, navigate]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBookTicket = async () => {
    if (!event) return;
    
    // Free ticket flow
    if (event.price === 0) {
      try {
        setProcessingPayment(true);
        const res = await api.post('/api/tickets/book-free', { eventId: event._id });
        setTicketData(res.data);
      } catch (err) {
        alert(err.response?.data?.message || 'Error booking ticket');
      } finally {
        setProcessingPayment(false);
      }
    } else {
      // Paid ticket flow via Razorpay (Requirement 8)
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Razorpay payment gateway failed to load. Please check your internet connection.');
        return;
      }

      try {
        setProcessingPayment(true);
        const orderRes = await api.post('/api/tickets/create-order', { eventId: event._id });

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TB3YNZQj1AgXDo',
          amount: orderRes.data.amount,
          currency: 'INR',
          name: 'Tickego',
          description: `Entry pass for ${event.title}`,
          order_id: orderRes.data.id,
          handler: async function (response) {
            try {
              const verifyRes = await api.post('/api/tickets/verify-payment', {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                eventId: event._id,
              });
              setTicketData(verifyRes.data);
            } catch (error) {
              alert('Payment Verification Failed');
            } finally {
              setProcessingPayment(false);
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: { 
            color: '#6366F1' 
          },
          modal: {
            ondismiss: function () {
              setProcessingPayment(false);
            }
          }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } catch (err) {
        console.error('Razorpay order creation failed', err);
        alert(err.response?.data?.message || 'Error creating payment order');
        setProcessingPayment(false);
      }
    }
  };

  const copyTicketId = (idToCopy) => {
    if (idToCopy) {
      navigator.clipboard.writeText(idToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-text flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background text-text flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
          <p className="text-gray-400 mb-6">This event may have been removed or the date has passed.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const clubName = event.clubId?.clubName || event.clubId?.name || 'Campus Club';
  const eventDate = new Date(event.date);
  const formattedDate = !isNaN(eventDate.getTime())
    ? eventDate.toLocaleDateString('en-IN', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Date TBA';

  const activeTicket = ticketData?.ticket || existingTicket;
  const activeQR = ticketData?.qrDataURI || existingTicket?.qrDataURI;

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </button>

        {/* Main Card */}
        <div className="bg-surface/60 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl">
          {/* Hero Banner */}
          <div className="h-60 sm:h-80 relative overflow-hidden bg-gradient-to-br from-primary/30 via-surface to-secondary/30">
            {event.imageUrl ? (
              <img 
                src={event.imageUrl} 
                alt={event.title} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 gap-2">
                <Calendar className="w-16 h-16" />
                <span className="text-sm font-semibold tracking-wide uppercase">{clubName}</span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent"></div>

            {/* Price Badge on Banner */}
            <div className="absolute top-4 right-4 px-4 py-1.5 bg-black/70 backdrop-blur-md rounded-full text-sm font-extrabold text-white border border-white/15 shadow-xl">
              {event.price === 0 ? (
                <span className="text-primary">FREE ENTRY</span>
              ) : (
                <span className="text-emerald-400">₹{event.price}</span>
              )}
            </div>

            {/* Event Type Badge */}
            <div className="absolute top-4 left-4 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-white uppercase tracking-wider border border-white/10">
              {event.eventType || 'Offline'}
            </div>

            {/* Title overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-primary font-bold mb-1">
                <Building2 className="w-4 h-4" /> Organized by {clubName}
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {event.title}
              </h1>
            </div>
          </div>

          {/* Details Content */}
          <div className="p-6 sm:p-10 space-y-8">
            {/* Description */}
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">About the Event</h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/20 text-primary">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Date</p>
                  <p className="text-sm font-semibold text-white">{formattedDate}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/20 text-primary">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Location</p>
                  <p className="text-sm font-semibold text-white truncate">{event.location}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/20 text-primary">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Capacity</p>
                  <p className="text-sm font-semibold text-white">
                    {event.aimingParticipants} Total Spots
                  </p>
                </div>
              </div>
            </div>

            {/* Categories */}
            {event.categories && event.categories.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {event.categories.map((c, i) => (
                    <span 
                      key={i}
                      className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-gray-300 capitalize"
                    >
                      #{c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ================= TICKET STATE (Requirement 8 & 9) ================= */}
            {activeTicket ? (
              /* If User Already Has a Ticket */
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-surface to-teal-500/10 border border-emerald-500/30 text-center space-y-4 shadow-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Registration Confirmed
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white">
                  You Have an Active Ticket for this Event!
                </h3>
                
                <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto">
                  Your entry ticket and unique ID have been generated. Present your QR code or Ticket ID at the entrance for verification.
                </p>

                {/* Unique Ticket ID Box */}
                <div className="max-w-md mx-auto p-4 rounded-2xl bg-black/40 border border-white/10 text-left">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span className="font-semibold">Unique Ticket ID</span>
                    <button
                      onClick={() => copyTicketId(activeTicket.ticketId)}
                      className="flex items-center gap-1 text-primary hover:text-white transition font-bold"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy ID'}</span>
                    </button>
                  </div>
                  <p className="font-mono text-xs sm:text-sm text-white font-bold break-all select-all">
                    {activeTicket.ticketId}
                  </p>
                </div>

                {/* QR Code */}
                {activeQR && (
                  <div className="flex flex-col items-center justify-center pt-2">
                    <div className="p-3 bg-white rounded-2xl shadow-lg border border-white/20">
                      <img src={activeQR} alt="Ticket QR" className="w-40 h-40 object-contain" />
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => navigate('/dashboard?tab=booked')}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl text-sm shadow-lg shadow-emerald-500/20 hover:opacity-90 transition"
                  >
                    View in Booked Events Dashboard →
                  </button>
                </div>
              </div>
            ) : (
              /* Booking / Payment Action Box (Requirement 8) */
              <div className="p-6 sm:p-8 rounded-3xl bg-surface/70 border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Ticket Price</span>
                    <div className="text-2xl sm:text-3xl font-black text-white">
                      {event.price === 0 ? (
                        <span className="text-primary">FREE</span>
                      ) : (
                        <span className="text-emerald-400">₹{event.price} <span className="text-xs text-gray-400 font-normal">per participant</span></span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleBookTicket}
                    disabled={processingPayment || event.aimingParticipants <= 0}
                    className="py-4 px-8 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white font-extrabold rounded-2xl text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {processingPayment ? (
                      <span>Processing...</span>
                    ) : event.aimingParticipants <= 0 ? (
                      <span>Sold Out</span>
                    ) : event.price === 0 ? (
                      <>
                        <TicketIcon className="w-5 h-5" />
                        <span>Book Free Ticket</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span>Pay ₹{event.price} & Complete Booking</span>
                      </>
                    )}
                  </button>
                </div>

                {event.price > 0 && (
                  <p className="text-xs text-gray-400 text-center sm:text-left flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Secured by Razorpay. Official ticket and entry pass generated instantly upon successful transaction.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventDetails;
