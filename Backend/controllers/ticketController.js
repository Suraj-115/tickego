const Ticket = require("../models/Ticket");

exports.scanTicket = async(req,res) =>{
  try{
    const { ticketNumber } = req.body;

    const ticket = await Ticket.findOne({
      ticketNumber,
    })
    .populate("user", "name email")
    .populate("event", "title");

    if(!ticket){
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    if(ticket.status !== "paid"){
      return res.status(404).json({
        message: "Payment pending"
      });
    }

    if(ticket.isUsed){
      return res.status(400).json({
        message: "Ticket already used"
      });
    }

    ticket.isUsed = true;
    ticket.usedAt = new Date();

    await ticket.save();

    res.json({
        message: "Entry Allowed",

        attendee: {
            name: ticket.user.name,
            email: ticket.user.email
        },

        event: {
            title: ticket.event.title
        },

        ticketNumber: ticket.ticketNumber,

        checkedInAt: ticket.usedAt
    });

  } catch(err){
    res.status(500).json({
      error: err.message
    });
  }
}

exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id })
      .populate("event")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};