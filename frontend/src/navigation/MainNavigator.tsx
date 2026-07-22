import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { TodayChecklistScreen } from '../screens/TodayChecklistScreen';
import { MyProgressScreen } from '../screens/MyProgressScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AdminNavigator } from './AdminNavigator';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeProvider';

type IconName = keyof typeof Feather.glyphMap;

// A single line-weight icon per tab — modern/minimal reads better with one
// consistent glyph, with active state carried by color alone (no filled swap).
const TAB_ICONS: Record<string, IconName> = {
  Today: 'check',
  MyProgress: 'bar-chart-2',
  Leaderboard: 'award',
  Admin: 'shield',
  Settings: 'settings',
};

const Tab = createBottomTabNavigator();

export function MainNavigator() {
  const { user } = useAuth();
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingTop: theme.spacing.sm,
          paddingBottom: theme.spacing.sm,
          height: 64,
        },
        tabBarItemStyle: { paddingVertical: theme.spacing.xs },
        tabBarIcon: ({ color, size }) => <Feather name={TAB_ICONS[route.name]} size={size - 6} color={color} />,
      })}
    >
      <Tab.Screen name="Today" component={TodayChecklistScreen} />
      <Tab.Screen name="MyProgress" component={MyProgressScreen} options={{ title: 'My Progress' }} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      {user?.role === 'admin' ? <Tab.Screen name="Admin" component={AdminNavigator} /> : null}
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
