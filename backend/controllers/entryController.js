const EntryService = require('../services/EntryService');
const asyncHandler = require('../utils/asyncHandler');
const { toDateKey } = require('../utils/dateUtils');
const ApiError = require('../utils/ApiError');

const getToday = asyncHandler(async (req, res) => {
  const date = req.query.date || toDateKey();
  const entries = await EntryService.getTodayForUser(req.user.id, date);
  res.json(entries);
});

const getUserHistory = asyncHandler(async (req, res) => {
  const { activityId, startDate, endDate } = req.query;
  const userId = req.params.userId || req.user.id;
  const entries = await EntryService.getUserHistory(userId, { activityId, startDate, endDate });
  res.json(entries);
});

const addIncrement = asyncHandler(async (req, res) => {
  const { activityId, value, date } = req.body;
  const entry = await EntryService.addIncrement(req.user.id, activityId, value, date);
  res.status(201).json(entry);
});

const setCheckbox = asyncHandler(async (req, res) => {
  const { activityId, done, date } = req.body;
  const entry = await EntryService.setCheckboxDone(req.user.id, activityId, done, date);
  res.json(entry);
});

const setChecklistItem = asyncHandler(async (req, res) => {
  const { activityId, subItemLabel, done, date } = req.body;
  if (!subItemLabel) throw ApiError.badRequest('subItemLabel is required');
  const entry = await EntryService.setChecklistItem(req.user.id, activityId, subItemLabel, done, date);
  res.json(entry);
});

module.exports = { getToday, getUserHistory, addIncrement, setCheckbox, setChecklistItem };
