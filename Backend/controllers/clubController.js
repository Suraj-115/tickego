const User = require('../models/User');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');

// @desc    Get public clubs list for filtering
// @route   GET /api/clubs/public
// @access  Public
exports.getPublicClubs = async (req, res) => {
  try {
    const clubs = await User.find({ role: 'club' }).select('name clubName clubLogo clubDescription clubType');
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all clubs
// @route   GET /api/clubs
// @access  Private (Admin)
exports.getClubs = async (req, res) => {
  try {
    const clubs = await User.find({ role: 'club' }).select('-password');

    // Enrich each club with event count & total registrations
    const enriched = await Promise.all(
      clubs.map(async (club) => {
        const clubObj = club.toObject();
        const events = await Event.find({ clubId: club._id });
        const totalEvents = events.length;
        const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).length;

        let totalRegistrations = 0;
        for (const ev of events) {
          const ticketCount = await Ticket.countDocuments({ eventId: ev._id });
          totalRegistrations += ticketCount;
        }

        clubObj.totalEvents = totalEvents;
        clubObj.upcomingEvents = upcomingEvents;
        clubObj.totalRegistrations = totalRegistrations;
        return clubObj;
      })
    );

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single club by ID
// @route   GET /api/clubs/:id
// @access  Private (Admin)
exports.getClubById = async (req, res) => {
  try {
    const club = await User.findById(req.params.id).select('-password');
    if (!club || club.role !== 'club') {
      return res.status(404).json({ message: 'Club not found' });
    }
    res.json(club);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get comprehensive statistics for a club
// @route   GET /api/clubs/:id/statistics
// @access  Private (Admin)
exports.getClubStatistics = async (req, res) => {
  try {
    const club = await User.findById(req.params.id).select('-password');
    if (!club || club.role !== 'club') {
      return res.status(404).json({ message: 'Club not found' });
    }

    const now = new Date();

    // Get all events for this club
    const events = await Event.find({ clubId: club._id }).sort({ date: -1 });

    // Build detailed per-event stats
    const eventStats = await Promise.all(
      events.map(async (event) => {
        const tickets = await Ticket.find({ eventId: event._id });
        const totalBooked = tickets.length;
        const attended = tickets.filter(t => t.attendanceStatus).length;
        const paidTickets = tickets.filter(t => t.paymentStatus === 'completed').length;
        const freeTickets = tickets.filter(t => t.paymentStatus === 'free').length;
        const revenue = paidTickets * (event.price || 0);
        const isPast = new Date(event.date) < now;
        const fillRate = event.aimingParticipants > 0
          ? Math.round((totalBooked / event.aimingParticipants) * 100)
          : 0;
        const attendanceRate = totalBooked > 0
          ? Math.round((attended / totalBooked) * 100)
          : 0;

        // Performance rating
        let performance = 'average';
        if (fillRate >= 80 && attendanceRate >= 70) performance = 'excellent';
        else if (fillRate >= 60 && attendanceRate >= 50) performance = 'good';
        else if (fillRate < 30 || attendanceRate < 30) performance = 'poor';

        return {
          _id: event._id,
          title: event.title,
          date: event.date,
          location: event.location,
          price: event.price,
          eventType: event.eventType,
          categories: event.categories,
          aimingParticipants: event.aimingParticipants,
          totalBooked,
          attended,
          paidTickets,
          freeTickets,
          revenue,
          fillRate,
          attendanceRate,
          performance,
          isPast,
          imageUrl: event.imageUrl,
        };
      })
    );

    // Aggregate stats
    const totalEvents = events.length;
    const pastEvents = eventStats.filter(e => e.isPast).length;
    const upcomingEvents = totalEvents - pastEvents;
    const totalRegistrations = eventStats.reduce((sum, e) => sum + e.totalBooked, 0);
    const totalAttendees = eventStats.reduce((sum, e) => sum + e.attended, 0);
    const totalRevenue = eventStats.reduce((sum, e) => sum + e.revenue, 0);
    const totalAimedParticipants = eventStats.reduce((sum, e) => sum + e.aimingParticipants, 0);

    const avgFillRate = totalAimedParticipants > 0
      ? Math.round((totalRegistrations / totalAimedParticipants) * 100)
      : 0;
    const avgAttendanceRate = totalRegistrations > 0
      ? Math.round((totalAttendees / totalRegistrations) * 100)
      : 0;

    // Performance distribution
    const performanceDistribution = {
      excellent: eventStats.filter(e => e.performance === 'excellent').length,
      good: eventStats.filter(e => e.performance === 'good').length,
      average: eventStats.filter(e => e.performance === 'average').length,
      poor: eventStats.filter(e => e.performance === 'poor').length,
    };

    // Category breakdown
    const categoryMap = {};
    for (const ev of eventStats) {
      for (const cat of (ev.categories || [])) {
        if (!categoryMap[cat]) {
          categoryMap[cat] = { count: 0, registrations: 0, attended: 0, revenue: 0 };
        }
        categoryMap[cat].count++;
        categoryMap[cat].registrations += ev.totalBooked;
        categoryMap[cat].attended += ev.attended;
        categoryMap[cat].revenue += ev.revenue;
      }
    }

    // Monthly trend (last 12 months)
    const monthlyTrend = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      const monthEvents = eventStats.filter(e => {
        const ed = new Date(e.date);
        return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
      });
      monthlyTrend.push({
        month,
        events: monthEvents.length,
        registrations: monthEvents.reduce((s, e) => s + e.totalBooked, 0),
        attended: monthEvents.reduce((s, e) => s + e.attended, 0),
        revenue: monthEvents.reduce((s, e) => s + e.revenue, 0),
      });
    }

    // Overall club health score (0–100)
    let healthScore = 0;
    if (totalEvents > 0) {
      const fillScore = Math.min(avgFillRate, 100) * 0.35;
      const attendanceScore = Math.min(avgAttendanceRate, 100) * 0.3;
      const eventFrequency = Math.min((totalEvents / 12) * 100, 100) * 0.2; // 12 events/year = 100%
      const revenueScore = totalRevenue > 0 ? 15 : 0; // bonus for revenue-generating
      healthScore = Math.round(fillScore + attendanceScore + eventFrequency + revenueScore);
    }

    res.json({
      club: {
        _id: club._id,
        name: club.name,
        clubName: club.clubName,
        clubLogo: club.clubLogo,
        clubDescription: club.clubDescription,
        clubType: club.clubType,
        motto: club.clubMotto || club.motto || '',
        clubMotto: club.clubMotto || club.motto || '',
        email: club.email,
        createdAt: club.createdAt,
      },
      summary: {
        totalEvents,
        pastEvents,
        upcomingEvents,
        totalRegistrations,
        totalAttendees,
        totalRevenue,
        avgFillRate,
        avgAttendanceRate,
        healthScore,
      },
      performanceDistribution,
      categoryBreakdown: categoryMap,
      monthlyTrend,
      events: eventStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a club
// @route   PUT /api/clubs/:id
// @access  Private (Admin)
exports.updateClub = async (req, res) => {
  try {
    const { name, email, clubName, clubLogo, clubDescription, clubType, motto, clubMotto } = req.body;
    
    const club = await User.findById(req.params.id);
    if (!club || club.role !== 'club') {
      return res.status(404).json({ message: 'Club not found' });
    }

    club.name = name || club.name;
    club.email = email || club.email;
    club.clubName = clubName || club.clubName;
    club.clubLogo = clubLogo || club.clubLogo;
    club.clubDescription = clubDescription || club.clubDescription;
    club.clubType = clubType || club.clubType;
    if (motto !== undefined || clubMotto !== undefined) {
      club.clubMotto = motto || clubMotto;
      club.motto = motto || clubMotto;
    }

    const updatedClub = await club.save();
    res.json(updatedClub);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a club
// @route   DELETE /api/clubs/:id
// @access  Private (Admin)
exports.deleteClub = async (req, res) => {
  try {
    const club = await User.findById(req.params.id);
    if (!club || club.role !== 'club') {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Also delete all events and tickets associated with this club
    const events = await Event.find({ clubId: req.params.id });
    for (const event of events) {
      await Ticket.deleteMany({ eventId: event._id });
    }
    await Event.deleteMany({ clubId: req.params.id });
    await User.deleteOne({ _id: req.params.id });

    res.json({ message: 'Club and all associated events/tickets removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
