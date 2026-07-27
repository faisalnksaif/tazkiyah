const moment = require('moment');
const DailyEntry = require('../models/DailyEntry');
const DailyScore = require('../models/DailyScore');
const Activity = require('../models/Activity');
const ChallengeService = require('./ChallengeService');
const { toDateKey, addDays } = require('../utils/dateUtils');

// Praying in congregation is rewarded on the 5 Daily Prayers checklist only —
// identified by name since jama'ath is specific to prayer, not a generic
// checklist feature. Flat bonus (not ratio-scaled) so it adds cleanly on top
// of the day's total: 5 prayers x 2 points = 10, which combined with the
// current activity weights (summing to 90) caps a perfect day at 100.
const PRAYER_ACTIVITY_NAME = '5 Daily Prayers';
const JAMAATH_BONUS_POINTS = 2;

// Mandatory 3x/week — tracked against the calendar week (Mon-Sun), not the
// challenge's day list, since "per week" should reset on calendar boundaries.
const DAWA_ACTIVITY_NAME = "Da'wa";
const DAWA_WEEKLY_TARGET = 3;

class ScoreService {
  /**
   * Pure function: completion ratio in [0, 1] for one activity's entry on one day.
   * Kept side-effect free and exported standalone so it's trivially unit-testable.
   */
  computeCompletionRatio(activity, entry) {
    if (!entry) return 0;

    switch (activity.type) {
      case 'counter':
      case 'duration': {
        const total = (entry.increments || []).reduce((sum, inc) => sum + inc.value, 0);
        const target = activity.targetValue || 1;
        return Math.max(0, Math.min(total / target, 1));
      }
      case 'checkbox':
        return entry.done ? 1 : 0;
      case 'checklist': {
        const items = entry.subItemStatuses || [];
        if (items.length === 0) return 0;
        const doneCount = items.filter((i) => i.done).length;
        return doneCount / items.length;
      }
      default:
        return 0;
    }
  }

  /**
   * Pure function: points earned for one activity given its completion ratio.
   * proportional -> partial credit scaled by ratio.
   * fixed -> full pointsWeight only once ratio reaches 1 (fully complete), else 0.
   */
  computePointsEarned(activity, completionRatio) {
    if (activity.scoringModel === 'fixed') {
      return completionRatio >= 1 ? activity.pointsWeight : 0;
    }
    return completionRatio * activity.pointsWeight;
  }

  /** Flat bonus points for prayers completed in jama'ath — only on the 5 Daily Prayers checklist. */
  computeJamaathBonus(activity, entry) {
    if (!entry || activity.name !== PRAYER_ACTIVITY_NAME) return 0;
    const items = entry.subItemStatuses || [];
    const jamaathCount = items.filter((i) => i.done && i.jamaath).length;
    return jamaathCount * JAMAATH_BONUS_POINTS;
  }

  /** Recompute and persist a user's DailyScore for one date, based on current entries + activities. */
  async recomputeDailyScore(userId, date) {
    const [entries, activities] = await Promise.all([
      DailyEntry.find({ userId, date }),
      Activity.find({ isActive: true }),
    ]);

    const entriesByActivity = new Map(entries.map((e) => [e.activityId.toString(), e]));

    const breakdown = [];
    let totalScore = 0;

    for (const activity of activities) {
      const entry = entriesByActivity.get(activity._id.toString());
      const completionRatio = this.computeCompletionRatio(activity, entry);
      const pointsEarned = this.computePointsEarned(activity, completionRatio) + this.computeJamaathBonus(activity, entry);
      totalScore += pointsEarned;
      breakdown.push({ activityId: activity._id, pointsEarned, completionRatio });
    }

    const dailyScore = await DailyScore.findOneAndUpdate(
      { userId, date },
      { userId, date, totalScore, breakdown },
      { upsert: true, new: true }
    );
    return dailyScore;
  }

  async getUserTotalScore(userId) {
    const scores = await DailyScore.find({ userId });
    return scores.reduce((sum, s) => sum + s.totalScore, 0);
  }

