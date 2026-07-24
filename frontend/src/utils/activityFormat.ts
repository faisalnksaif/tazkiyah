import { ActivityType } from '../types';

// Duration sliders stay at the finest step (1 minute) for smooth, continuous
// dragging. Counter sliders scale their step to the target's magnitude —
// large targets (e.g. 6000 dhikr) move in round hundreds rather than ones.
function counterStep(targetValue: number): number {
  if (targetValue >= 1000) return 100;
  if (targetValue >= 100) return 25;
  if (targetValue >= 20) return 5;
  return 1;
}

/** Slider step size for a counter/duration activity's ProgressSlider. */
export function stepForActivity(type: ActivityType, targetValue: number): number {
  return type === 'duration' ? 1 : counterStep(targetValue || 1);
}

/** "1.5 hrs" / "3 hrs" — duration activities are always displayed in hours, not raw minutes. */
export function formatHours(minutes: number): string {
  const hours = minutes / 60;
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded % 1 === 0 ? rounded : rounded.toFixed(1)} hrs`;
}

/** "7 min" — for short-target duration activities (e.g. a 10-minute Reading slider) where hours would round to ~0. */
export function formatMinutes(minutes: number): string {
  return `${Math.round(minutes)} min`;
}

/**
 * Value formatter for a counter/duration activity — raw unit for counters;
 * for durations, minutes when the target is under an hour (hours would be
 * unreadable, e.g. "0.2 hrs"), hours otherwise.
 */
export function formatActivityValue(type: ActivityType, unit: string, targetValue?: number): (value: number) => string {
  if (type !== 'duration') return (value: number) => `${value} ${unit}`;
  return (targetValue ?? 0) < 60 ? formatMinutes : formatHours;
}
