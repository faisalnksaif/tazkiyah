const express = require('express');
const activityController = require('../controllers/activityController');
const { authenticate, requireRole } = require('../middleware/auth');
const { validateBody, rules } = require('../middleware/validate');
const Activity = require('../models/Activity');

const router = express.Router();

router.use(authenticate());

// All authenticated users can view the (active) activity list.
router.get('/', activityController.list);
router.get('/:id', activityController.getOne);

// Only super admin can manage the activity catalog.
router.post(
  '/',
  requireRole('admin'),
  validateBody({
    name: rules.combine(rules.required('name'), rules.isString('name')),
    type: rules.combine(rules.required('type'), rules.isOneOf('type', Activity.TYPES)),
    pointsWeight: rules.isNumber('pointsWeight'),
  }),
  activityController.create
);
router.put('/:id', requireRole('admin'), activityController.update);
router.delete('/:id', requireRole('admin'), activityController.remove);

module.exports = router;
