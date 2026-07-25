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

type PrayerSkyTheme = {
  top: string;
  bottom: string;
  glowA: string;
  glowB: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  icon: string;
  ornament: string;
  pattern: string;
};

const PRAYER_ORDER: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};
const PRAYER_ABBREVIATIONS: Record<PrayerName, string> = {
  fajr: 'F',
  dhuhr: 'D',
  asr: 'A',
  maghrib: 'M',
  isha: 'I',
};
const PRAYER_ICONS: Record<PrayerName, keyof typeof Feather.glyphMap> = {
  fajr: 'sunrise',
  dhuhr: 'sun',
  asr: 'cloud',
  maghrib: 'sunset',
  isha: 'moon',
};

const PRAYER_SKY_THEMES: Record<PrayerName, PrayerSkyTheme> = {
  fajr: {
    top: '#5A8FA8',
    bottom: '#EED2A9',
    glowA: 'rgba(255, 219, 162, 0.48)',
    glowB: 'rgba(202, 231, 255, 0.24)',
    textPrimary: '#173A4F',
    textSecondary: 'rgba(23, 58, 79, 0.78)',
    accent: '#E3A43A',
    icon: '#1A4F6E',
    ornament: '#FCE6A8',
    pattern: 'rgba(255, 255, 255, 0.16)',
  },
  dhuhr: {
    top: '#4E9CC8',
    bottom: '#CBE8DB',
    glowA: 'rgba(244, 255, 246, 0.38)',
    glowB: 'rgba(252, 228, 171, 0.42)',
    textPrimary: '#104359',
    textSecondary: 'rgba(16, 67, 89, 0.78)',
    accent: '#E4AF3F',
    icon: '#165A73',
    ornament: '#FFE6A1',
    pattern: 'rgba(255, 255, 255, 0.14)',
  },
  asr: {
    top: '#5E90B1',
    bottom: '#DDE7D0',
    glowA: 'rgba(242, 250, 255, 0.29)',
    glowB: 'rgba(236, 193, 129, 0.28)',
    textPrimary: '#1B3F57',
    textSecondary: 'rgba(27, 63, 87, 0.78)',
    accent: '#DDA24A',
    icon: '#255A75',
    ornament: '#F3DC9A',
    pattern: 'rgba(255, 255, 255, 0.12)',
  },
  maghrib: {
    top: '#3D5486',
    bottom: '#E19B67',
    glowA: 'rgba(247, 183, 115, 0.42)',
    glowB: 'rgba(242, 220, 182, 0.22)',
    textPrimary: '#1C3259',
    textSecondary: 'rgba(28, 50, 89, 0.82)',
    accent: '#D98B3A',
    icon: '#274068',
    ornament: '#F2CF8F',
    pattern: 'rgba(255, 255, 255, 0.14)',
  },
  isha: {
    top: '#152440',
    bottom: '#2E4B6A',
    glowA: 'rgba(122, 162, 214, 0.25)',
    glowB: 'rgba(239, 220, 171, 0.13)',
    textPrimary: '#F3F5F8',
    textSecondary: 'rgba(243, 245, 248, 0.82)',
    accent: '#D9B56A',
    icon: '#DCE5F5',
    ornament: '#EFD18B',
    pattern: 'rgba(255, 255, 255, 0.12)',
  },
};

function withAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return hex;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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
  const useIslamicTheme = theme.variant === 'islamic';
  const isDarkMode = theme.mode === 'dark';
  const [now, setNow] = useState(nowIst());
  const themeTransition = useRef(new Animated.Value(1)).current;
  const glowDrift = useRef(new Animated.Value(0)).current;
  const [themeFrom, setThemeFrom] = useState<PrayerSkyTheme>(PRAYER_SKY_THEMES.fajr);
  const [themeTo, setThemeTo] = useState<PrayerSkyTheme>(PRAYER_SKY_THEMES.fajr);
  const lastPrayerRef = useRef<PrayerName>('fajr');
  const ornamentPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => setNow(nowIst()), 1000);
    return () => clearInterval(interval);
  }, []);

  let todayMoment = moment(now).startOf('day');
  let entries: Array<{ name: PrayerName; at: moment.Moment }> = [];
  let upcomingIndex = -1;
  let upcoming: { name: PrayerName; at: moment.Moment } | undefined;
  let currentPrayer: PrayerName = 'isha';

  if (prayerTimes) {
    todayMoment = moment(prayerTimes.date, 'YYYY-MM-DD');
    entries = PRAYER_ORDER.filter((name) => prayerTimes.prayers[name]).map((name) => ({
      name,
      at: todayMoment.clone().set({
        hour: moment(prayerTimes.prayers[name], 'H:mm').hour(),
        minute: moment(prayerTimes.prayers[name], 'H:mm').minute(),
      }),
    }));
    upcomingIndex = entries.findIndex((entry) => entry.at.isAfter(now));
    upcoming = upcomingIndex >= 0 ? entries[upcomingIndex] : undefined;
    currentPrayer = upcomingIndex === -1 || upcomingIndex === 0 ? 'isha' : entries[upcomingIndex - 1].name;
  }

  const skyTheme = useIslamicTheme ? PRAYER_SKY_THEMES[currentPrayer] : null;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowDrift, { toValue: 1, duration: 7000, useNativeDriver: true }),
        Animated.timing(glowDrift, { toValue: 0, duration: 7000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [glowDrift]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ornamentPulse, { toValue: 1, duration: 2600, useNativeDriver: true }),
        Animated.timing(ornamentPulse, { toValue: 0, duration: 2600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [ornamentPulse]);

  useEffect(() => {
    const nextTheme = PRAYER_SKY_THEMES[currentPrayer];
    const isInitial = lastPrayerRef.current === 'fajr' && themeTo === PRAYER_SKY_THEMES.fajr;
    if (isInitial) {
      setThemeFrom(nextTheme);
      setThemeTo(nextTheme);
      lastPrayerRef.current = currentPrayer;
      return;
    }
    if (lastPrayerRef.current === currentPrayer) return;
    setThemeFrom(themeTo);
    setThemeTo(nextTheme);
    themeTransition.stopAnimation();
    themeTransition.setValue(0);
    Animated.timing(themeTransition, {
      toValue: 1,
      duration: 900,
      useNativeDriver: false,
    }).start();
    lastPrayerRef.current = currentPrayer;
  }, [currentPrayer, themeTo, themeTransition]);

  const skyBottomColor = useIslamicTheme ? themeTransition.interpolate({ inputRange: [0, 1], outputRange: [themeFrom.bottom, themeTo.bottom] }) : theme.colors.surface;
  const skyTopColor = useIslamicTheme ? themeTransition.interpolate({ inputRange: [0, 1], outputRange: [themeFrom.top, themeTo.top] }) : theme.colors.surface;
  const glowAColor = useIslamicTheme ? themeTransition.interpolate({ inputRange: [0, 1], outputRange: [themeFrom.glowA, themeTo.glowA] }) : 'transparent';
  const glowBColor = useIslamicTheme ? themeTransition.interpolate({ inputRange: [0, 1], outputRange: [themeFrom.glowB, themeTo.glowB] }) : 'transparent';
  const textPrimaryColor = useIslamicTheme
    ? isDarkMode
      ? '#F2F7FF'
      : themeTransition.interpolate({ inputRange: [0, 1], outputRange: [themeFrom.textPrimary, themeTo.textPrimary] })
    : theme.colors.text;
  const textSecondaryColor = useIslamicTheme
    ? isDarkMode
      ? 'rgba(242,247,255,0.84)'
      : themeTransition.interpolate({ inputRange: [0, 1], outputRange: [themeFrom.textSecondary, themeTo.textSecondary] })
    : theme.colors.textMuted;
  const accentColor = useIslamicTheme
    ? isDarkMode
      ? '#F0C97E'
      : themeTransition.interpolate({ inputRange: [0, 1], outputRange: [themeFrom.accent, themeTo.accent] })
    : theme.colors.primary;
  const activeIconColor = useIslamicTheme
    ? isDarkMode
      ? '#F0C97E'
      : themeTo.accent
    : theme.colors.primary;
  const passiveIconColor = useIslamicTheme
    ? isDarkMode
      ? withAlpha('#DCE7FA', 0.86)
      : themeTo.icon
    : theme.colors.primaryDark;
  const ornamentColor = useIslamicTheme ? themeTransition.interpolate({ inputRange: [0, 1], outputRange: [themeFrom.ornament, themeTo.ornament] }) : theme.colors.primarySoft;
  const patternColor = useIslamicTheme ? themeTransition.interpolate({ inputRange: [0, 1], outputRange: [themeFrom.pattern, themeTo.pattern] }) : 'transparent';

  if (!prayerTimes || entries.length === 0) return null;

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
    card: {
      paddingVertical: useIslamicTheme ? theme.spacing.md : theme.spacing.md,
      paddingHorizontal: useIslamicTheme ? theme.spacing.sm : theme.spacing.md,
      backgroundColor: useIslamicTheme ? 'transparent' : theme.colors.surface,
      overflow: 'hidden',
      borderWidth: useIslamicTheme ? 1 : 0,
      borderColor: useIslamicTheme ? 'rgba(245,230,188,0.42)' : theme.colors.border,
    },
    skyBackdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    skyTop: {
      ...StyleSheet.absoluteFillObject,
      opacity: useIslamicTheme ? 0.82 : 0,
    },
    glowA: {
      position: 'absolute',
      top: -58,
      left: -20,
      width: 220,
      height: 140,
      borderRadius: 120,
      transform: [{ rotate: '-8deg' }],
    },
    glowB: {
      position: 'absolute',
      right: -36,
      bottom: -52,
      width: 220,
      height: 160,
      borderRadius: 140,
      transform: [{ rotate: '12deg' }],
    },
    content: {
      zIndex: 1,
    },
    topMeta: {
      paddingHorizontal: useIslamicTheme ? theme.spacing.xs : theme.spacing.xs,
      marginBottom: useIslamicTheme ? theme.spacing.xs : theme.spacing.sm,
      paddingRight: useIslamicTheme ? 48 : 72,
    },
    topMetaKicker: {
      fontSize: useIslamicTheme ? 10.5 : theme.fontSizes.xs,
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: useIslamicTheme ? 0 : 2,
    },
    topMetaTitle: {
      fontSize: useIslamicTheme ? theme.fontSizes.sm : theme.fontSizes.lg,
      fontWeight: theme.fontWeights.bold,
      marginBottom: useIslamicTheme ? 0 : 2,
    },
    topMetaSub: {
      fontSize: 0,
    },
    ornamentWrap: {
      position: 'absolute',
      top: useIslamicTheme ? 8 : 12,
      right: 12,
      width: useIslamicTheme ? 28 : 44,
      height: useIslamicTheme ? 28 : 44,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: useIslamicTheme ? 0.9 : 0,
    },
    crescentOuter: {
      width: useIslamicTheme ? 18 : 28,
      height: useIslamicTheme ? 18 : 28,
      borderRadius: 14,
    },
    crescentInner: {
      position: 'absolute',
      right: useIslamicTheme ? 2 : 4,
      top: useIslamicTheme ? 2 : 4,
      width: useIslamicTheme ? 14 : 22,
      height: useIslamicTheme ? 14 : 22,
      borderRadius: 11,
      backgroundColor: 'rgba(0,0,0,0.14)',
    },
    star: {
      position: 'absolute',
      top: useIslamicTheme ? 0 : 2,
      right: useIslamicTheme ? 2 : 5,
    },
    patternDotA: {
      position: 'absolute',
      left: 18,
      bottom: 20,
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    patternDotB: {
      position: 'absolute',
      left: 30,
      bottom: 36,
      width: 4,
      height: 4,
      borderRadius: 2,
    },
    patternDotC: {
      position: 'absolute',
      left: 42,
      bottom: 18,
      width: 3,
      height: 3,
      borderRadius: 2,
    },
    nextRow: { marginBottom: useIslamicTheme ? theme.spacing.xs : theme.spacing.sm, paddingHorizontal: theme.spacing.xs },
    nextLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 0 },
    nextLabel: { fontSize: useIslamicTheme ? 10.5 : theme.fontSizes.xs, textTransform: 'uppercase', letterSpacing: 1, color: theme.colors.textMuted },
    nextValue: { fontSize: useIslamicTheme ? theme.fontSizes.sm : theme.fontSizes.md, fontWeight: theme.fontWeights.bold, color: theme.colors.text },
    nextValueAccent: { color: theme.colors.primary },
    progressTrack: {
      height: useIslamicTheme ? 3 : 4,
      borderRadius: 2,
      backgroundColor: useIslamicTheme ? 'rgba(255,255,255,0.35)' : theme.colors.border,
      marginTop: useIslamicTheme ? theme.spacing.xs : theme.spacing.sm,
      marginHorizontal: theme.spacing.xs,
      overflow: 'hidden',
    },
    progressFill: { height: useIslamicTheme ? 3 : 4, borderRadius: 2 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    item: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: useIslamicTheme ? theme.spacing.xs : theme.spacing.xs,
      borderRadius: theme.radii.sm,
    },
    itemActive: { backgroundColor: useIslamicTheme ? 'rgba(255,255,255,0.14)' : theme.colors.primarySoft },
    itemIconCompact: { marginBottom: 2 },
    itemLabel: { fontSize: useIslamicTheme ? 11 : theme.fontSizes.xs, marginTop: useIslamicTheme ? 2 : 4, color: theme.colors.textMuted },
    itemLabelActive: { fontWeight: theme.fontWeights.medium, color: theme.colors.primary },
    itemTime: { fontSize: useIslamicTheme ? 10.5 : theme.fontSizes.xs, marginTop: useIslamicTheme ? 0 : 2, color: theme.colors.text },
    itemTimeActive: { fontWeight: theme.fontWeights.medium, color: theme.colors.primary },
    activeDot: { width: useIslamicTheme ? 3 : 4, height: useIslamicTheme ? 3 : 4, borderRadius: 2, marginTop: useIslamicTheme ? 2 : 3 },
  });

  const glowAShiftX = glowDrift.interpolate({ inputRange: [0, 1], outputRange: [-6, 8] });
  const glowAShiftY = glowDrift.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });
  const glowBShiftX = glowDrift.interpolate({ inputRange: [0, 1], outputRange: [7, -5] });
  const glowBShiftY = glowDrift.interpolate({ inputRange: [0, 1], outputRange: [0, 5] });
  const ornamentScale = ornamentPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const ornamentOpacity = ornamentPulse.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] });
  const starLift = ornamentPulse.interpolate({ inputRange: [0, 1], outputRange: [0, -2] });

  return (
    <Card style={dynamicStyles.card}>
      <View style={dynamicStyles.content}>
        {useIslamicTheme ? (
          <>
            <View style={dynamicStyles.topMeta}>
              <Animated.Text style={[dynamicStyles.topMetaKicker, { color: textSecondaryColor }]}>Current Waqt</Animated.Text>
              <Animated.Text style={[dynamicStyles.topMetaTitle, { color: textPrimaryColor }]}>{next ? `${next.label} · ${formatCountdown(next.at, now)}` : PRAYER_LABELS[currentPrayer]}</Animated.Text>
            </View>
            <Animated.View style={[dynamicStyles.ornamentWrap, { transform: [{ scale: ornamentScale }], opacity: ornamentOpacity }]}>
              <Animated.View style={[dynamicStyles.crescentOuter, { backgroundColor: ornamentColor }]} />
              <View style={dynamicStyles.crescentInner} />
              <Animated.View style={[dynamicStyles.star, { transform: [{ translateY: starLift }] }]}>
                <Feather name="star" size={11} color={themeTo.ornament} />
              </Animated.View>
            </Animated.View>
          </>
        ) : null}
        {next && useIslamicTheme ? (
          <View style={[dynamicStyles.nextRow, { marginBottom: theme.spacing.xs, flexDirection: 'row', alignItems: 'center' }]}>
            <PulseDot color={themeTo.accent} />
            <View style={[dynamicStyles.progressTrack, { flex: 1 }]}>
              <Animated.View style={[dynamicStyles.progressFill, { width: `${windowRatio * 100}%`, backgroundColor: accentColor }]} />
            </View>
          </View>
        ) : null}
        {next && !useIslamicTheme ? (
          <View style={dynamicStyles.nextRow}>
            <View style={dynamicStyles.nextLabelRow}>
              <PulseDot color={theme.colors.primary} />
              <Animated.Text style={[dynamicStyles.nextLabel, { color: textSecondaryColor }]}>Next: {next.label}</Animated.Text>
            </View>
            <Animated.Text style={[dynamicStyles.nextValue, { color: textPrimaryColor }]}> 
              <Animated.Text style={[dynamicStyles.nextValueAccent, { color: accentColor }]}>{formatCountdown(next.at, now)}</Animated.Text> remaining · {next.at.format('h:mm A')}
            </Animated.Text>
            <View style={dynamicStyles.progressTrack}>
              <Animated.View style={[dynamicStyles.progressFill, { width: `${windowRatio * 100}%`, backgroundColor: accentColor }]} />
            </View>
          </View>
        ) : null}
        <View style={dynamicStyles.row}>
          {entries.map((entry) => {
            const active = upcoming?.name === entry.name;
            return (
              <View key={entry.name} style={[dynamicStyles.item, active && dynamicStyles.itemActive]}>
                <Feather
                  name={PRAYER_ICONS[entry.name]}
                  size={useIslamicTheme ? 14 : 16}
                  color={active ? activeIconColor : passiveIconColor}
                  style={useIslamicTheme && dynamicStyles.itemIconCompact}
                />
                <Animated.Text style={[dynamicStyles.itemLabel, active && dynamicStyles.itemLabelActive, { color: active ? accentColor : textSecondaryColor }]}>
                  {PRAYER_LABELS[entry.name]}
                </Animated.Text>
                {useIslamicTheme ? null : (
                  <Animated.Text style={[dynamicStyles.itemTime, active && dynamicStyles.itemTimeActive, { color: active ? accentColor : textPrimaryColor }]}>
                    {formatClock(prayerTimes.prayers[entry.name]!) }
                  </Animated.Text>
                )}
                <View style={[dynamicStyles.activeDot, { backgroundColor: active ? (useIslamicTheme ? themeTo.accent : theme.colors.primary) : 'transparent' }]} />
              </View>
            );
          })}
          </View>
      </View>
    </Card>
  );
}
