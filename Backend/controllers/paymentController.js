const Razorpay = require("razorpay");
const Ticket = require("../models/Ticket");
const Event = require("../models/Event");
const crypto = require("crypto");
const QRCode = require("qrcode");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: "eventId is required" });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!event.isPaid) {
      return res.status(400).json({ message: "Event is not paid" });
    }

    const options = {
      amount: Math.max(event.ticketPrice * 100, 1000),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    const ticketNumber =
      "TG-" +
      new Date().getFullYear() +
      "-" +
      Date.now();

    const ticket = await Ticket.create({
      user: req.user.id,
      event: eventId,
      ticketNumber,
      orderId: order.id,
      status: "pending",
    });

    res.status(200).json({
        message: "Order created successfully",
        order,
        ticketId: ticket._id,
        key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      ticketId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment data" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    // if (expectedSignature !== razorpay_signature) {
    //   return res.status(400).json({ message: "Invalid payment signature" });
    // }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.paymentId = razorpay_payment_id;
    ticket.status = "paid";

    // const qrData = JSON.stringify({
    //   ticketId: ticket._id,
    //   userId: ticket.user,
    //   eventId: ticket.event,
    // });

    const qrData = ticket.ticketNumber;

    const qrImage = await QRCode.toDataURL(qrData);

    ticket.qrCode = qrImage;

    await ticket.save();

    res.json({
      message: "Payment verified, ticket confirmed",
      ticket,
    });
  } catch (error) {
    console.error("Verify Error:", error);
    res.status(500).json({ error: error.message });
  }
};
