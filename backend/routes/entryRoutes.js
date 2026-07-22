const express = require('express');
const entryController = require('../controllers/entryController');
const { authenticate } = require('../middleware/auth');
const { validateBody, rules } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate());

router.get('/today', entryController.getToday);
router.get('/history', entryController.getUserHistory); // own history
router.get('/history/:userId', entryController.getUserHistory); // community read-only view

router.post(
  '/increment',
  validateBody({
    activityId: rules.required('activityId'),
    value: rules.combine(rules.required('value'), rules.isNumber('value')),
  }),
  entryController.addIncrement
);

router.post(
  '/checkbox',
  validateBody({ activityId: rules.required('activityId') }),
  entryController.setCheckbox
);

router.post(
  '/checklist-item',
  validateBody({ activityId: rules.required('activityId'), subItemLabel: rules.required('subItemLabel') }),
  entryController.setChecklistItem
);

module.exports = router;
