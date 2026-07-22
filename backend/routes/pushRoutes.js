const express = require('express');
const pushController = require('../controllers/pushController');
const { authenticate } = require('../middleware/auth');
const { validateBody, rules } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate());

router.get('/public-key', pushController.getPublicKey);

router.post(
  '/subscriptions',
  validateBody({ subscription: rules.required('subscription') }),
  pushController.subscribe
);

router.post(
  '/unsubscribe',
  validateBody({ endpoint: rules.required('endpoint') }),
  pushController.unsubscribe
);

module.exports = router;
