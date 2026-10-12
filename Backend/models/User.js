const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'club', 'student'], default: 'student' },
  clubName: { type: String }, 
  clubLogo: { type: String },
  clubDescription: { type: String },
  clubType: { type: String },
  clubMotto: { type: String },
  motto: { type: String },
  resetPasswordOtp: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
