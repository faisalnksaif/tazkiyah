const express = require('express');
const challengeController = require('../controllers/challengeController');
const { authenticate, requireRole } = require('../middleware/auth');
const { validateBody, rules } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate());

router.get('/status', challengeController.getStatus);

router.post(
  '/configure',
  requireRole('admin'),
  validateBody({
    startDate: rules.required('startDate'),
    durationDays: rules.isNumber('durationDays'),
  }),
  challengeController.configure
);

module.exports = router;
