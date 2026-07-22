import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Activity, DailyEntry } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import { Card } from './Card';
import { ProgressBar } from './ProgressBar';
import { ProgressSlider } from './ProgressSlider';
import { Toggle } from './Toggle';
import { formatActivityValue, stepForActivity } from '../utils/activityFormat';

function sumIncrements(entry?: DailyEntry) {
  return (entry?.increments || []).reduce((sum, i) => sum + i.value, 0);
}

interface ActivityItemProps {
  activity: Activity;
  entry?: DailyEntry;
  onAddIncrement: (activity: Activity, value: number) => void;
  onToggleCheckbox: (activity: Activity, done: boolean) => void;
  onToggleSubItem: (activity: Activity, label: string, done: boolean) => void;
}

export function ActivityItem({ activity, entry, onAddIncrement, onToggleCheckbox, onToggleSubItem }: ActivityItemProps) {
  const theme = useTheme();
  const [liveDragValue, setLiveDragValue] = useState<number | null>(null);
  const total = sumIncrements(entry);

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
    subItemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
  });

  if (activity.type === 'counter' || activity.type === 'duration') {
    const displayValue = liveDragValue ?? total;
    const formatValue = formatActivityValue(activity.type, activity.unit);
    const metaText =
      activity.type === 'duration'
        ? `${formatValue(displayValue)} / ${formatValue(activity.targetValue)}`
        : `${displayValue} / ${activity.targetValue} ${activity.unit}`;

    return (
      <Card>
        <Text style={styles.name}>{activity.name}</Text>
        <Text style={styles.meta}>{metaText}</Text>
        <ProgressSlider
          total={total}
          targetValue={activity.targetValue}
          step={stepForActivity(activity.type, activity.targetValue)}
          onDragValueChange={(v) => {
            if (v !== null) setLiveDragValue(v);
          }}
          onCommitDelta={(delta) => onAddIncrement(activity, delta)}
        />
      </Card>
    );
  }

  if (activity.type === 'checkbox') {
    return (
      <Card>
        <View style={styles.row}>
          <View>
            <Text style={styles.name}>{activity.name}</Text>
            {activity.description ? <Text style={styles.meta}>{activity.description}</Text> : null}
          </View>
          <Toggle value={!!entry?.done} onValueChange={(v) => onToggleCheckbox(activity, v)} />
        </View>
      </Card>
    );
  }

  // checklist — always render from the activity's current subItems (the
  // source of truth for labels), looking up each one's done state from the
  // stored entry by label. entry.subItemStatuses freezes labels as of
  // whenever it was first created, so relying on it directly would keep
  // showing a sub-item's old name forever after an admin renames it.
  const statuses = (activity.subItems || []).map((si) => ({
    label: si.label,
    done: entry?.subItemStatuses?.find((s) => s.label === si.label)?.done ?? false,
  }));
  const doneCount = statuses.filter((s) => s.done).length;

  return (
    <Card>
      <Text style={styles.name}>{activity.name}</Text>
      <Text style={styles.meta}>
        {doneCount} / {statuses.length} completed
      </Text>
      {statuses.map((s) => (
        <View key={s.label} style={styles.subItemRow}>
          <Text style={{ color: theme.colors.text }}>{s.label}</Text>
          <Toggle value={s.done} onValueChange={(v) => onToggleSubItem(activity, s.label, v)} />
        </View>
      ))}
      <ProgressBar ratio={statuses.length ? doneCount / statuses.length : 0} />
    </Card>
  );
}
