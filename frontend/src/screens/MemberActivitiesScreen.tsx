import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { Activity, DailyEntry } from '../types';
import { activityService } from '../services/ActivityService';
import { entryService } from '../services/EntryService';
import { ActivityItem } from '../components/ActivityItem';
import { useTheme } from '../theme/ThemeProvider';
import { toDateKey, formatDisplayDate } from '../utils/dateUtils';
import { LeaderboardStackParamList } from '../navigation/LeaderboardNavigator';

// Read-only view of another member's activities for today — same layout as
// TodayChecklistScreen, but sourced via the community history endpoint
// (entries/history/:userId) instead of the "my today" one, and every
// ActivityItem is rendered with readOnly so nothing here is tappable.
export function MemberActivitiesScreen() {
  const theme = useTheme();
  const route = useRoute<RouteProp<LeaderboardStackParamList, 'MemberActivities'>>();
  const { userId } = route.params;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const today = toDateKey();

  const load = useCallback(async () => {
    const [activityList, entryList] = await Promise.all([
      activityService.list(),
      entryService.getHistory({ userId, startDate: today, endDate: today }),
    ]);
    setActivities(activityList);
    setEntries(entryList);
  }, [userId, today]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const entryFor = (activityId: string) => entries.find((e) => e.activityId === activityId);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    list: { padding: theme.spacing.md },
    subtitle: { fontSize: theme.fontSizes.sm, color: theme.colors.textMuted, marginBottom: theme.spacing.md },
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={activities}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={<Text style={styles.subtitle}>{formatDisplayDate(today)}</Text>}
        renderItem={({ item }) => <ActivityItem activity={item} entry={entryFor(item._id)} readOnly />}
      />
    </View>
  );
}
