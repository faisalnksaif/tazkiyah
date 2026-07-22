import { apiClient } from './ApiClient';
import { ChallengeConfig, ChallengeStatus } from '../types';

class ChallengeService {
  getStatus(): Promise<ChallengeStatus> {
    return apiClient.get<ChallengeStatus>('/challenge/status');
  }
  configure(startDate: string, durationDays: number): Promise<ChallengeConfig> {
    return apiClient.post<ChallengeConfig>('/challenge/configure', { startDate, durationDays });
  }
}

export const challengeService = new ChallengeService();
