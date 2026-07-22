import { apiClient } from './ApiClient';
import { DailyScore, LeaderboardEntry } from '../types';

class ScoreService {
  leaderboard(): Promise<LeaderboardEntry[]> {
    return apiClient.get<LeaderboardEntry[]>('/scores/leaderboard');
  }
  myDailyBreakdown(): Promise<DailyScore[]> {
    return apiClient.get<DailyScore[]>('/scores/me');
  }
  userDailyBreakdown(userId: string): Promise<DailyScore[]> {
    return apiClient.get<DailyScore[]>(`/scores/user/${userId}`);
  }
}

export const scoreService = new ScoreService();
