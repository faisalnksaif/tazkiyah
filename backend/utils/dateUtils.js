// Single source of truth for date bucketing/formatting logic shared across
// services. All "day X of Y" and date-range calculations flow through here.

// India does not observe DST, so a fixed offset is safe (no timezone
// database / Intl dependency needed — matters on React Native's JS engine).
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Normalize a Date/string to a YYYY-MM-DD string, using IST (UTC+5:30) as the day boundary. */
function toDateKey(input = new Date()) {
  const shifted = new Date(new Date(input).getTime() + IST_OFFSET_MS);
  return shifted.toISOString().slice(0, 10);
}

/**
 * Add N days to a YYYY-MM-DD string, returning a YYYY-MM-DD string. Pure
 * calendar-date arithmetic on the key itself — no timezone conversion here,
 * so it doesn't compound with toDateKey's IST shift.
 */
function addDays(dateKey, days) {
  const d = new Date(`${dateKey}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
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

  const startMs = new Date(`${startKey}T00:00:00.000Z`).getTime();
  const todayMs = new Date(`${todayKey}T00:00:00.000Z`).getTime();
  const diffDays = Math.floor((todayMs - startMs) / 86400000);

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
