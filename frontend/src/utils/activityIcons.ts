import { Feather } from '@expo/vector-icons';

export type ActivityIconName = keyof typeof Feather.glyphMap | 'tasbeeh';

// Hardcoded by activity name — mirrors how the jama'ath bonus is scoped
// (see ScoreService/ActivityItem). A renamed or new activity just falls
// back to a generic icon until this map is updated.
const ACTIVITY_ICONS: Record<string, ActivityIconName> = {
  Dhikr: 'tasbeeh',
  Thawheed: 'heart',
  Tahajjud: 'moon',
  '5 Daily Prayers': 'compass',
  Exercise: 'activity',
  Reading: 'book-open',
  'Woke Before Fajr': 'sunrise',
};

const DEFAULT_ICON: ActivityIconName = 'star';

export function getActivityIcon(name: string): ActivityIconName {
  return ACTIVITY_ICONS[name] || DEFAULT_ICON;
}
