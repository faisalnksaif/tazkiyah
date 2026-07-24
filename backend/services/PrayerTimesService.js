const moment = require('moment');
const prayerTimes = require('../prayer-times.json');

const IST_OFFSET = '+05:30';
const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

function getToday(now = new Date()) {
  const istNow = moment(now).utcOffset(IST_OFFSET);
  const monthDay = istNow.format('MM-DD');
  const schedule = prayerTimes[monthDay] || {};

  const tomorrowMonthDay = istNow.clone().add(1, 'day').format('MM-DD');
  const tomorrowFajr = prayerTimes[tomorrowMonthDay]?.fajr;

  return {
    date: istNow.format('YYYY-MM-DD'),
    prayers: PRAYERS.reduce((acc, prayer) => {
      if (schedule[prayer]) acc[prayer] = schedule[prayer];
      return acc;
    }, {}),
    tomorrowFajr,
  };
}

module.exports = { getToday, PRAYERS };
