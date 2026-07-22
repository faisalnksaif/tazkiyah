import { apiClient } from './ApiClient';
import { Activity } from '../types';

class ActivityService {
  list(includeInactive = false): Promise<Activity[]> {
    return apiClient.get<Activity[]>(`/activities${includeInactive ? '?includeInactive=true' : ''}`);
  }
  getById(id: string): Promise<Activity> {
    return apiClient.get<Activity>(`/activities/${id}`);
  }
  create(data: Partial<Activity>): Promise<Activity> {
    return apiClient.post<Activity>('/activities', data);
  }
  update(id: string, data: Partial<Activity>): Promise<Activity> {
    return apiClient.put<Activity>(`/activities/${id}`, data);
  }
  remove(id: string): Promise<Activity> {
    return apiClient.delete<Activity>(`/activities/${id}`);
  }
}

export const activityService = new ActivityService();
