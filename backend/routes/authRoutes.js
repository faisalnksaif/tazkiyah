const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateBody, rules } = require('../middleware/validate');

const router = express.Router();

router.post(
  '/register',
  validateBody({
    name: rules.combine(rules.required('name'), rules.isString('name')),
    email: rules.combine(rules.required('email'), rules.isEmail('email')),
    password: rules.combine(rules.required('password'), rules.minLength('password', 6)),
  }),
  authController.register
);

router.post(
  '/login',
  validateBody({
    email: rules.combine(rules.required('email'), rules.isEmail('email')),
    password: rules.required('password'),
  }),
  authController.login
);

router.get('/me', authenticate(), authController.me);

module.exports = router;
