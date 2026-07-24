import React, { useCallback, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { scoreService } from '../services/ScoreService';
import { LeaderboardEntry, LeaderboardTrend } from '../types';
import { Header } from '../components/Header';
import { LeaderboardRow } from '../components/LeaderboardRow';
import { LeaderboardTrendChart } from '../components/LeaderboardTrendChart';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../context/AuthContext';
import { LeaderboardStackParamList } from '../navigation/LeaderboardNavigator';

export function LeaderboardScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<LeaderboardStackParamList, 'LeaderboardList'>>();
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [trend, setTrend] = useState<LeaderboardTrend | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const previousScores = useRef<Map<string, number>>(new Map());

  const load = useCallback(async () => {
    const [data, trendData] = await Promise.all([scoreService.leaderboard(), scoreService.trend()]);
    setBoard((prevBoard) => {
      previousScores.current = new Map(prevBoard.map((e) => [e.userId, e.totalScore]));
      return data;
    });
    setTrend(trendData);
  }, []);

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

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    list: { padding: theme.spacing.md },
  });

  return (
    <View style={styles.container}>
      <Header title="Leaderboard" subtitle="Ranked by total score across the challenge" />
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
    </View>
  );
}
