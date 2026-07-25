import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { scoreService } from '../services/ScoreService';
import { challengeService } from '../services/ChallengeService';
import { activityService } from '../services/ActivityService';
import { entryService } from '../services/EntryService';
import { Activity, DailyEntry, DailyScore, ScoreBreakdownItem } from '../types';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { ExpandChevron } from '../components/ExpandChevron';
import { useTheme } from '../theme/ThemeProvider';
import { monthKey } from '../utils/dateUtils';
import { appConfig } from '../config/appConfig';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MonthGroup {
  month: string;
  total: number;
  days: DailyScore[];
}

const CHART_HEIGHT = 170;
const CHART_TOP_PAD = 12;
const CHART_BOTTOM_PAD = 28;
const CHART_RIGHT_PAD = 14;

function activityName(item: ScoreBreakdownItem): string {
  return typeof item.activityId === 'string' ? item.activityId : item.activityId.name;
}

export function MyProgressScreen() {
  const theme = useTheme();
  const [scores, setScores] = useState<DailyScore[]>([]);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [chartWidth, setChartWidth] = useState(0);
  const [challengeDays, setChallengeDays] = useState<number>(appConfig.defaultChallengeDurationDays);

  const load = useCallback(async () => {
    const status = await challengeService.getStatus().catch(() => null);
    const range = status?.startDate
      ? {
          startDate: status.startDate,
          endDate: status.endDate,
        }
      : {};

    const [data, history, activityList] = await Promise.all([
      scoreService.myDailyBreakdown(),
      entryService.getHistory(range),
      activityService.list(),
    ]);
    setScores(data);
    setEntries(history);
    setActivities(activityList);
    setChallengeDays(status?.totalDays || appConfig.defaultChallengeDurationDays);
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

  const totals = useMemo(() => {
    const activityById = new Map(activities.map((a) => [a._id, a]));
    let dhikrTotal = 0;
    let thawheedMinutesTotal = 0;

    for (const entry of entries) {
      const activity = activityById.get(entry.activityId);
      if (!activity) continue;

      const name = activity.name.toLowerCase();
      const incrementTotal = entry.increments.reduce((sum, inc) => sum + inc.value, 0);

      if (name.includes('dhikr')) dhikrTotal += incrementTotal;
      if (name.includes('thawheed') || name.includes('tawheed') || name.includes('tauheed')) {
        thawheedMinutesTotal += incrementTotal;
      }
    }

    return { dhikrTotal, thawheedHoursTotal: thawheedMinutesTotal / 60 };
  }, [activities, entries]);

  const trend = useMemo(() => {
    const sorted = [...scores].sort((a, b) => a.date.localeCompare(b.date));
    const recent = sorted.slice(-challengeDays);
    const points = recent.map((d) => d.totalScore);
    const labels = recent.map((d) => d.date.slice(5));
    const max = Math.max(1, ...points, 10);
    const avg = points.length > 0 ? points.reduce((sum, v) => sum + v, 0) / points.length : 0;
    const best = points.length > 0 ? Math.max(...points) : 0;
    return { points, labels, max, avg, best };
  }, [scores, challengeDays]);

  const plotHeight = CHART_HEIGHT - CHART_TOP_PAD - CHART_BOTTOM_PAD;
  const plotWidth = Math.max(0, chartWidth - CHART_RIGHT_PAD);
  const xFor = (idx: number) => (trend.points.length > 1 ? (idx / (trend.points.length - 1)) * plotWidth : plotWidth / 2);
  const yFor = (value: number) => CHART_TOP_PAD + plotHeight - (value / trend.max) * plotHeight;

  const linePath = trend.points
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(v)}`)
    .join(' ');
  const areaPath = trend.points.length
    ? `${linePath} L ${xFor(trend.points.length - 1)} ${yFor(0)} L ${xFor(0)} ${yFor(0)} Z`
    : '';

  const lastPointX = trend.points.length ? xFor(trend.points.length - 1) : 0;
  const lastPointY = trend.points.length ? yFor(trend.points[trend.points.length - 1]) : 0;

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
    chartCard: { padding: theme.spacing.md, marginBottom: theme.spacing.md },
    chartTitle: { fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.bold, color: theme.colors.text, marginBottom: 2 },
    chartSubtitle: { fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, marginBottom: theme.spacing.sm },
    chartWrap: { height: CHART_HEIGHT },
    chartStats: {
      marginTop: theme.spacing.xs,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statText: { color: theme.colors.textMuted, fontSize: theme.fontSizes.xs },
    statValue: { color: theme.colors.text, fontWeight: theme.fontWeights.medium },
    totalsCard: { padding: theme.spacing.md, marginBottom: theme.spacing.md },
    totalsTitle: {
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    totalsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      gap: theme.spacing.sm,
    },
    totalTile: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.md,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      backgroundColor: theme.variant === 'islamic'
        ? theme.mode === 'dark' ? 'rgba(114,212,206,0.08)' : 'rgba(90,183,178,0.08)'
        : theme.colors.primarySoft,
    },
    metricLabel: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSizes.xs,
      marginBottom: 3,
    },
    totalValueBig: {
      color: theme.colors.text,
      fontSize: theme.fontSizes.lg,
      fontWeight: theme.fontWeights.bold,
    },
    totalUnit: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSizes.xs,
      marginTop: 2,
    },
  });

  return (
    <View style={styles.container}>
      <Header title="My Progress" subtitle={`Total score: ${overallTotal.toFixed(1)}`} />
      <FlatList
        data={monthGroups}
        keyExtractor={(g) => g.month}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <Card style={styles.totalsCard}>
              <Text style={styles.totalsTitle}>My Totals ({challengeDays} Days)</Text>
              <View style={styles.totalsRow}>
                <View style={styles.totalTile}>
                  <Text style={styles.metricLabel}>Dhikr</Text>
                  <Text style={styles.totalValueBig}>{Math.round(totals.dhikrTotal).toLocaleString()}</Text>
                  <Text style={styles.totalUnit}>count</Text>
                </View>
                <View style={styles.totalTile}>
                  <Text style={styles.metricLabel}>Thawheed</Text>
                  <Text style={styles.totalValueBig}>{totals.thawheedHoursTotal.toFixed(1)}</Text>
                  <Text style={styles.totalUnit}>hours</Text>
                </View>
              </View>
            </Card>

            {trend.points.length > 0 ? (
              <Card style={styles.chartCard}>
                <Text style={styles.chartTitle}>{challengeDays}-Day Score Trend</Text>
                <Text style={styles.chartSubtitle}>Daily points over your latest {challengeDays} days</Text>
                <View style={styles.chartWrap} onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}>
                  {chartWidth > 0 ? (
                    <Svg width={chartWidth} height={CHART_HEIGHT}>
                      <Line x1={0} y1={yFor(0)} x2={plotWidth} y2={yFor(0)} stroke={theme.colors.border} strokeWidth={1} />
                      <Line
                        x1={0}
                        y1={yFor(trend.max * 0.5)}
                        x2={plotWidth}
                        y2={yFor(trend.max * 0.5)}
                        stroke={theme.colors.border}
                        strokeWidth={1}
                        strokeDasharray="3 4"
                      />
                      <Line x1={0} y1={yFor(trend.max)} x2={plotWidth} y2={yFor(trend.max)} stroke={theme.colors.border} strokeWidth={1} />

                      <SvgText x={0} y={yFor(0) - 4} fontSize={10} fill={theme.colors.textMuted}>0</SvgText>
                      <SvgText x={0} y={yFor(trend.max * 0.5) - 4} fontSize={10} fill={theme.colors.textMuted}>
                        {Math.round(trend.max * 0.5)}
                      </SvgText>
                      <SvgText x={0} y={yFor(trend.max) - 4} fontSize={10} fill={theme.colors.textMuted}>
                        {Math.round(trend.max)}
                      </SvgText>

                      <Path d={areaPath} fill={theme.colors.primary} fillOpacity={0.14} stroke="none" />
                      <Path d={linePath} stroke={theme.colors.primary} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />

                      <Circle cx={lastPointX} cy={lastPointY} r={6} fill={theme.colors.surface} />
                      <Circle cx={lastPointX} cy={lastPointY} r={3.5} fill={theme.colors.primary} />

                      <SvgText x={0} y={CHART_HEIGHT - 8} fontSize={10} fill={theme.colors.textMuted}>
                        {trend.labels[0]}
                      </SvgText>
                      <SvgText x={Math.max(0, plotWidth - 36)} y={CHART_HEIGHT - 8} fontSize={10} fill={theme.colors.textMuted}>
                        {trend.labels[trend.labels.length - 1]}
                      </SvgText>
                    </Svg>
                  ) : null}
                </View>
                <View style={styles.chartStats}>
                  <Text style={styles.statText}>
                    Avg <Text style={styles.statValue}>{trend.avg.toFixed(1)}</Text>
                  </Text>
                  <Text style={styles.statText}>
                    Best <Text style={styles.statValue}>{trend.best.toFixed(1)}</Text>
                  </Text>
                  <Text style={styles.statText}>
                    Days <Text style={styles.statValue}>{trend.points.length}</Text>
                  </Text>
                </View>
              </Card>
            ) : null}
          </>
        }
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
