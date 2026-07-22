const asyncHandler = require('../utils/asyncHandler');
const PushService = require('../services/PushService');

const getPublicKey = asyncHandler(async (req, res) => {
  const publicKey = PushService.getPublicKey();
  res.json({ publicKey });
});

const subscribe = asyncHandler(async (req, res) => {
  const subscription = await PushService.upsertSubscription(
    req.user.id,
    req.body.subscription,
    req.get('user-agent') || ''
  );
  res.status(201).json({ id: subscription._id, endpoint: subscription.endpoint, enabled: subscription.enabled });
});

const unsubscribe = asyncHandler(async (req, res) => {
  await PushService.unsubscribe(req.user.id, req.body.endpoint);
  res.json({ ok: true });
});

module.exports = { getPublicKey, subscribe, unsubscribe };
