import { Platform } from 'react-native';
import { apiClient } from './ApiClient';

export interface PushSubscriptionStatus {
  supported: boolean;
  permission: NotificationPermission | 'unsupported';
  subscribed: boolean;
  reason?: string;
}

function isSupportedWebPushEnvironment() {
  if (Platform.OS !== 'web') return false;
  if (typeof window === 'undefined') return false;
  if (!('serviceWorker' in navigator)) return false;
  if (!('PushManager' in window)) return false;
  if (!('Notification' in window)) return false;
  return true;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

class PushService {
  async registerWebPushSubscription(options: { requestPermission?: boolean } = {}): Promise<PushSubscriptionStatus> {
    const requestPermission = !!options.requestPermission;
    if (!isSupportedWebPushEnvironment()) {
      return { supported: false, permission: 'unsupported', subscribed: false, reason: 'unsupported-environment' };
    }
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      return { supported: true, permission: Notification.permission, subscribed: false, reason: 'https-required' };
    }

    const { publicKey } = await apiClient.get<{ publicKey: string }>('/push/public-key');
    if (!publicKey) {
      return { supported: true, permission: Notification.permission, subscribed: false, reason: 'missing-public-key' };
    }

    let permission = Notification.permission;
    if (permission === 'default' && requestPermission) {
      permission = await Notification.requestPermission();
    }
    if (permission !== 'granted') {
      return {
        supported: true,
        permission,
        subscribed: false,
        reason: permission === 'default' ? 'permission-not-requested' : 'permission-denied',
      };
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }

    await apiClient.post('/push/subscriptions', {
      subscription: subscription.toJSON ? subscription.toJSON() : subscription,
    });

    return { supported: true, permission, subscribed: true };
  }

  async getMySubscriptions() {
    return apiClient.get<{ count: number; subscriptions: Array<{ endpoint: string; enabled: boolean }> }>('/push/subscriptions/me');
  }
}

export const pushService = new PushService();
