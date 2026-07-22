import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { scoreService } from '../../services/ScoreService';
import { LeaderboardEntry } from '../../types';
import { LeaderboardRow } from '../../components/LeaderboardRow';
import { useTheme } from '../../theme/ThemeProvider';

export function AllUsersScoresScreen() {
  const theme = useTheme();
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      scoreService.leaderboard().then(setBoard);
    }, [])
  );

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.md },
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={board}
        keyExtractor={(item) => item.userId}
        renderItem={({ item, index }) => <LeaderboardRow entry={item} rank={index + 1} isMe={false} />}
      />
    </View>
  );
}
