const ActivityService = require('../services/ActivityService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const includeInactive = req.user.role === 'admin' && req.query.includeInactive === 'true';
  const activities = await ActivityService.list({ includeInactive });
  res.json(activities);
});

const getOne = asyncHandler(async (req, res) => {
  const activity = await ActivityService.getById(req.params.id);
  res.json(activity);
});

const create = asyncHandler(async (req, res) => {
  const activity = await ActivityService.create(req.body, req.user.id);
  res.status(201).json(activity);
});

const update = asyncHandler(async (req, res) => {
  const activity = await ActivityService.update(req.params.id, req.body);
  res.json(activity);
});

const remove = asyncHandler(async (req, res) => {
  const activity = await ActivityService.remove(req.params.id);
  res.json(activity);
});

module.exports = { list, getOne, create, update, remove };
