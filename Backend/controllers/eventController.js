const Event = require("../models/Event");

exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      organizationId,
      departmentId,
      eventMode,
      isPaid,
      ticketPrice,
      visibility,
      location,
      eventDate,
      maxParticipants,
    } = req.body;

    if (new Date(eventDate) <= new Date()) {
      return res.status(400).json({ message: "Event date must be in the future" });
    }

    const event = new Event({
      title,
      description,
      category,
      organization: organizationId,
      department: departmentId,
      createdBy: req.user.id,
      eventMode,
      isPaid,
      ticketPrice,
      visibility,
      location,
      eventDate,
      maxParticipants,
    });

    await event.save();

    res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if already registered
    if (event.registeredUsers.some((id) => id.toString() === userId.toString())) {
      return res.status(400).json({ message: "Already registered" });
    }

    // Check capacity
    if (
      event.maxParticipants &&
      event.registeredUsers.length >= event.maxParticipants
    ) {
      return res.status(400).json({ message: "Event is full" });
    }

    //Check payment
    if (event.isPaid) {
      return res.status(400).json({
        message: "This is a paid event. Please purchase ticket.",
    });
}

    // Register user
    event.registeredUsers.push(userId);

    await event.save();

    res.json({
      message: "Registered successfully",
      totalParticipants: event.registeredUsers.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const { category, city, title, eventMode, isPaid } = req.query;

    let filter = {};

    if (category) filter.category = category;
    if (city) filter["location.city"] = city;
    if (title) filter.title = { $regex: title, $options: "i" };
    if (eventMode) filter.eventMode = eventMode;
    if (isPaid !== undefined) filter.isPaid = isPaid === "true";

    const events = await Event.find(filter)
      .populate("organization", "name")
      .populate("department", "name")
      .sort({ eventDate: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organization", "name")
      .populate("department", "name")
      .populate("registeredUsers", "name email");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user.id })
      .populate("organization", "name")
      .populate("department", "name")
      .populate("registeredUsers", "name email")
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRegisteredEvents = async (req, res) => {
  try {
    const events = await Event.find({ registeredUsers: req.user.id })
      .populate("organization", "name")
      .populate("department", "name")
      .sort({ eventDate: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};