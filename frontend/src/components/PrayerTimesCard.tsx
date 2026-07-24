import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import moment from 'moment';
import { Card } from './Card';
import { useTheme } from '../theme/ThemeProvider';
import { nowIst } from '../utils/dateUtils';
import { PrayerName, PrayerTimes } from '../types';

interface PrayerTimesCardProps {
  prayerTimes: PrayerTimes | null;
}

const PRAYER_ORDER: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};
const PRAYER_ICONS: Record<PrayerName, keyof typeof Feather.glyphMap> = {
  fajr: 'sunrise',
  dhuhr: 'sun',
  asr: 'cloud',
  maghrib: 'sunset',
  isha: 'moon',
};

function formatClock(time: string): string {
  return moment(time, 'H:mm').format('h:mm A');
}

function formatCountdown(target: moment.Moment, now: moment.Moment): string {
  const totalSeconds = Math.max(0, target.diff(now, 'seconds'));
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hours === 0) return `${mins}m ${secs}s`;
  return `${hours}h ${mins}m ${secs}s`;
}

// A soft breathing opacity loop — signals "this number is live/ticking" at a glance.
function usePulse(duration = 900) {
  const value = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(value, { toValue: 0.3, duration, useNativeDriver: true }),
        Animated.timing(value, { toValue: 1, duration, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [value, duration]);
  return value;
}

function PulseDot({ color }: { color: string }) {
  const opacity = usePulse();
  return <Animated.View style={[styles.pulseDot, { backgroundColor: color, opacity }]} />;
}

const styles = StyleSheet.create({
  pulseDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
});

export function PrayerTimesCard({ prayerTimes }: PrayerTimesCardProps) {
  const theme = useTheme();
  const [now, setNow] = useState(nowIst());

  useEffect(() => {
    const interval = setInterval(() => setNow(nowIst()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!prayerTimes) return null;

  const todayMoment = moment(prayerTimes.date, 'YYYY-MM-DD');
  const entries = PRAYER_ORDER.filter((name) => prayerTimes.prayers[name]).map((name) => ({
    name,
    at: todayMoment.clone().set({
      hour: moment(prayerTimes.prayers[name], 'H:mm').hour(),
      minute: moment(prayerTimes.prayers[name], 'H:mm').minute(),
    }),
  }));

  const upcomingIndex = entries.findIndex((entry) => entry.at.isAfter(now));
  const upcoming = upcomingIndex >= 0 ? entries[upcomingIndex] : undefined;
  const next = upcoming
    ? { label: PRAYER_LABELS[upcoming.name], at: upcoming.at }
    : prayerTimes.tomorrowFajr
    ? { label: 'Fajr', at: todayMoment.clone().add(1, 'day').set({
        hour: moment(prayerTimes.tomorrowFajr, 'H:mm').hour(),
        minute: moment(prayerTimes.tomorrowFajr, 'H:mm').minute(),
      }) }
    : null;

  // Windows the countdown as a fraction of time elapsed since the previous
  // prayer, so the bar visibly drains toward the next one rather than just
  // sitting there as static text.
  const windowStart =
    upcomingIndex > 0
      ? entries[upcomingIndex - 1].at // between two prayers today
      : upcomingIndex === 0
      ? todayMoment.clone().startOf('day') // before Fajr
      : entries[entries.length - 1].at; // after Isha — windowing toward tomorrow's Fajr
  const windowRatio = next
    ? Math.min(1, Math.max(0, now.diff(windowStart, 'seconds') / next.at.diff(windowStart, 'seconds')))
    : 0;

  const dynamicStyles = StyleSheet.create({
    card: { paddingVertical: theme.spacing.md, backgroundColor: theme.colors.primarySoft },
    nextRow: { marginBottom: theme.spacing.sm, paddingHorizontal: theme.spacing.xs },
    nextLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    nextLabel: { fontSize: theme.fontSizes.xs, color: theme.colors.primaryDark, textTransform: 'uppercase', letterSpacing: 1 },
    nextValue: { fontSize: theme.fontSizes.md, fontWeight: theme.fontWeights.bold, color: theme.colors.text },
    nextValueAccent: { color: theme.colors.primary },
    progressTrack: {
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.border,
      marginTop: theme.spacing.sm,
      marginHorizontal: theme.spacing.xs,
      overflow: 'hidden',
    },
    progressFill: { height: 4, borderRadius: 2, backgroundColor: theme.colors.primary },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    item: { flex: 1, alignItems: 'center', paddingVertical: theme.spacing.xs, borderRadius: theme.radii.sm },
    itemLabel: { fontSize: theme.fontSizes.xs, color: theme.colors.primaryDark, marginTop: 4 },
    itemLabelActive: { color: theme.colors.primary, fontWeight: theme.fontWeights.medium },
    itemTime: { fontSize: theme.fontSizes.xs, color: theme.colors.text, marginTop: 2 },
    itemTimeActive: { color: theme.colors.primary, fontWeight: theme.fontWeights.medium },
    activeDot: { width: 4, height: 4, borderRadius: 2, marginTop: 3 },
  });

  return (
    <Card style={dynamicStyles.card}>
      {next ? (
        <View style={dynamicStyles.nextRow}>
          <View style={dynamicStyles.nextLabelRow}>
            <PulseDot color={theme.colors.primary} />
            <Text style={dynamicStyles.nextLabel}>Next: {next.label}</Text>
          </View>
          <Text style={dynamicStyles.nextValue}>
            <Text style={dynamicStyles.nextValueAccent}>{formatCountdown(next.at, now)}</Text> remaining · {next.at.format('h:mm A')}
          </Text>
          <View style={dynamicStyles.progressTrack}>
            <View style={[dynamicStyles.progressFill, { width: `${windowRatio * 100}%` }]} />
          </View>
        </View>
      ) : null}
      <View style={dynamicStyles.row}>
        {entries.map((entry) => {
          const active = upcoming?.name === entry.name;
          return (
            <View key={entry.name} style={dynamicStyles.item}>
              <Feather name={PRAYER_ICONS[entry.name]} size={16} color={active ? theme.colors.primary : theme.colors.primaryDark} />
              <Text style={[dynamicStyles.itemLabel, active && dynamicStyles.itemLabelActive]}>{PRAYER_LABELS[entry.name]}</Text>
              <Text style={[dynamicStyles.itemTime, active && dynamicStyles.itemTimeActive]}>{formatClock(prayerTimes.prayers[entry.name]!)}</Text>
              <View style={[dynamicStyles.activeDot, { backgroundColor: active ? theme.colors.primary : 'transparent' }]} />
            </View>
          );
        })}
      </View>
    </Card>
  );
}
