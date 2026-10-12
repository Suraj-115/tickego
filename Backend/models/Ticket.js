const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'free'], required: true },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  attendanceStatus: { type: Boolean, default: false }, // marked true when QR is scanned by club
  ticketId: { type: String, required: true, unique: true }, // The unique payload encoded in QR
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
