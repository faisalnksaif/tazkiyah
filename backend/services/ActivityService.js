const Activity = require('../models/Activity');
const ApiError = require('../utils/ApiError');

class ActivityService {
  async list({ includeInactive = false } = {}) {
    const filter = includeInactive ? {} : { isActive: true };
    return Activity.find(filter).sort({ order: 1, createdAt: 1 });
  }

  async getById(id) {
    const activity = await Activity.findById(id);
    if (!activity) throw ApiError.notFound('Activity not found');
    return activity;
  }

  async create(data, adminId) {
    this._validateShape(data);
    return Activity.create({ ...data, createdBy: adminId });
  }

  async update(id, data) {
    const activity = await this.getById(id);
    this._validateShape({ ...activity.toObject(), ...data });
    Object.assign(activity, data);
    await activity.save();
    return activity;
  }

  async remove(id) {
    const activity = await this.getById(id);
    // Soft delete: preserves historical DailyEntry/score integrity.
    activity.isActive = false;
    await activity.save();
    return activity;
  }

  _validateShape(data) {
    if (!Activity.TYPES.includes(data.type)) {
      throw ApiError.badRequest(`type must be one of ${Activity.TYPES.join(', ')}`);
    }
    if (data.type === 'checklist' && (!Array.isArray(data.subItems) || data.subItems.length === 0)) {
      throw ApiError.badRequest('checklist activities require a non-empty subItems array');
    }
  }
}

module.exports = new ActivityService();
