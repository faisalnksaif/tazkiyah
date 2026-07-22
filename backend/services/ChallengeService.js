const ChallengeConfig = require('../models/ChallengeConfig');
const ApiError = require('../utils/ApiError');
const { getChallengeStatus } = require('../utils/dateUtils');
const appConfig = require('../config/appConfig');

class ChallengeService {
  /** Returns the single active config, or null if the super admin hasn't configured one yet. */
  async getConfig() {
    return ChallengeConfig.findOne().sort({ createdAt: -1 });
  }

  async getStatus(now = new Date()) {
    const config = await this.getConfig();
    return getChallengeStatus(config, now);
  }

  /** Super admin sets/replaces the (singleton) challenge configuration. */
  async configure({ startDate, durationDays, isActive } = {}) {
    if (!startDate) throw ApiError.badRequest('startDate is required');
    const resolvedDuration = durationDays ?? appConfig.defaultChallengeDurationDays;
    if (resolvedDuration < 1) throw ApiError.badRequest('durationDays must be at least 1');

    let config = await this.getConfig();
    if (!config) {
      config = new ChallengeConfig({});
    }
    config.startDate = new Date(startDate);
    config.durationDays = resolvedDuration;
    config.isActive = isActive ?? true;
    await config.save();
    return config;
  }
}

module.exports = new ChallengeService();
