const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_123',
  key_secret: process.env.RAZORPAY_SECRET || 'secret',
});

// @desc    Book a free ticket
// @route   POST /api/tickets/book-free
// @access  Private (Student)
exports.bookFreeTicket = async (req, res) => {
  try {
    const { eventId } = req.body;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.price > 0) return res.status(400).json({ message: 'Event is not free' });

    // Check if already booked
    const existingTicket = await Ticket.findOne({ eventId, userId: req.user.id });
    if (existingTicket) return res.status(400).json({ message: 'Already booked' });

    const ticketId = uuidv4();
    const ticket = await Ticket.create({
      userId: req.user.id,
      eventId,
      paymentStatus: 'free',
      ticketId,
    });

    // Update event counts
    event.aimingParticipants -= 1;
    event.currentParticipants += 1;
    await event.save();

    // Generate QR
    const qrDataURI = await QRCode.toDataURL(ticketId);

    res.status(201).json({ ticket, qrDataURI });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Razorpay Order
// @route   POST /api/tickets/create-order
// @access  Private (Student)
exports.createOrder = async (req, res) => {
  try {
    const { eventId } = req.body;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const options = {
      amount: event.price * 100, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_order_${uuidv4().slice(0,8)}`,
    };

    const order = await razorpay.orders.create(options);
    if (!order) return res.status(500).json({ message: "Failed to create payment order" });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/tickets/verify-payment
// @access  Private (Student)
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, eventId } = req.body;

    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET || 'secret');
    shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpaySignature) {
      return res.status(400).json({ message: "Transaction not legit!" });
    }

    const event = await Event.findById(eventId);
    const ticketId = uuidv4();

    const ticket = await Ticket.create({
      userId: req.user.id,
      eventId,
      paymentStatus: 'completed',
      razorpayOrderId,
      razorpayPaymentId,
      ticketId,
    });

    // Update event counts
    event.aimingParticipants -= 1;
    event.currentParticipants += 1;
    await event.save();

    const qrDataURI = await QRCode.toDataURL(ticketId);

    res.json({
      message: "Payment successful",
      ticket,
      qrDataURI,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's booked tickets (auto-omits passed events)
// @route   GET /api/tickets/my-tickets
// @access  Private (Student/User)
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ 
      userId: req.user.id,
      paymentStatus: { $in: ['completed', 'free'] }
    })
      .populate({
        path: 'eventId',
        populate: { path: 'clubId', select: 'name clubName clubLogo' }
      })
      .sort({ createdAt: -1 });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Filter out tickets whose event has passed (Requirement 5)
    const validTickets = tickets.filter(t => {
      if (!t.eventId || !t.eventId.date) return false;
      return new Date(t.eventId.date) >= startOfToday;
    });

    const ticketsWithQR = await Promise.all(
      validTickets.map(async (t) => {
        try {
          const qrDataURI = await QRCode.toDataURL(t.ticketId);
          return {
            ...t.toObject(),
            qrDataURI,
          };
        } catch {
          return t.toObject();
        }
      })
    );

    res.json(ticketsWithQR);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Scan / Verify QR or Ticket ID and Mark Attendance
// @route   POST /api/tickets/scan
// @access  Private (Club/Admin)
exports.scanTicket = async (req, res) => {
  try {
    const { ticketId } = req.body;
    if (!ticketId) {
      return res.status(400).json({ message: 'Ticket ID is required' });
    }

    const ticket = await Ticket.findOne({ ticketId: ticketId.trim() })
      .populate('userId', 'name email')
      .populate('eventId', 'title date location clubId');

    if (!ticket) {
      return res.status(404).json({ message: 'Invalid Ticket ID. No ticket found.' });
    }

    if (!ticket.eventId) {
      return res.status(404).json({ message: 'Event associated with this ticket no longer exists' });
    }

    // Ensure club scanning it is the owner of the event
    if (ticket.eventId.clubId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to verify tickets for this event' });
    }

    // Once ticket ID is filled, it becomes invalid as participant has entered (Requirement 10)
    if (ticket.attendanceStatus) {
      return res.status(400).json({ 
        message: 'Ticket already used! Participant has already entered the event.',
        alreadyUsed: true,
        user: ticket.userId,
        event: ticket.eventId,
        ticketId: ticket.ticketId
      });
    }

    ticket.attendanceStatus = true;
    await ticket.save();

    res.json({ 
      message: 'Participant admitted successfully! Ticket marked as used.', 
      user: ticket.userId,
      event: ticket.eventId,
      ticketId: ticket.ticketId,
      ticket
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
