import AsyncStorage from '@react-native-async-storage/async-storage';
import { appConfig } from '../config/appConfig';

const TOKEN_KEY = 'tazkiyah_token';

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/**
 * Single reusable request wrapper used by every domain service below.
 * Centralizes base URL, auth header injection, JSON handling, and error shaping
 * so no screen or service duplicates fetch/error-parsing logic.
 */
class ApiClient {
  private baseUrl = appConfig.apiBaseUrl;

  async setToken(token: string | null) {
    if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
    else await AsyncStorage.removeItem(TOKEN_KEY);
  }

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${this.baseUrl}${path}`, { ...options, headers });
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const body = isJson ? await response.json() : null;

    if (!response.ok) {
      throw new ApiError(response.status, body?.message || 'Request failed', body?.details);
    }
    return body as T;
  }

  get<T>(path: string) {
    return this.request<T>(path, { method: 'GET' });
  }
  post<T>(path: string, data?: unknown) {
    return this.request<T>(path, { method: 'POST', body: data ? JSON.stringify(data) : undefined });
  }
  put<T>(path: string, data?: unknown) {
    return this.request<T>(path, { method: 'PUT', body: data ? JSON.stringify(data) : undefined });
  }
  delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
