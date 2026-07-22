import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme, useThemeMode } from '../theme/ThemeProvider';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
import { Toggle } from '../components/Toggle';
import { appConfig } from '../config/appConfig';
import { formatApiError } from '../services/ApiClient';
import { pushService } from '../services/PushService';

export function SettingsScreen() {
  const theme = useTheme();
  const { mode, toggleMode } = useThemeMode();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [notificationLoading, setNotificationLoading] = useState(false);

  const enablePrayerNotifications = async () => {
    setNotificationLoading(true);
    try {
      const status = await pushService.registerWebPushSubscription({ requestPermission: true });
      if (status.subscribed) {
        const current = await pushService.getMySubscriptions();
        showToast(`Prayer notifications enabled (${current.count} subscription${current.count === 1 ? '' : 's'}).`, 'success');
        return;
      }

      if (status.reason === 'permission-denied') {
        showToast('Notifications are blocked in browser settings for this site.', 'error');
        return;
      }

      if (status.reason === 'https-required') {
        showToast('Notifications require HTTPS.', 'error');
        return;
      }

      showToast('Could not enable notifications yet. Please try again.', 'info');
    } catch (err) {
      showToast(formatApiError(err, 'Failed to enable notifications'), 'error');
    } finally {
      setNotificationLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: theme.spacing.md },
    profileRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
    name: { fontSize: 17, fontWeight: theme.fontWeights.bold, color: theme.colors.text },
    email: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    label: { fontSize: theme.fontSizes.md, color: theme.colors.text },
    sectionLabel: {
      fontSize: 12.5,
      color: theme.colors.textMuted,
      marginBottom: theme.spacing.xs,
      marginTop: theme.spacing.lg,
      textTransform: 'uppercase',
      letterSpacing: 1.4, // ~0.1em at this size
      fontWeight: theme.fontWeights.medium,
    },
    version: { fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, textAlign: 'center', marginTop: theme.spacing.lg },
  });

  return (
    <View style={styles.container}>
      <Header title="Settings" />
      <View style={styles.content}>
        {user ? (
          <Card>
            <View style={styles.profileRow}>
              <Avatar name={user.name} size={48} backgroundColor={theme.colors.primarySoft} textColor={theme.colors.primary} />
              <View>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.email}>{user.email}</Text>
              </View>
            </View>
          </Card>
        ) : null}

        <Text style={[styles.sectionLabel, { marginTop: theme.spacing.md }]}>Appearance</Text>
        <Card>
          <View style={styles.row}>
            <Text style={styles.label}>Dark mode</Text>
            <Toggle value={mode === 'dark'} onValueChange={toggleMode} />
          </View>
        </Card>

        <Text style={styles.sectionLabel}>Account</Text>
        <Card>
          <Button
            title="Enable Prayer Notifications"
            onPress={enablePrayerNotifications}
            loading={notificationLoading}
          />
        </Card>

        <Text style={styles.sectionLabel}>Session</Text>
        <Button title="Log Out" variant="danger" onPress={logout} />

        <Text style={styles.version}>
          {appConfig.appName} · v{appConfig.version}
        </Text>
      </View>
    </View>
  );
}
