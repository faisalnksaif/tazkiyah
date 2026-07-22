const express = require('express');
const authRoutes = require('./authRoutes');
const activityRoutes = require('./activityRoutes');
const challengeRoutes = require('./challengeRoutes');
const entryRoutes = require('./entryRoutes');
const scoreRoutes = require('./scoreRoutes');
const userRoutes = require('./userRoutes');
const appConfig = require('../config/appConfig');

const router = express.Router();

router.get('/', (req, res) => res.json({ name: appConfig.appName, status: 'ok' }));

router.use('/auth', authRoutes);
router.use('/activities', activityRoutes);
router.use('/challenge', challengeRoutes);
router.use('/entries', entryRoutes);
router.use('/scores', scoreRoutes);
router.use('/users', userRoutes);

module.exports = router;
