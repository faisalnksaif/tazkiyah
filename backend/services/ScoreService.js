const DailyEntry = require('../models/DailyEntry');
const DailyScore = require('../models/DailyScore');
const Activity = require('../models/Activity');

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
      const pointsEarned = this.computePointsEarned(activity, completionRatio);
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
    const scores = await DailyScore.find({}).populate('userId', 'name email');
    const totals = new Map();

    for (const s of scores) {
      if (!s.userId) continue;
      const key = s.userId._id.toString();
      const existing = totals.get(key) || { userId: key, name: s.userId.name, email: s.userId.email, totalScore: 0 };
      existing.totalScore += s.totalScore;
      totals.set(key, existing);
    }

    return Array.from(totals.values()).sort((a, b) => b.totalScore - a.totalScore);
  }

  async getUserDailyBreakdown(userId) {
    return DailyScore.find({ userId }).sort({ date: 1 }).populate('breakdown.activityId', 'name unit type');
  }
}

module.exports = new ScoreService();