  async getLeaderboard() {
    const scores = await DailyScore.find({}).populate('userId', 'name email role');
    const todayKey = toDateKey();
    // Oldest -> newest, for the per-row sparkline (last 7 days, today included).
    const last7Days = Array.from({ length: 7 }, (_, i) => addDays(todayKey, i - 6));
    const dayIndex = new Map(last7Days.map((d, i) => [d, i]));
    const totals = new Map();

    for (const s of scores) {
      // Super admin isn't a participant — exclude them from the leaderboard.
      if (!s.userId || s.userId.role === 'admin') continue;
      const key = s.userId._id.toString();
      const existing =
        totals.get(key) ||
        { userId: key, name: s.userId.name, email: s.userId.email, totalScore: 0, todayScore: 0, sparkline: new Array(7).fill(0) };
      existing.totalScore += s.totalScore;
      if (s.date === todayKey) existing.todayScore += s.totalScore;
      const idx = dayIndex.get(s.date);
      if (idx !== undefined) existing.sparkline[idx] += s.totalScore;
      totals.set(key, existing);
    }

    const dawaCounts = await this.getWeeklyDawaCompletions(todayKey);
    for (const [userId, entry] of totals) {
      entry.dawaThisWeek = dawaCounts.get(userId) || 0;
      entry.dawaWeeklyTarget = DAWA_WEEKLY_TARGET;
    }

    return Array.from(totals.values()).sort((a, b) => b.totalScore - a.totalScore);
  }

  /** Leaderboard ranked by a single day's DailyScore, rather than the cumulative total. */
  async getDailyLeaderboard(date) {
    const scores = await DailyScore.find({ date }).populate('userId', 'name email role');
    const dawaCounts = await this.getWeeklyDawaCompletions(date);

    const entries = scores
      .filter((s) => s.userId && s.userId.role !== 'admin')
      .map((s) => ({
        userId: s.userId._id.toString(),
        name: s.userId.name,
        email: s.userId.email,
        score: s.totalScore,
        dawaThisWeek: dawaCounts.get(s.userId._id.toString()) || 0,
        dawaWeeklyTarget: DAWA_WEEKLY_TARGET,
      }));

    return { date, entries: entries.sort((a, b) => b.score - a.score) };
  }

  /** Map of userId -> count of completed Da'wa entries in the current calendar week (Mon-Sun) up to and including today. */
  async getWeeklyDawaCompletions(todayKey) {
    const dawaActivity = await Activity.findOne({ name: DAWA_ACTIVITY_NAME });
    if (!dawaActivity) return new Map();

    const weekStartKey = moment(todayKey, 'YYYY-MM-DD').startOf('isoWeek').format('YYYY-MM-DD');
    const entries = await DailyEntry.find({
      activityId: dawaActivity._id,
      date: { $gte: weekStartKey, $lte: todayKey },
      done: true,
    });

    const counts = new Map();
    for (const e of entries) {
      const key = e.userId.toString();
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return counts;
  }

  async getUserDailyBreakdown(userId) {
    return DailyScore.find({ userId }).sort({ date: 1 }).populate('breakdown.activityId', 'name unit type');
  }

  /**
   * Cumulative combined score across every participant (admins excluded), per
   * day, across every challenge day up to today. Powers the leaderboard trend
   * chart — group momentum, not an individual comparison.
   */
  async getLeaderboardTrend() {
    const status = await ChallengeService.getStatus();
    const todayKey = toDateKey();
    const days = status.started ? status.days.filter((d) => d <= todayKey) : [];
    if (days.length === 0) return { days: [], points: [] };

    const scores = await DailyScore.find({ date: { $in: days } }).populate('userId', 'role');
    const totalByDay = new Map(days.map((d) => [d, 0]));
    for (const s of scores) {
      if (!s.userId || s.userId.role === 'admin') continue;
      totalByDay.set(s.date, (totalByDay.get(s.date) || 0) + s.totalScore);
    }

    let cumulative = 0;
    const points = days.map((d) => {
      cumulative += totalByDay.get(d) || 0;
      return Math.round(cumulative * 100) / 100;
    });

    return { days, points };
  }
}

module.exports = new ScoreService();
module.exports.constants = { PRAYER_ACTIVITY_NAME, JAMAATH_BONUS_POINTS, DAWA_ACTIVITY_NAME, DAWA_WEEKLY_TARGET };
