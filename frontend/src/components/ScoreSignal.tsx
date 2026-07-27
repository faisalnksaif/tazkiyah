import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface ScoreSignalProps {
  score: number;
  size?: number;
}

// green >=90, orange >=80, red otherwise — evaluated against today's daily
// score (0-100 scale), not the cumulative leaderboard total.
export function ScoreSignal({ score, size = 12 }: ScoreSignalProps) {
  const theme = useTheme();
  const color = score >= 90 ? theme.colors.success : score >= 80 ? theme.colors.warning : theme.colors.danger;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
      }}
    />
  );
}
