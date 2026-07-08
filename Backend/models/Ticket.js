const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },

    paymentId: String,
    orderId: String,

    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    qrCode: {
      type: String,
    },

    isUsed: {
      type: Boolean,
      default: false,
    },

    usedAt: {
      type: Date,
    },
    ticketNumber: {
      type: String,
      unique: true,
      required: true
    },
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);

