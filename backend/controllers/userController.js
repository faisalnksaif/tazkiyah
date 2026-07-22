const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Community/admin views: read-only listing of participants (no password hashes).
const list = asyncHandler(async (req, res) => {
  const users = await User.find({}, 'name email role createdAt').sort({ name: 1 });
  res.json(
    users.map((u) => ({ id: u._id.toString(), name: u.name, email: u.email, role: u.role, createdAt: u.createdAt }))
  );
});

module.exports = { list };
