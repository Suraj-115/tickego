const Event = require('../models/Event');
const User = require('../models/User');
const Ticket = require('../models/Ticket');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Club/Admin)
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, location, price, aimingParticipants, imageUrl, eventType, rounds, categories } = req.body;

    const event = await Event.create({
      title,
      description,
      clubId: req.user.id,
      date,
      location,
      price: price || 0,
      aimingParticipants,
      imageUrl,
      eventType,
      rounds,
      categories: categories ? categories.map(c => c.trim().toLowerCase()) : [],
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all active upcoming events
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
  try {
    const { search, category, type, club } = req.query;
    
    // Automatically omit past events (Requirement 5)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    let query = {
      date: { $gte: startOfToday }
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category && category !== 'all') {
      query.categories = category.toLowerCase();
    }
    if (type && type !== 'all') {
      query.eventType = type;
    }

    // Filter by club name if provided (Requirement 3)
    if (club && club !== 'all') {
      const matchingClubs = await User.find({
        role: 'club',
        $or: [
          { clubName: { $regex: club, $options: 'i' } },
          { name: { $regex: club, $options: 'i' } }
        ]
      }).select('_id');
      const clubIds = matchingClubs.map(c => c._id);
      query.clubId = { $in: clubIds };
    }

    const events = await Event.find(query)
      .populate('clubId', 'name clubName clubLogo clubDescription')
      .sort({ date: 1 }); // Earliest upcoming event first

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('clubId', 'name clubName');
    
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get events by club
// @route   GET /api/events/club/:clubId
// @access  Private (Club/Admin)
exports.getClubEvents = async (req, res) => {
  try {
    const events = await Event.find({ clubId: req.params.clubId }).sort({ date: 1 });
    
    // Attach live attendee and registration count
    const eventsWithStats = await Promise.all(
      events.map(async (ev) => {
        const tickets = await Ticket.find({ eventId: ev._id });
        const attendedCount = tickets.filter(t => t.attendanceStatus).length;
        return {
          ...ev.toObject(),
          totalBooked: tickets.length,
          attendedCount,
        };
      })
    );

    res.json(eventsWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Club/Admin)
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Verify ownership
    if (event.clubId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to edit this event' });
    }

    const { 
      title, description, date, location, price, 
      aimingParticipants, imageUrl, eventType, rounds, categories 
    } = req.body;

    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (date !== undefined) event.date = date;
    if (location !== undefined) event.location = location;
    if (price !== undefined) event.price = Number(price);
    if (aimingParticipants !== undefined) event.aimingParticipants = Number(aimingParticipants);
    if (imageUrl !== undefined) event.imageUrl = imageUrl;
    if (eventType !== undefined) event.eventType = eventType;
    if (rounds !== undefined) event.rounds = Number(rounds);
    if (categories !== undefined) {
      event.categories = Array.isArray(categories) 
        ? categories.map(c => c.trim().toLowerCase()) 
        : categories.split(',').map(c => c.trim().toLowerCase()).filter(Boolean);
    }

    const updated = await event.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Club/Admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.clubId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this event' });
    }

    await Ticket.deleteMany({ eventId: req.params.id });
    await Event.deleteOne({ _id: req.params.id });
    res.json({ message: 'Event and associated tickets deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get participants list for an event (College-level roster)
// @route   GET /api/events/:id/participants
// @access  Private (Club/Admin)
exports.getEventParticipants = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.clubId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to view participants for this event' });
    }

    const tickets = await Ticket.find({ eventId: req.params.id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
