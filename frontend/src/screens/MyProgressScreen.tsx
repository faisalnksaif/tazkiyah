import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { scoreService } from '../services/ScoreService';
import { DailyScore, ScoreBreakdownItem } from '../types';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { ExpandChevron } from '../components/ExpandChevron';
import { useTheme } from '../theme/ThemeProvider';
import { monthKey } from '../utils/dateUtils';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MonthGroup {
  month: string;
  total: number;
  days: DailyScore[];
}

function activityName(item: ScoreBreakdownItem): string {
  return typeof item.activityId === 'string' ? item.activityId : item.activityId.name;
}

export function MyProgressScreen() {
  const theme = useTheme();
  const [scores, setScores] = useState<DailyScore[]>([]);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    const data = await scoreService.myDailyBreakdown();
    setScores(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const toggleDay = (date: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

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
    dayTextExpanded: { color: theme.colors.text, fontWeight: theme.fontWeights.medium },
    scoreRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
    scoreText: { color: theme.colors.primary, fontWeight: theme.fontWeights.bold },
    breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, paddingLeft: theme.spacing.md },
    activityName: { color: theme.colors.text, fontSize: theme.fontSizes.sm },
    activityMeta: { color: theme.colors.textMuted, fontSize: theme.fontSizes.xs },
    activityPoints: { color: theme.colors.primary, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium },
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
            {item.days.map((day) => {
              const expanded = expandedDates.has(day.date);
              return (
                <View key={day.date}>
                  <Pressable onPress={() => toggleDay(day.date)} style={styles.dayRow}>
                    <Text style={expanded ? styles.dayTextExpanded : styles.dayText}>{day.date}</Text>
                    <View style={styles.scoreRow}>
                      <Text style={styles.scoreText}>{day.totalScore.toFixed(1)} pts</Text>
                      <ExpandChevron expanded={expanded} />
                    </View>
                  </Pressable>
                  {expanded &&
                    day.breakdown.map((b, i) => (
                      <View key={i} style={styles.breakdownRow}>
                        <Text style={styles.activityName}>{activityName(b)}</Text>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.activityPoints}>{b.pointsEarned.toFixed(1)} pts</Text>
                          <Text style={styles.activityMeta}>{Math.round(b.completionRatio * 100)}% complete</Text>
                        </View>
                      </View>
                    ))}
                </View>
              );
            })}
          </Card>
        )}
      />
    </View>
  );
}
