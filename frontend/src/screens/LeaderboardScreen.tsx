import React, { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { scoreService } from '../services/ScoreService';
import { challengeService } from '../services/ChallengeService';
import { DailyLeaderboardEntry, LeaderboardEntry, LeaderboardTrend } from '../types';
import { Header } from '../components/Header';
import { LeaderboardRow } from '../components/LeaderboardRow';
import { DailyLeaderboardRow } from '../components/DailyLeaderboardRow';
import { LeaderboardTrendChart } from '../components/LeaderboardTrendChart';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../context/AuthContext';
import { LeaderboardStackParamList } from '../navigation/LeaderboardNavigator';
import { addDays, formatDisplayDate, toDateKey } from '../utils/dateUtils';

type Mode = 'allTime' | 'daily';

export function LeaderboardScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<LeaderboardStackParamList, 'LeaderboardList'>>();
  const [mode, setMode] = useState<Mode>('allTime');
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [trend, setTrend] = useState<LeaderboardTrend | null>(null);
  const [dailyEntries, setDailyEntries] = useState<DailyLeaderboardEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(toDateKey());
  const [challengeStartDate, setChallengeStartDate] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const previousScores = useRef<Map<string, number>>(new Map());

  const today = toDateKey();

  const load = useCallback(async () => {
    if (mode === 'allTime') {
      const [data, trendData] = await Promise.all([scoreService.leaderboard(), scoreService.trend()]);
      setBoard((prevBoard) => {
        previousScores.current = new Map(prevBoard.map((e) => [e.userId, e.totalScore]));
        return data;
      });
      setTrend(trendData);
    } else {
      const [daily, status] = await Promise.all([
        scoreService.dailyLeaderboard(selectedDate),
        challengeService.getStatus(),
      ]);
      setDailyEntries(daily.entries);
      setChallengeStartDate(status.startDate ?? null);
    }
  }, [mode, selectedDate]);

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

  const canGoPrev = !challengeStartDate || selectedDate > challengeStartDate;
  const canGoNext = selectedDate < today;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    list: { padding: theme.spacing.md },
    tabRow: { flexDirection: 'row', paddingHorizontal: theme.spacing.md, gap: theme.spacing.sm, marginBottom: theme.spacing.sm },
    tab: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radii.md,
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
    },
    tabActive: { backgroundColor: theme.colors.primary },
    tabText: { fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.bold, color: theme.colors.textMuted },
    tabTextActive: { color: theme.colors.white },
    dayNav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    dayNavButton: { padding: theme.spacing.sm },
    dayLabel: { fontSize: theme.fontSizes.md, fontWeight: theme.fontWeights.bold, color: theme.colors.text },
  });

  return (
    <View style={styles.container}>
      <Header title="Leaderboard" subtitle="Ranked by total score across the challenge" />
      <View style={styles.tabRow}>
        <Pressable style={[styles.tab, mode === 'allTime' && styles.tabActive]} onPress={() => setMode('allTime')}>
          <Text style={[styles.tabText, mode === 'allTime' && styles.tabTextActive]}>All-time</Text>
        </Pressable>
        <Pressable style={[styles.tab, mode === 'daily' && styles.tabActive]} onPress={() => setMode('daily')}>
          <Text style={[styles.tabText, mode === 'daily' && styles.tabTextActive]}>By day</Text>
        </Pressable>
      </View>

      {mode === 'daily' ? (
        <View style={styles.dayNav}>
          <Pressable
            style={styles.dayNavButton}
            disabled={!canGoPrev}
            onPress={() => setSelectedDate((d) => addDays(d, -1))}
          >
            <Feather name="chevron-left" size={22} color={canGoPrev ? theme.colors.text : theme.colors.border} />
          </Pressable>
          <Text style={styles.dayLabel}>{formatDisplayDate(selectedDate)}</Text>
          <Pressable
            style={styles.dayNavButton}
            disabled={!canGoNext}
            onPress={() => setSelectedDate((d) => addDays(d, 1))}
          >
            <Feather name="chevron-right" size={22} color={canGoNext ? theme.colors.text : theme.colors.border} />
          </Pressable>
        </View>
      ) : null}

      {mode === 'allTime' ? (
        <FlatList
          data={board}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={<LeaderboardTrendChart trend={trend} />}
          renderItem={({ item, index }) => (
            <LeaderboardRow
              entry={item}
              rank={index + 1}
              isMe={item.userId === user?.id}
              previousScore={previousScores.current.get(item.userId)}
              onPress={() => navigation.navigate('MemberActivities', { userId: item.userId, name: item.name })}
            />
          )}
        />
      ) : (
        <FlatList
          data={dailyEntries}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item, index }) => (
            <DailyLeaderboardRow
              entry={item}
              rank={index + 1}
              isMe={item.userId === user?.id}
              onPress={() => navigation.navigate('MemberActivities', { userId: item.userId, name: item.name })}
            />
          )}
        />
      )}
    </View>
  );
}
