import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { CircularProgress } from './CircularProgress';
import { AnimatedNumber } from './AnimatedNumber';

interface TodayScoreCardProps {
  score: number;
  maxScore: number;
}

export function TodayScoreCard({ score, maxScore }: TodayScoreCardProps) {
  const theme = useTheme();
  const ratio = maxScore > 0 ? score / maxScore : 0;

  const styles = StyleSheet.create({
    container: { alignItems: 'center', paddingVertical: theme.spacing.lg },
    scoreNumber: { fontSize: 44, fontWeight: theme.fontWeights.bold, color: theme.colors.text },
    maxScore: { fontSize: theme.fontSizes.sm, color: theme.colors.textMuted, marginTop: 2 },
  });

  return (
    <View style={styles.container}>
      <CircularProgress ratio={ratio} size={208} strokeWidth={14}>
        <AnimatedNumber value={score} style={styles.scoreNumber} decimals={0} />
        {maxScore > 0 ? <Text style={styles.maxScore}>of {maxScore.toFixed(0)} possible</Text> : null}
      </CircularProgress>
    </View>
  );
}
