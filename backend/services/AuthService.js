const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const SALT_ROUNDS = 10;

class AuthService {
  async register({ name, email, password, role }) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw ApiError.conflict('An account with this email already exists');

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role === 'admin' ? 'admin' : 'user',
    });

    return this._toAuthResponse(user);
  }

  async login({ email, password }) {
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user) throw ApiError.unauthorized('Invalid email or password');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw ApiError.unauthorized('Invalid email or password');

    return this._toAuthResponse(user);
  }

  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    return this._toPublicUser(user);
  }

  _signToken(user) {
    return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    });
  }

  _toAuthResponse(user) {
    return { token: this._signToken(user), user: this._toPublicUser(user) };
  }

  _toPublicUser(user) {
    return { id: user._id.toString(), name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
  }
}

module.exports = new AuthService();
