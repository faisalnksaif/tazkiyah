const mongoose = require('mongoose');

// Cached/computed daily score per user, recomputed on every relevant write.
// Kept separate from DailyEntry so the leaderboard can be read cheaply
// without recalculating from raw entries on every request.
const dailyScoreSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    totalScore: { type: Number, required: true, default: 0 },
    breakdown: [
      {
        activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' },
        pointsEarned: Number,
        completionRatio: Number,
      },
    ],
  },
  { timestamps: true }
);

dailyScoreSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyScore', dailyScoreSchema);
