import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { scoreService } from '../services/ScoreService';
import { DailyScore } from '../types';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { useTheme } from '../theme/ThemeProvider';
import { monthKey } from '../utils/dateUtils';

interface MonthGroup {
  month: string;
  total: number;
  days: DailyScore[];
}

export function MyProgressScreen() {
  const theme = useTheme();
  const [scores, setScores] = useState<DailyScore[]>([]);

  const load = useCallback(async () => {
    const data = await scoreService.myDailyBreakdown();
    setScores(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const overallTotal = useMemo(() => scores.reduce((sum, s) => sum + s.totalScore, 0), [scores]);

  const monthGroups: MonthGroup[] = useMemo(() => {
    const groups = new Map<string, MonthGroup>();
    for (const s of scores) {
      const key = monthKey(s.date);
      const existing = groups.get(key) || { month: key, total: 0, days: [] };
      existing.total += s.totalScore;
      existing.days.push(s);
      groups.set(key, existing);
    }
    return Array.from(groups.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [scores]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    list: { padding: theme.spacing.md },
    card: { padding: 20 },
    monthTitle: { fontSize: 18, fontWeight: theme.fontWeights.bold, color: theme.colors.text },
    totalText: { fontSize: theme.fontSizes.sm, marginTop: 2, marginBottom: theme.spacing.md },
    totalLabel: { color: theme.colors.textMuted },
    totalValue: { color: theme.colors.text, fontWeight: theme.fontWeights.bold },
    dayRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    dayText: { color: theme.colors.textMuted },
    scoreText: { color: theme.colors.primary, fontWeight: theme.fontWeights.bold },
  });

  return (
    <View style={styles.container}>
      <Header title="My Progress" subtitle={`Total score: ${overallTotal.toFixed(1)}`} />
      <FlatList
        data={monthGroups}
        keyExtractor={(g) => g.month}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={styles.monthTitle}>{item.month}</Text>
            <Text style={styles.totalText}>
              <Text style={styles.totalLabel}>Month total: </Text>
              <Text style={styles.totalValue}>{item.total.toFixed(1)}</Text>
            </Text>
            {item.days.map((day) => (
              <View key={day.date} style={styles.dayRow}>
                <Text style={styles.dayText}>{day.date}</Text>
                <Text style={styles.scoreText}>{day.totalScore.toFixed(1)} pts</Text>
              </View>
            ))}
          </Card>
        )}
      />
    </View>
  );
}
