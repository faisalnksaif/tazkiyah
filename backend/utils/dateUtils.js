// Single source of truth for date bucketing/formatting logic shared across
// services. All "day X of Y" and date-range calculations flow through here.
const moment = require('moment');

const IST_OFFSET = '+05:30';

/** Normalize a Date/string to a YYYY-MM-DD string, using IST (UTC+5:30) as the day boundary. */
function toDateKey(input = new Date()) {
  return moment(input).utcOffset(IST_OFFSET).format('YYYY-MM-DD');
}

/**
 * Add N days to a YYYY-MM-DD string, returning a YYYY-MM-DD string. Pure
 * calendar-date arithmetic on the key itself — no timezone conversion here,
 * so it doesn't compound with toDateKey's IST shift.
 */
function addDays(dateKey, days) {
  return moment(dateKey, 'YYYY-MM-DD').add(days, 'days').format('YYYY-MM-DD');
}

/** Inclusive list of YYYY-MM-DD strings from start to end. */
function dateRange(startKey, endKey) {
  const dates = [];
  let cursor = startKey;
  while (cursor <= endKey) {
    dates.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return dates;
}

/**
 * Given a ChallengeConfig doc, compute the current day number (1-indexed),
 * whether the challenge has ended, and the full list of challenge day keys.
 * This is the ONLY place "day X of Y" should be derived.
 */
function getChallengeStatus(challengeConfig, now = new Date()) {
  if (!challengeConfig) {
    return { started: false, dayNumber: 0, totalDays: 0, isOver: false, days: [] };
  }
  const startKey = toDateKey(challengeConfig.startDate);
  const endKey = addDays(startKey, challengeConfig.durationDays - 1);
  const todayKey = toDateKey(now);

  const diffDays = moment(todayKey, 'YYYY-MM-DD').diff(moment(startKey, 'YYYY-MM-DD'), 'days');

  const started = diffDays >= 0;
  const dayNumber = started ? Math.min(diffDays + 1, challengeConfig.durationDays) : 0;
  const isOver = todayKey > endKey;

  return {
    started,
    dayNumber,
    totalDays: challengeConfig.durationDays,
    isOver,
    startDate: startKey,
    endDate: endKey,
    days: dateRange(startKey, endKey),
  };
}

module.exports = { toDateKey, addDays, dateRange, getChallengeStatus };
