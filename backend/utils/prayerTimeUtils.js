// prayer-times.json stores each time as a bare "H:mm" clock reading (no AM/PM
// marker) rather than 24-hour time — e.g. Isha "8:09" means 8:09 PM, not
// 08:09 AM. Only Fajr is genuinely an AM hour; Dhuhr is already stored past
// noon (12:xx). Asr, Maghrib, and Isha need 12 hours added to become real
// 24-hour times. This is the single place that conversion happens so display
// and reminder scheduling can't drift apart.
const PM_PRAYERS = new Set(['asr', 'maghrib', 'isha']);

function to24Hour(prayer, time) {
  if (!time) return time;
  const [hourStr, minute] = time.split(':');
  let hour = parseInt(hourStr, 10);
  if (PM_PRAYERS.has(prayer) && hour < 12) hour += 12;
  return `${hour}:${minute}`;
}

module.exports = { to24Hour };
