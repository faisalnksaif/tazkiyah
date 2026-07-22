import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { CircularProgress } from './CircularProgress';

interface CompactScoreBadgeProps {
  score: number;
  maxScore: number;
}

// Small ring + numbers — the collapsed form of TodayScoreCard shown once the
// big ring has scrolled out of view.
export function CompactScoreBadge({ score, maxScore }: CompactScoreBadgeProps) {
  const theme = useTheme();
  const ratio = maxScore > 0 ? score / maxScore : 0;

  const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center' },
    ringWrap: { marginRight: theme.spacing.sm },
    scoreText: { fontSize: theme.fontSizes.md, fontWeight: theme.fontWeights.bold, color: theme.colors.text },
    maxText: { fontSize: theme.fontSizes.xs, color: theme.colors.textMuted },
  });

  return (
    <View style={styles.row}>
      <View style={styles.ringWrap}>
        <CircularProgress ratio={ratio} size={36} strokeWidth={4} />
      </View>
      <View>
        <Text style={styles.scoreText}>{score.toFixed(0)}</Text>
        {maxScore > 0 ? <Text style={styles.maxText}>of {maxScore.toFixed(0)}</Text> : null}
      </View>
    </View>
  );
}
