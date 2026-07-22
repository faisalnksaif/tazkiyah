const express = require('express');
const scoreController = require('../controllers/scoreController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate());

router.get('/leaderboard', scoreController.leaderboard);
router.get('/me', scoreController.myDailyBreakdown);
router.get('/user/:userId', scoreController.userDailyBreakdown); // community read-only view

module.exports = router;
