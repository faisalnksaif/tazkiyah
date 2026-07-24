import { Feather } from '@expo/vector-icons';

// Hardcoded by activity name — mirrors how the jama'ath bonus is scoped
// (see ScoreService/ActivityItem). A renamed or new activity just falls
// back to a generic icon until this map is updated.
const ACTIVITY_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  Dhikr: 'aperture',
  Thawheed: 'book',
  Tahajjud: 'moon',
  '5 Daily Prayers': 'compass',
  Exercise: 'activity',
  Reading: 'book-open',
  'Woke Before Fajr': 'sunrise',
};

const DEFAULT_ICON: keyof typeof Feather.glyphMap = 'star';

export function getActivityIcon(name: string): keyof typeof Feather.glyphMap {
  return ACTIVITY_ICONS[name] || DEFAULT_ICON;
}
