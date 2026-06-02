const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["college", "company", "hospital", "ngo", "research", "community"],
      required: true,
    },

    description: String,

    logo: String,

    website: String,

    isVerified: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    featureFlags: {
      ticketing: { type: Boolean, default: true },
      registration: { type: Boolean, default: true },
      qrEntry: { type: Boolean, default: true },
      chatbot: { type: Boolean, default: false },
      analytics: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);