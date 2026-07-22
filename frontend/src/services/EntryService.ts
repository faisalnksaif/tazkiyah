import { apiClient } from './ApiClient';
import { DailyEntry } from '../types';

class EntryService {
  getToday(date?: string): Promise<DailyEntry[]> {
    return apiClient.get<DailyEntry[]>(`/entries/today${date ? `?date=${date}` : ''}`);
  }

  getHistory(params: { userId?: string; activityId?: string; startDate?: string; endDate?: string } = {}): Promise<DailyEntry[]> {
    const query = new URLSearchParams();
    if (params.activityId) query.set('activityId', params.activityId);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    const path = params.userId ? `/entries/history/${params.userId}` : '/entries/history';
    const qs = query.toString();
    return apiClient.get<DailyEntry[]>(`${path}${qs ? `?${qs}` : ''}`);
  }

  addIncrement(activityId: string, value: number, date?: string): Promise<DailyEntry> {
    return apiClient.post<DailyEntry>('/entries/increment', { activityId, value, date });
  }

  setCheckbox(activityId: string, done: boolean, date?: string): Promise<DailyEntry> {
    return apiClient.post<DailyEntry>('/entries/checkbox', { activityId, done, date });
  }

  setChecklistItem(activityId: string, subItemLabel: string, done: boolean, date?: string): Promise<DailyEntry> {
    return apiClient.post<DailyEntry>('/entries/checklist-item', { activityId, subItemLabel, done, date });
  }
}

export const entryService = new EntryService();
