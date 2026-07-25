import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Activity, DailyEntry } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import { Card } from './Card';
import { ProgressBar } from './ProgressBar';
import { ProgressSlider } from './ProgressSlider';
import { Toggle } from './Toggle';
import { formatActivityValue, stepForActivity } from '../utils/activityFormat';
import { ActivityGlyph } from './ActivityGlyph';

// Jama'ath (congregational prayer) earns a scoring bonus — see ScoreService —
// and only makes sense for the prayer checklist, so it's gated by name here too.
const PRAYER_ACTIVITY_NAME = '5 Daily Prayers';

type ActivityCardMood = {
  base: string;
  tintA: string;
  tintB: string;
  pattern: string;
  border: string;
};

function resolveCardMood(activity: Activity, dark: boolean): ActivityCardMood {
  const name = activity.name.toLowerCase();
  if (name.includes('dhikr') || name.includes('zikr') || name.includes('tasbeeh')) {
    return {
      base: dark ? '#112E28' : '#1F4C41',
      tintA: dark ? 'rgba(114,212,206,0.22)' : 'rgba(120,201,166,0.24)',
      tintB: dark ? 'rgba(232,196,122,0.18)' : 'rgba(236,212,145,0.2)',
      pattern: 'rgba(255,255,255,0.09)',
      border: dark ? 'rgba(114,212,206,0.38)' : 'rgba(188,225,206,0.34)',
    };
  }
  if (name.includes('quran') || name.includes('qur') || name.includes('tilawah')) {
    return {
      base: dark ? '#0F2A35' : '#24504A',
      tintA: dark ? 'rgba(114,212,206,0.2)' : 'rgba(134,220,196,0.2)',
      tintB: dark ? 'rgba(232,196,122,0.16)' : 'rgba(241,193,130,0.18)',
      pattern: 'rgba(255,255,255,0.09)',
      border: dark ? 'rgba(114,212,206,0.32)' : 'rgba(188,220,211,0.3)',
    };
  }
  if (name.includes('prayer') || name.includes('salah') || name.includes('salat')) {
    return {
      base: dark ? '#0E1F40' : '#2A4D73',
      tintA: dark ? 'rgba(130,180,255,0.28)' : 'rgba(156,200,255,0.24)',
      tintB: dark ? 'rgba(232,196,122,0.16)' : 'rgba(251,198,141,0.16)',
      pattern: 'rgba(255,255,255,0.1)',
      border: dark ? 'rgba(130,180,255,0.36)' : 'rgba(189,215,244,0.32)',
    };
  }
  if (name.includes('charity') || name.includes('sadaqah') || name.includes('zakat')) {
    return {
      base: dark ? '#2A1A08' : '#5E4524',
      tintA: dark ? 'rgba(232,196,122,0.24)' : 'rgba(246,210,136,0.2)',
      tintB: dark ? 'rgba(114,212,206,0.14)' : 'rgba(157,216,186,0.16)',
      pattern: 'rgba(255,255,255,0.09)',
      border: dark ? 'rgba(232,196,122,0.38)' : 'rgba(235,214,167,0.3)',
    };
  }
  if (activity.type === 'duration') {
    return {
      base: dark ? '#102622' : '#2F5A4D',
      tintA: dark ? 'rgba(114,212,206,0.2)' : 'rgba(145,225,196,0.2)',
      tintB: dark ? 'rgba(232,196,122,0.14)' : 'rgba(244,214,160,0.16)',
      pattern: 'rgba(255,255,255,0.08)',
      border: dark ? 'rgba(114,212,206,0.3)' : 'rgba(194,227,214,0.3)',
    };
  }
  return {
    base: dark ? '#0E1D2E' : '#1F3A34',
    tintA: dark ? 'rgba(114,212,206,0.16)' : 'rgba(125,199,176,0.16)',
    tintB: dark ? 'rgba(232,196,122,0.12)' : 'rgba(233,198,132,0.14)',
    pattern: 'rgba(255,255,255,0.08)',
    border: dark ? 'rgba(114,212,206,0.24)' : 'rgba(182,214,202,0.26)',
  };
}

function sumIncrements(entry?: DailyEntry) {
  return (entry?.increments || []).reduce((sum, i) => sum + i.value, 0);
}

