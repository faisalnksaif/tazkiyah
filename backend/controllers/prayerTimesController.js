const PrayerTimesService = require('../services/PrayerTimesService');
const asyncHandler = require('../utils/asyncHandler');

const getToday = asyncHandler(async (req, res) => {
  res.json(PrayerTimesService.getToday());
});

module.exports = { getToday };
