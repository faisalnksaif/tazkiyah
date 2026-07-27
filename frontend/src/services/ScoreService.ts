import { apiClient } from './ApiClient';
import { DailyLeaderboard, DailyScore, LeaderboardEntry, LeaderboardTrend } from '../types';

class ScoreService {
  leaderboard(): Promise<LeaderboardEntry[]> {
    return apiClient.get<LeaderboardEntry[]>('/scores/leaderboard');
  }
  dailyLeaderboard(date: string): Promise<DailyLeaderboard> {
    return apiClient.get<DailyLeaderboard>(`/scores/leaderboard/${date}`);
  }
  trend(): Promise<LeaderboardTrend> {
    return apiClient.get<LeaderboardTrend>('/scores/trend');
  }
  myDailyBreakdown(): Promise<DailyScore[]> {
    return apiClient.get<DailyScore[]>('/scores/me');
  }
  userDailyBreakdown(userId: string): Promise<DailyScore[]> {
    return apiClient.get<DailyScore[]>(`/scores/user/${userId}`);
  }
}

export const scoreService = new ScoreService();