interface ActivityItemProps {
  activity: Activity;
  entry?: DailyEntry;
  onAddIncrement?: (activity: Activity, value: number) => void;
  onToggleCheckbox?: (activity: Activity, done: boolean) => void;
  onToggleSubItem?: (activity: Activity, label: string, done: boolean, jamaath: boolean) => void;
  // Viewing another member's day — same layout, but nothing is tappable/draggable.
  readOnly?: boolean;
}

export function ActivityItem({ activity, entry, onAddIncrement, onToggleCheckbox, onToggleSubItem, readOnly }: ActivityItemProps) {
  const theme = useTheme();
  const useIslamicTheme = theme.variant === 'islamic';
  const [liveDragValue, setLiveDragValue] = useState<number | null>(null);
  const total = sumIncrements(entry);
  const mood = useIslamicTheme ? resolveCardMood(activity, theme.mode === 'dark') : null;
  const textOnMood = useIslamicTheme ? '#F6F5EF' : theme.colors.text;
  const textOnMoodMuted = useIslamicTheme ? 'rgba(246,245,239,0.82)' : theme.colors.textMuted;

  // Once a drag ends, keep showing the last dragged value (don't fall back
  // to the pre-commit `total` prop) until the parent's async reload lands
  // and `total` actually catches up — otherwise the meta text flickers back
  // to the old number for the brief window before the new total arrives.
  useEffect(() => {
    if (liveDragValue !== null && total === liveDragValue) {
      setLiveDragValue(null);
    }
  }, [total, liveDragValue]);

  const styles = StyleSheet.create({
    name: { fontSize: theme.fontSizes.md, fontWeight: theme.fontWeights.medium, color: theme.colors.text },
    meta: { fontSize: theme.fontSizes.xs, color: theme.colors.textMuted, marginTop: 2, marginBottom: theme.spacing.sm },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    card: {
      backgroundColor: useIslamicTheme ? mood!.base : theme.colors.surface,
      borderWidth: useIslamicTheme ? 1 : 0,
      borderColor: useIslamicTheme ? mood!.border : theme.colors.border,
      overflow: 'hidden',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    tintA: {
      position: 'absolute',
      width: 160,
      height: 120,
      borderRadius: 90,
      top: -38,
      left: -18,
      backgroundColor: mood?.tintA,
      transform: [{ rotate: '-10deg' }],
    },
    tintB: {
      position: 'absolute',
      width: 180,
      height: 120,
      borderRadius: 90,
      bottom: -46,
      right: -24,
      backgroundColor: mood?.tintB,
      transform: [{ rotate: '11deg' }],
    },
    patternA: {
      position: 'absolute',
      top: 20,
      right: 64,
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: mood?.pattern,
    },
    patternB: {
      position: 'absolute',
      top: 30,
      right: 44,
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: mood?.pattern,
    },
    patternC: {
      position: 'absolute',
      top: 18,
      right: 30,
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor: mood?.pattern,
    },
    watermarkIcon: {
      position: 'absolute',
      top: 6,
      right: 8,
      transform: [{ rotate: '-12deg' }],
      opacity: useIslamicTheme ? 0.16 : 0,
    },
    watermarkIconSecondary: {
      position: 'absolute',
      bottom: 10,
      right: 14,
      transform: [{ rotate: '8deg' }],
      opacity: useIslamicTheme ? 0.08 : 0,
    },
    content: { zIndex: 1 },
    subItemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    subItemControls: { flexDirection: 'row', alignItems: 'center' },
    jamaathChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 5,
      borderRadius: theme.radii.pill,
      borderWidth: 1,
      borderColor: useIslamicTheme ? 'rgba(255,255,255,0.45)' : theme.colors.border,
      marginRight: theme.spacing.sm,
    },
    jamaathChipActive: useIslamicTheme ? { backgroundColor: 'rgba(255,255,255,0.18)', borderColor: 'rgba(255,255,255,0.75)' } : { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.primary },
    jamaathChipDisabled: { opacity: 0.4 },
    jamaathChipText: { fontSize: theme.fontSizes.xs, color: textOnMoodMuted, marginLeft: 4 },
    jamaathChipTextActive: { color: textOnMood, fontWeight: theme.fontWeights.medium },
  });

  const withCardBackground = (content: React.ReactNode) =>
    useIslamicTheme ? (
      <Card style={styles.card}>
        <View pointerEvents="none" style={styles.backdrop}>
          <View style={styles.tintA} />
          <View style={styles.tintB} />
          <View style={styles.patternA} />
          <View style={styles.patternB} />
          <View style={styles.patternC} />
          {mood ? (
            <>
              <View style={styles.watermarkIcon} pointerEvents="none">
                <ActivityGlyph name={activity.name} color={theme.colors.white} size={86} />
              </View>
              <View style={styles.watermarkIconSecondary} pointerEvents="none">
                <ActivityGlyph name={activity.name} color={theme.colors.secondary} size={54} />
              </View>
            </>
          ) : null}
        </View>
        <View style={styles.content}>{content}</View>
      </Card>
    ) : (
      <Card>{content}</Card>
    );

  if (activity.type === 'counter' || activity.type === 'duration') {
    const displayValue = liveDragValue ?? total;
    const formatValue = formatActivityValue(activity.type, activity.unit, activity.targetValue);
    const metaText =
      activity.type === 'duration'
        ? `${formatValue(displayValue)} / ${formatValue(activity.targetValue)}`
        : `${displayValue} / ${activity.targetValue} ${activity.unit}`;

    return withCardBackground(
      <>
        <Text style={[styles.name, { color: textOnMood }]}>{activity.name}</Text>
        <Text style={[styles.meta, { color: textOnMoodMuted }]}>{metaText}</Text>
        {readOnly ? (
          <ProgressBar ratio={activity.targetValue ? total / activity.targetValue : 0} />
        ) : (
          <ProgressSlider
            total={total}
            targetValue={activity.targetValue}
            step={stepForActivity(activity.type, activity.targetValue)}
            onDragValueChange={(v) => {
              if (v !== null) setLiveDragValue(v);
            }}
            onCommitDelta={(delta) => onAddIncrement?.(activity, delta)}
          />
        )}
      </>
    );
  }

  if (activity.type === 'checkbox') {
    const complete = !!entry?.done;
    return withCardBackground(
      <>
        <View style={styles.row}>
          <View>
            <Text style={[styles.name, { color: textOnMood }]}>{activity.name}</Text>
            {activity.description ? <Text style={[styles.meta, { color: textOnMoodMuted }]}>{activity.description}</Text> : null}
          </View>
          <Toggle value={complete} onValueChange={(v) => onToggleCheckbox?.(activity, v)} disabled={readOnly} />
        </View>
      </>
    );
  }

  // checklist — always render from the activity's current subItems (the
  // source of truth for labels), looking up each one's done state from the
  // stored entry by label. entry.subItemStatuses freezes labels as of
  // whenever it was first created, so relying on it directly would keep
  // showing a sub-item's old name forever after an admin renames it.
  const statuses = (activity.subItems || []).map((si) => {
    const status = entry?.subItemStatuses?.find((s) => s.label === si.label);
    return { label: si.label, done: status?.done ?? false, jamaath: status?.jamaath ?? false };
  });
  const doneCount = statuses.filter((s) => s.done).length;
  const supportsJamaath = activity.name === PRAYER_ACTIVITY_NAME;

  return withCardBackground(
    <>
      <Text style={[styles.name, { color: textOnMood }]}>{activity.name}</Text>
      <Text style={[styles.meta, { color: textOnMoodMuted }]}>
        {doneCount} / {statuses.length} completed
      </Text>
      {statuses.map((s) => (
        <View key={s.label} style={styles.subItemRow}>
          <Text style={{ color: textOnMood }}>{s.label}</Text>
          <View style={styles.subItemControls}>
            {supportsJamaath ? (
              <Pressable
                onPress={() => onToggleSubItem?.(activity, s.label, true, !s.jamaath)}
                disabled={readOnly || !s.done}
                style={[styles.jamaathChip, s.jamaath && styles.jamaathChipActive, !s.done && styles.jamaathChipDisabled]}
                accessibilityRole="button"
                accessibilityState={{ checked: s.jamaath, disabled: readOnly || !s.done }}
              >
                <Feather name="users" size={12} color={s.jamaath ? textOnMood : textOnMoodMuted} />
                <Text style={[styles.jamaathChipText, s.jamaath && styles.jamaathChipTextActive]}>جماعة</Text>
              </Pressable>
            ) : null}
            <Toggle
              value={s.done}
              onValueChange={(v) => onToggleSubItem?.(activity, s.label, v, v && s.jamaath)}
              disabled={readOnly}
            />
          </View>
        </View>
      ))}
      <ProgressBar ratio={statuses.length ? doneCount / statuses.length : 0} />
    </>
  );
}
