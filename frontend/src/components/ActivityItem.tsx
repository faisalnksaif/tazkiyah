import React, { useState } from 'react';
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
    const total = sumIncrements(entry);
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
          onDragValueChange={setLiveDragValue}
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

  // checklist
  const statuses = entry?.subItemStatuses?.length
    ? entry.subItemStatuses
    : (activity.subItems || []).map((si) => ({ label: si.label, done: false }));
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
