const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: String,

    category: {
      type: String,
      enum: [
        "workshop",
        "hackathon",
        "concert",
        "recruitment",
        "seminar",
        "sports",
        "other",
      ],
    },

    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    eventMode: {
      type: String,
      enum: ["online", "offline", "hybrid"],
      required: true,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    ticketPrice: {
      type: Number,
      default: 0,
    },

    visibility: {
      type: String,
      enum: ["public", "organization-only", "invite-only"],
      default: "public",
    },

    location: {
      address: String,
      city: String,
      country: String,
      latitude: Number,
      longitude: Number,
    },

    eventDate: {
      type: Date,
      required: true,
    },

    maxParticipants: Number,

    registeredUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    poster: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);