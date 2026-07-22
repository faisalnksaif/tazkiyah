const mongoose = require('mongoose');

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

const prayerReminderLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dateKey: { type: String, required: true },
    prayer: { type: String, enum: PRAYERS, required: true },
    reminderAt: { type: String, required: true },
    prayerAt: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

prayerReminderLogSchema.index({ userId: 1, dateKey: 1, prayer: 1 }, { unique: true });

module.exports = mongoose.model('PrayerReminderLog', prayerReminderLogSchema);
