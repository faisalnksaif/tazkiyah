const ScoreService = require('../services/ScoreService');
const asyncHandler = require('../utils/asyncHandler');

const leaderboard = asyncHandler(async (req, res) => {
  const board = await ScoreService.getLeaderboard();
  res.json(board);
});

const dailyLeaderboard = asyncHandler(async (req, res) => {
  const { date } = req.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ message: 'date must be in YYYY-MM-DD format' });
  }
  const board = await ScoreService.getDailyLeaderboard(date);
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

module.exports = { leaderboard, dailyLeaderboard, myDailyBreakdown, userDailyBreakdown, trend };
