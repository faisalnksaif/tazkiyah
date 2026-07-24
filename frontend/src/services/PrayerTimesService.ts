import { apiClient } from './ApiClient';
import { PrayerTimes } from '../types';

class PrayerTimesService {
  getToday(): Promise<PrayerTimes> {
    return apiClient.get<PrayerTimes>('/prayer-times/today');
  }
}

export const prayerTimesService = new PrayerTimesService();
