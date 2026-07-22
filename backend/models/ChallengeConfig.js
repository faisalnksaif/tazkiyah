const mongoose = require('mongoose');

// Singleton document: exactly one ChallengeConfig should ever exist.
// All "day X of Y" / progress-bar logic across the app must read durationDays
// from here rather than hardcoding 21.
const challengeConfigSchema = new mongoose.Schema(
  {
    startDate: { type: Date, required: true },
    durationDays: { type: Number, required: true, default: 21 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChallengeConfig', challengeConfigSchema);
