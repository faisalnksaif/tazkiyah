import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LeaderboardEntry } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import { Card } from './Card';
import { Avatar } from './Avatar';
import { AnimatedNumber } from './AnimatedNumber';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  rank: number;
  isMe: boolean;
  previousScore?: number;
}

export function LeaderboardRow({ entry, rank, isMe, previousScore }: LeaderboardRowProps) {
  const theme = useTheme();
  const entrance = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const scoreChanged = previousScore !== undefined && previousScore !== entry.totalScore;

  useEffect(() => {
    Animated.timing(entrance, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!scoreChanged) return;
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 250, useNativeDriver: false }),
      Animated.timing(pulse, { toValue: 0, duration: 600, useNativeDriver: false }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.totalScore]);

  const styles = StyleSheet.create({
    wrapper: { marginBottom: 12 },
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
    score: { fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold, color: theme.colors.primary },
    card: { marginBottom: 0 },
    me: { backgroundColor: theme.colors.primarySoft, borderWidth: 1, borderColor: theme.colors.primary },
  });

  const pulseBackground = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(95,203,160,0)', 'rgba(95,203,160,0.25)'],
  });

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: entrance,
          transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
        },
      ]}
    >
      <Animated.View style={{ backgroundColor: pulseBackground, borderRadius: theme.radii.md }}>
        <Card style={isMe ? { ...styles.card, ...styles.me } : styles.card}>
          <View style={styles.row}>
            <Text style={styles.rank}>{rank}</Text>
            <Avatar name={entry.name} size={44} />
            <View style={styles.nameBlock}>
              <Text style={styles.name}>{entry.name}</Text>
              {isMe ? <Text style={styles.youBadge}>You</Text> : null}
            </View>
            <AnimatedNumber value={entry.totalScore} style={styles.score} />
          </View>
        </Card>
      </Animated.View>
    </Animated.View>
  );
}
