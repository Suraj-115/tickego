const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  price: { type: Number, default: 0 }, // 0 means unpaid/free
  aimingParticipants: { type: Number, required: true },
  currentParticipants: { type: Number, default: 0 },
  imageUrl: { type: String }, 
  eventType: { type: String, enum: ['online', 'offline', 'hybrid'], default: 'offline' },
  rounds: { type: Number, default: 1 },
  categories: [{ type: String }], // e.g. ['coding', 'dance']
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
