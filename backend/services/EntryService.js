const DailyEntry = require('../models/DailyEntry');
const Activity = require('../models/Activity');
const ApiError = require('../utils/ApiError');
const { toDateKey } = require('../utils/dateUtils');
const ScoreService = require('./ScoreService');

class EntryService {
  /**
   * Append an increment (counter/duration types). Never overwrites prior
   * additions — a negative value appends a correcting entry (e.g. undoing an
   * accidental over-count) rather than mutating history.
   */
  async addIncrement(userId, activityId, value, date = toDateKey()) {
    const activity = await Activity.findById(activityId);
    if (!activity) throw ApiError.notFound('Activity not found');
    if (!['counter', 'duration'].includes(activity.type)) {
      throw ApiError.badRequest('addIncrement only applies to counter/duration activities');
    }
    if (typeof value !== 'number' || value === 0) {
      throw ApiError.badRequest('value must be a non-zero number');
    }

    const entry = await DailyEntry.findOneAndUpdate(
      { userId, activityId, date },
      { $push: { increments: { value, addedAt: new Date() } } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await ScoreService.recomputeDailyScore(userId, date);
    return entry;
  }

  /** Set the boolean done state for a checkbox activity on a given day. */
  async setCheckboxDone(userId, activityId, done, date = toDateKey()) {
    const activity = await Activity.findById(activityId);
    if (!activity) throw ApiError.notFound('Activity not found');
    if (activity.type !== 'checkbox') throw ApiError.badRequest('setCheckboxDone only applies to checkbox activities');

    const entry = await DailyEntry.findOneAndUpdate(
      { userId, activityId, date },
      { done: !!done },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await ScoreService.recomputeDailyScore(userId, date);
    return entry;
  }

  /** Toggle one sub-item (e.g. one of the 5 prayers) for a checklist activity on a given day. */
  async setChecklistItem(userId, activityId, subItemLabel, done, date = toDateKey()) {
    const activity = await Activity.findById(activityId);
    if (!activity) throw ApiError.notFound('Activity not found');
    if (activity.type !== 'checklist') throw ApiError.badRequest('setChecklistItem only applies to checklist activities');
    if (!activity.subItems?.some((si) => si.label === subItemLabel)) {
      throw ApiError.badRequest(`Unknown sub-item: ${subItemLabel}`);
    }

    let entry = await DailyEntry.findOne({ userId, activityId, date });
    if (!entry) {
      entry = new DailyEntry({
        userId,
        activityId,
        date,
        subItemStatuses: activity.subItems.map((si) => ({ label: si.label, done: false })),
      });
    }

    const target = entry.subItemStatuses.find((si) => si.label === subItemLabel);
    if (target) target.done = !!done;
    else entry.subItemStatuses.push({ label: subItemLabel, done: !!done });

    await entry.save();
    await ScoreService.recomputeDailyScore(userId, date);
    return entry;
  }

  async getTodayForUser(userId, date = toDateKey()) {
    return DailyEntry.find({ userId, date });
  }

  async getUserHistory(userId, { activityId, startDate, endDate } = {}) {
    const filter = { userId };
    if (activityId) filter.activityId = activityId;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }
    return DailyEntry.find(filter).sort({ date: 1 });
  }
}

module.exports = new EntryService();
