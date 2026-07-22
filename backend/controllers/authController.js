const AuthService = require('../services/AuthService');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const result = await AuthService.register({ name, email, password });
  res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await AuthService.login({ email, password });
  res.json(result);
});

const me = asyncHandler(async (req, res) => {
  const user = await AuthService.getMe(req.user.id);
  res.json(user);
});

module.exports = { register, login, me };
