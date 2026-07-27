import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { DailyLeaderboardEntry } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import { Card } from './Card';
import { Avatar } from './Avatar';
import { ScoreSignal } from './ScoreSignal';

interface DailyLeaderboardRowProps {
  entry: DailyLeaderboardEntry;
  rank: number;
  isMe: boolean;
  onPress?: () => void;
}

export function DailyLeaderboardRow({ entry, rank, isMe, onPress }: DailyLeaderboardRowProps) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
    rank: {
      width: 28,
      fontSize: theme.fontSizes.md,
      fontWeight: theme.fontWeights.bold,
      color: rank === 1 ? theme.colors.primary : theme.colors.textMuted,
      textAlign: 'center',
    },
    nameBlock: { flex: 1 },
    name: { fontSize: theme.fontSizes.md, fontWeight: theme.fontWeights.bold, color: theme.colors.text },
    youBadge: { fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, color: theme.colors.primary, marginTop: 1 },
    dawaBadge: { fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.medium, marginTop: 1 },
    score: { fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold, color: theme.colors.primary },
    card: { marginBottom: 0 },
    me: { backgroundColor: theme.colors.primarySoft, borderWidth: 1, borderColor: theme.colors.primary },
    wrapper: { marginBottom: 12 },
  });

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={onPress} disabled={!onPress}>
        <Card style={isMe ? { ...styles.card, ...styles.me } : styles.card}>
          <View style={styles.row}>
            <Text style={styles.rank}>{rank}</Text>
            <Avatar name={entry.name} size={44} />
            <View style={styles.nameBlock}>
              <Text style={styles.name} numberOfLines={1}>
                {entry.name}
              </Text>
              {isMe ? <Text style={styles.youBadge}>You</Text> : null}
              <Text
                style={[
                  styles.dawaBadge,
                  { color: entry.dawaThisWeek >= entry.dawaWeeklyTarget ? theme.colors.success : theme.colors.textMuted },
                ]}
              >
                Da'wa {entry.dawaThisWeek}/{entry.dawaWeeklyTarget} this week
              </Text>
            </View>
            <ScoreSignal score={entry.score} />
            <Text style={styles.score}>{entry.score.toFixed(0)}</Text>
            {onPress ? <Feather name="chevron-right" size={18} color={theme.colors.textMuted} /> : null}
          </View>
        </Card>
      </Pressable>
    </View>
  );
}
