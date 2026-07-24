export type Role = 'user' | 'admin';
export type ActivityType = 'counter' | 'duration' | 'checkbox' | 'checklist';
export type ScoringModel = 'proportional' | 'fixed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface SubItem {
  label: string;
}

export interface Activity {
  _id: string;
  name: string;
  description: string;
  type: ActivityType;
  targetValue: number;
  unit: string;
  pointsWeight: number;
  scoringModel: ScoringModel;
  subItems?: SubItem[];
  isActive: boolean;
  order: number;
}

export interface Increment {
  value: number;
  addedAt: string;
}

export interface SubItemStatus {
  label: string;
  done: boolean;
  jamaath: boolean;
}

export interface DailyEntry {
  _id: string;
  userId: string;
  activityId: string;
  date: string;
  increments: Increment[];
  done: boolean;
  subItemStatuses: SubItemStatus[];
}

export interface ChallengeStatus {
  started: boolean;
  dayNumber: number;
  totalDays: number;
  isOver: boolean;
  startDate?: string;
  endDate?: string;
  days: string[];
}

export interface ChallengeConfig {
  _id: string;
  startDate: string;
  durationDays: number;
  isActive: boolean;
}

export interface ScoreBreakdownItem {
  activityId: string | { _id: string; name: string; unit: string; type: ActivityType };
  pointsEarned: number;
  completionRatio: number;
}

export interface DailyScore {
  _id: string;
  userId: string;
  date: string;
  totalScore: number;
  breakdown: ScoreBreakdownItem[];
}

export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerTimes {
  date: string;
  prayers: Partial<Record<PrayerName, string>>;
  tomorrowFajr?: string;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  email: string;
  totalScore: number;
}
