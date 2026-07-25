import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { TodayChecklistScreen } from '../screens/TodayChecklistScreen';
import { MyProgressScreen } from '../screens/MyProgressScreen';
import { LeaderboardNavigator } from './LeaderboardNavigator';
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
  const useIslamicTheme = theme.variant === 'islamic';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: useIslamicTheme ? theme.colors.surface : theme.colors.surface,
          borderTopColor: useIslamicTheme ? theme.colors.border : theme.colors.border,
          paddingTop: theme.spacing.sm,
          paddingBottom: theme.spacing.sm,
          height: 64,
        },
        tabBarItemStyle: { paddingVertical: theme.spacing.xs },
        tabBarIcon: ({ color, size, focused }) => (
          <Feather name={TAB_ICONS[route.name]} size={size - 6} color={color} />
        ),
        tabBarLabelStyle: {
          fontWeight: theme.fontWeights.medium,
          letterSpacing: useIslamicTheme ? 0.4 : 0,
        },
      })}
    >
      <Tab.Screen name="Today" component={TodayChecklistScreen} />
      <Tab.Screen name="MyProgress" component={MyProgressScreen} options={{ title: 'My Progress' }} />
      <Tab.Screen name="Leaderboard" component={LeaderboardNavigator} />
      {user?.role === 'admin' ? <Tab.Screen name="Admin" component={AdminNavigator} /> : null}
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
