const webpush = require('web-push');
const ApiError = require('../utils/ApiError');
const PushSubscription = require('../models/PushSubscription');

function isSubscriptionObject(subscription) {
  return (
    subscription &&
    typeof subscription.endpoint === 'string' &&
    subscription.keys &&
    typeof subscription.keys.p256dh === 'string' &&
    typeof subscription.keys.auth === 'string'
  );
}

class PushService {
  constructor() {
    this._configured = false;
    this._didAttemptConfigure = false;
  }

  _configureIfPossible() {
    if (this._didAttemptConfigure) return this._configured;
    this._didAttemptConfigure = true;

    const publicKey = process.env.WEB_PUSH_VAPID_PUBLIC_KEY;
    const privateKey = process.env.WEB_PUSH_VAPID_PRIVATE_KEY;
    const contactEmail = process.env.WEB_PUSH_CONTACT_EMAIL || 'noreply@tazkiyah.app';

    if (!publicKey || !privateKey) {
      console.warn('[push] VAPID keys missing. Push delivery is disabled.');
      return false;
    }

    webpush.setVapidDetails(`mailto:${contactEmail}`, publicKey, privateKey);
    this._configured = true;
    return true;
  }

  isConfigured() {
    return this._configureIfPossible();
  }

  getPublicKey() {
    const publicKey = process.env.WEB_PUSH_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      throw new ApiError(503, 'Web push is not configured on the server');
    }
    return publicKey;
  }

  async upsertSubscription(userId, subscription, userAgent = '') {
    if (!isSubscriptionObject(subscription)) {
      throw ApiError.badRequest('Invalid push subscription payload');
    }

    return PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        userId,
        endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime ?? null,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        userAgent,
        enabled: true,
        lastSeenAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  async unsubscribe(userId, endpoint) {
    if (!endpoint) throw ApiError.badRequest('endpoint is required');
    await PushSubscription.updateOne({ userId, endpoint }, { enabled: false, lastSeenAt: new Date() });
  }

  _toWebPushSubscription(doc) {
    return {
      endpoint: doc.endpoint,
      expirationTime: doc.expirationTime ?? null,
      keys: {
        p256dh: doc.keys?.p256dh,
        auth: doc.keys?.auth,
      },
    };
  }

  async sendToSubscription(subscriptionDoc, payload) {
    if (!this._configureIfPossible()) {
      return { ok: false, reason: 'push-not-configured' };
    }

    try {
      await webpush.sendNotification(this._toWebPushSubscription(subscriptionDoc), JSON.stringify(payload));
      return { ok: true };
    } catch (err) {
      const code = err?.statusCode;
      if (code === 404 || code === 410) {
        await PushSubscription.updateOne(
          { endpoint: subscriptionDoc.endpoint },
          { enabled: false, lastSeenAt: new Date() }
        );
      }
      return { ok: false, reason: err?.message || 'send-failed', statusCode: code };
    }
  }
}

module.exports = new PushService();
