import React, { useCallback, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { scoreService } from '../services/ScoreService';
import { LeaderboardEntry } from '../types';
import { Header } from '../components/Header';
import { LeaderboardRow } from '../components/LeaderboardRow';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../context/AuthContext';

export function LeaderboardScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const previousScores = useRef<Map<string, number>>(new Map());

  const load = useCallback(async () => {
    const data = await scoreService.leaderboard();
    setBoard((prevBoard) => {
      previousScores.current = new Map(prevBoard.map((e) => [e.userId, e.totalScore]));
      return data;
    });
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
        renderItem={({ item, index }) => (
          <LeaderboardRow
            entry={item}
            rank={index + 1}
            isMe={item.userId === user?.id}
            previousScore={previousScores.current.get(item.userId)}
          />
        )}
      />
    </View>
  );
}
