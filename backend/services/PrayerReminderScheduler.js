const moment = require('moment');
const prayerTimes = require('../prayer-times.json');
const { toDateKey } = require('../utils/dateUtils');
const PushSubscription = require('../models/PushSubscription');
const PrayerReminderLog = require('../models/PrayerReminderLog');
const PushService = require('./PushService');

const IST_OFFSET = '+05:30';
const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

class PrayerReminderScheduler {
  constructor() {
    this.intervalId = null;
    this.lastMinuteKey = null;
  }

  start() {
    if (this.intervalId) return;

    if (process.env.PUSH_PRAYER_REMINDERS_ENABLED === 'false') {
      console.log('[push] Prayer reminder scheduler disabled by env.');
      return;
    }

    this._tick().catch((err) => console.error('[push] Initial scheduler tick failed:', err));
    this.intervalId = setInterval(() => {
      this._tick().catch((err) => console.error('[push] Scheduler tick failed:', err));
    }, 60 * 1000);

    console.log('[push] Prayer reminder scheduler started (checks every minute, IST).');
  }

  stop() {
    if (!this.intervalId) return;
    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  async _tick(now = new Date()) {
    const istNow = moment(now).utcOffset(IST_OFFSET);
    const minuteKey = istNow.format('YYYY-MM-DD HH:mm');
    if (this.lastMinuteKey === minuteKey) return;
    this.lastMinuteKey = minuteKey;

    const todayMonthDay = istNow.format('MM-DD');
    const todaySchedule = prayerTimes[todayMonthDay];
    if (!todaySchedule) return;

    const nowHm = istNow.format('H:mm');
    const dateKey = toDateKey(now);

    for (const prayer of PRAYERS) {
      const prayerAt = todaySchedule[prayer];
      if (!prayerAt) continue;

      const reminderAt = moment(prayerAt, 'H:mm').subtract(5, 'minutes').format('H:mm');
      if (reminderAt !== nowHm) continue;

      await this._sendPrayerReminder({ dateKey, prayer, prayerAt, reminderAt });
    }
  }

  async _sendPrayerReminder({ dateKey, prayer, prayerAt, reminderAt }) {
    const subscriptions = await PushSubscription.find({ enabled: true });
    if (subscriptions.length === 0) return;

    const title = `${capitalize(prayer)} in 5 minutes`;
    const body = `${capitalize(prayer)} starts at ${prayerAt}. Prepare for salah.`;
    const tag = `prayer-${dateKey}-${prayer}`;

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      const existing = await PrayerReminderLog.findOne({ userId: sub.userId, dateKey, prayer });
      if (existing) {
        skipped++;
        continue;
      }

      const result = await PushService.sendToSubscription(sub, {
        title,
        body,
        tag,
        data: {},
      });

      if (result.ok) {
        sent++;
        await PrayerReminderLog.create({ userId: sub.userId, dateKey, prayer, reminderAt, prayerAt });
      } else {
        failed++;
      }
    }

    console.log(`[push] ${prayer} reminder (${dateKey} ${reminderAt}) -> sent=${sent}, skipped=${skipped}, failed=${failed}`);
  }
}

module.exports = new PrayerReminderScheduler();
