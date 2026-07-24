const express = require('express');
const prayerTimesController = require('../controllers/prayerTimesController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate());

router.get('/today', prayerTimesController.getToday);

module.exports = router;
