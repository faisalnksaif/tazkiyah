const ScoreService = require('../services/ScoreService');
const asyncHandler = require('../utils/asyncHandler');

const leaderboard = asyncHandler(async (req, res) => {
  const board = await ScoreService.getLeaderboard();
  res.json(board);
});

const myDailyBreakdown = asyncHandler(async (req, res) => {
  const breakdown = await ScoreService.getUserDailyBreakdown(req.user.id);
  res.json(breakdown);
});

const userDailyBreakdown = asyncHandler(async (req, res) => {
  const breakdown = await ScoreService.getUserDailyBreakdown(req.params.userId);
  res.json(breakdown);
});

const trend = asyncHandler(async (req, res) => {
  const data = await ScoreService.getLeaderboardTrend();
  res.json(data);
});

module.exports = { leaderboard, myDailyBreakdown, userDailyBreakdown, trend };
