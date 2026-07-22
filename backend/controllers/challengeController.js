const ChallengeService = require('../services/ChallengeService');
const asyncHandler = require('../utils/asyncHandler');

const getStatus = asyncHandler(async (req, res) => {
  const status = await ChallengeService.getStatus();
  res.json(status);
});

const configure = asyncHandler(async (req, res) => {
  const config = await ChallengeService.configure(req.body);
  res.json(config);
});

module.exports = { getStatus, configure };
