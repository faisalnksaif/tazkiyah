import React, { useCallback, useRef, useState } from 'react';
import { Animated, RefreshControl, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Activity, ChallengeStatus, DailyEntry } from '../types';
import { activityService } from '../services/ActivityService';
import { entryService } from '../services/EntryService';
import { challengeService } from '../services/ChallengeService';
import { scoreService } from '../services/ScoreService';
import { Header } from '../components/Header';
import { ActivityItem } from '../components/ActivityItem';
import { TodayScoreCard } from '../components/TodayScoreCard';
import { CompactScoreBadge } from '../components/CompactScoreBadge';
import { ConfettiBurst } from '../components/ConfettiBurst';
import { appConfig } from '../config/appConfig';
import { useTheme } from '../theme/ThemeProvider';
import { useToast } from '../context/ToastContext';
import { toDateKey } from '../utils/dateUtils';

const AnimatedFlatList = Animated.FlatList<Activity>;

// Fades/slides the compact score badge in once the big ring (~260px tall,
// including its padding) has scrolled mostly out of view.
const COLLAPSE_START = 140;
const COLLAPSE_END = 220;

export function TodayChecklistScreen() {
  const theme = useTheme();
  const { showToast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [status, setStatus] = useState<ChallengeStatus | null>(null);
  const [todayScore, setTodayScore] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const celebratedToday = useRef(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    const [activityList, entryList, challengeStatus, myScores] = await Promise.all([
      activityService.list(),
      entryService.getToday(),
      challengeService.getStatus(),
      scoreService.myDailyBreakdown(),
    ]);
    setActivities(activityList);
    setEntries(entryList);
    setStatus(challengeStatus);

    const today = myScores.find((s) => s.date === toDateKey());
    setTodayScore(today?.totalScore ?? 0);

    const fullyComplete = !!today && today.breakdown.length > 0 && today.breakdown.every((b) => b.completionRatio >= 1);
    if (fullyComplete && !celebratedToday.current) {
      celebratedToday.current = true;
      setConfettiTrigger((t) => t + 1);
      showToast('All activities complete for today! 🎉', 'success', 3000);
    }
  }, [showToast]);

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

  const handleAddIncrement = async (activity: Activity, value: number) => {
    await entryService.addIncrement(activity._id, value);
    const sign = value > 0 ? '+' : '-';
    showToast(`${sign}${Math.abs(value)} ${activity.unit} — ${activity.name}`, value > 0 ? 'success' : 'info');
    await load();
  };

  const handleToggleCheckbox = async (activity: Activity, done: boolean) => {
    await entryService.setCheckbox(activity._id, done);
    if (done) showToast(`${activity.name} marked done`);
    await load();
  };

  const handleToggleSubItem = async (activity: Activity, label: string, done: boolean) => {
    await entryService.setChecklistItem(activity._id, label, done);
    if (done) showToast(`${label} completed`);
    await load();
  };

  const eyebrow = status?.started ? `Day ${status.dayNumber} of ${status.totalDays}`.toUpperCase() : undefined;
  const subtitle = status?.started ? undefined : `Challenge not started yet (default ${appConfig.defaultChallengeDurationDays} days)`;

  const maxPossibleScore = activities.reduce((sum, a) => sum + a.pointsWeight, 0);

  const compactOpacity = scrollY.interpolate({
    inputRange: [COLLAPSE_START, COLLAPSE_END],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const compactTranslateY = scrollY.interpolate({
    inputRange: [COLLAPSE_START, COLLAPSE_END],
    outputRange: [8, 0],
    extrapolate: 'clamp',
  });

  const styles = StyleSheet.create({
    list: { padding: 16, paddingTop: 0 },
    scoreHeader: { marginBottom: theme.spacing.sm },
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header
        title="Today's Checklist"
        eyebrow={eyebrow}
        subtitle={subtitle}
        right={
          <Animated.View style={{ opacity: compactOpacity, transform: [{ translateY: compactTranslateY }] }}>
            <CompactScoreBadge score={todayScore} maxScore={maxPossibleScore} />
          </Animated.View>
        }
      />
      <AnimatedFlatList
        data={activities}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <View style={styles.scoreHeader}>
            <TodayScoreCard score={todayScore} maxScore={maxPossibleScore} />
          </View>
        }
        renderItem={({ item }) => (
          <ActivityItem
            activity={item}
            entry={entryFor(item._id)}
            onAddIncrement={handleAddIncrement}
            onToggleCheckbox={handleToggleCheckbox}
            onToggleSubItem={handleToggleSubItem}
          />
        )}
      />
      <ConfettiBurst trigger={confettiTrigger} />
    </View>
  );
}
