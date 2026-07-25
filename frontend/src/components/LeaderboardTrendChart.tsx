import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { Card } from './Card';
import { useTheme } from '../theme/ThemeProvider';
import { LeaderboardTrend } from '../types';

interface LeaderboardTrendChartProps {
  trend: LeaderboardTrend | null;
}

const CHART_HEIGHT = 140;
const RIGHT_LABEL_PAD = 0;

function compactDayLabel(value: string): string {
  // backend typically returns YYYY-MM-DD; fallback to raw if a different format appears
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.slice(5);
  return value;
}

export function LeaderboardTrendChart({ trend }: LeaderboardTrendChartProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  const styles = StyleSheet.create({
    title: { fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.bold, color: theme.colors.text, marginBottom: 2 },
    subtitle: { fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, marginBottom: theme.spacing.sm },
    chartWrap: { height: CHART_HEIGHT },
  });

  if (!trend || trend.days.length === 0) return null;

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const { days, points } = trend;
  const maxValue = Math.max(1, ...points);
  const minValue = Math.min(...points);
  const firstValue = points[0];
  const plotWidth = Math.max(0, width - RIGHT_LABEL_PAD);
  const topPad = 10;
  const bottomPad = 22;
  const plotHeight = CHART_HEIGHT - topPad - bottomPad;

  const xFor = (i: number) => (points.length > 1 ? (i / (points.length - 1)) * plotWidth : plotWidth / 2);
  const yFor = (value: number) => topPad + plotHeight - (value / maxValue) * plotHeight;

  const linePath = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(v)}`).join(' ');
  const areaPath = `${linePath} L ${xFor(points.length - 1)} ${yFor(0)} L ${xFor(0)} ${yFor(0)} Z`;

  const lastX = xFor(points.length - 1);
  const lastY = yFor(points[points.length - 1]);
  const currentTotal = points[points.length - 1];
  const delta = currentTotal - firstValue;

  const peakValue = Math.max(...points);
  const peakIndex = points.findIndex((p) => p === peakValue);
  const peakX = xFor(peakIndex);
  const peakY = yFor(peakValue);

  const startLabel = compactDayLabel(days[0]);
  const endLabel = compactDayLabel(days[days.length - 1]);
  const currentLabelX = Math.max(8, lastX - 8);

  const midpoint = minValue + (maxValue - minValue) / 2;

  return (
    <Card>
      <Text style={styles.title}>Group Score Trend</Text>
      <Text style={styles.subtitle}>Combined cumulative points, all members</Text>
      <View style={styles.chartWrap} onLayout={onLayout}>
        {width > 0 ? (
          <Svg width={width} height={CHART_HEIGHT}>
            {/* Recessive gridlines: baseline and top */}
            <Line x1={0} y1={yFor(0)} x2={plotWidth} y2={yFor(0)} stroke={theme.colors.border} strokeWidth={1} />
            <Line x1={0} y1={yFor(midpoint)} x2={plotWidth} y2={yFor(midpoint)} stroke={theme.colors.border} strokeWidth={1} strokeDasharray="3 4" />
            <Line x1={0} y1={yFor(maxValue)} x2={plotWidth} y2={yFor(maxValue)} stroke={theme.colors.border} strokeWidth={1} />
            <SvgText x={0} y={yFor(0) - 3} fontSize={10} fill={theme.colors.textMuted}>
              0
            </SvgText>
            <SvgText x={0} y={yFor(midpoint) - 3} fontSize={10} fill={theme.colors.textMuted}>
              {Math.round(midpoint)}
            </SvgText>
            <SvgText x={0} y={yFor(maxValue) - 3} fontSize={10} fill={theme.colors.textMuted}>
              {Math.round(maxValue)}
            </SvgText>

            {/* Single series — no legend needed, area fill carries the "this is one story" read */}
            <Path d={areaPath} fill={theme.colors.primary} fillOpacity={0.1} stroke="none" />
            <Path d={linePath} stroke={theme.colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />

            {/* Peak marker */}
            <Circle cx={peakX} cy={peakY} r={5} fill={theme.colors.surface} />
            <Circle cx={peakX} cy={peakY} r={3} fill={theme.colors.primary} />

            <Circle cx={lastX} cy={lastY} r={6} fill={theme.colors.surface} />
            <Circle cx={lastX} cy={lastY} r={4} fill={theme.colors.primary} />
            <SvgText x={currentLabelX} y={lastY-1 } fontSize={12} fontWeight="700" fill={theme.colors.text} textAnchor="end">
              {Math.round(currentTotal)}
            </SvgText>

            {/* Start/end day labels */}
            <SvgText x={0} y={CHART_HEIGHT - 8} fontSize={10} fill={theme.colors.textMuted}>
              {startLabel}
            </SvgText>
            <SvgText x={Math.max(0, plotWidth - 34)} y={CHART_HEIGHT - 8} fontSize={10} fill={theme.colors.textMuted}>
              {endLabel}
            </SvgText>
          </Svg>
        ) : null}
      </View>

      <View style={{ marginTop: theme.spacing.xs, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSizes.xs }}>
          Start <Text style={{ color: theme.colors.text, fontWeight: theme.fontWeights.medium }}>{Math.round(firstValue)}</Text>
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSizes.xs }}>
          Peak <Text style={{ color: theme.colors.text, fontWeight: theme.fontWeights.medium }}>{Math.round(peakValue)}</Text>
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSizes.xs }}>
          Change <Text style={{ color: delta >= 0 ? theme.colors.primary : theme.colors.danger, fontWeight: theme.fontWeights.bold }}>{delta >= 0 ? '+' : ''}{Math.round(delta)}</Text>
        </Text>
      </View>
    </Card>
  );
}
