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

/** Value formatter for a counter/duration activity — hours for duration, raw unit otherwise. */
export function formatActivityValue(type: ActivityType, unit: string): (value: number) => string {
  return type === 'duration' ? formatHours : (value: number) => `${value} ${unit}`;
}
