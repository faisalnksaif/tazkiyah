const mongoose = require('mongoose');

// Append-friendly sub-documents so multiple additions per day never overwrite
// each other. Counter/duration entries push, they never overwrite in place.
const incrementSchema = new mongoose.Schema(
  { value: { type: Number, required: true }, addedAt: { type: Date, default: Date.now } },
  { _id: false }
);

const subItemStatusSchema = new mongoose.Schema(
  { label: { type: String, required: true }, done: { type: Boolean, default: false } },
  { _id: false }
);

const dailyEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },
    // Normalized to YYYY-MM-DD string for simple, timezone-safe day bucketing.
    date: { type: String, required: true },

    // counter / duration: array of increments, summed to get the day's total.
    increments: { type: [incrementSchema], default: [] },

    // checkbox: single boolean for the day.
    done: { type: Boolean, default: false },

    // checklist: per-sub-item status for the day.
    subItemStatuses: { type: [subItemStatusSchema], default: [] },
  },
  { timestamps: true }
);

dailyEntrySchema.index({ userId: 1, activityId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyEntry', dailyEntrySchema);
