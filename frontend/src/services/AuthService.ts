import { apiClient } from './ApiClient';
import { User } from '../types';

interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    const result = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    await apiClient.setToken(result.token);
    return result;
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const result = await apiClient.post<AuthResponse>('/auth/register', { name, email, password });
    await apiClient.setToken(result.token);
    return result;
  }

  async me(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  }

  async logout() {
    await apiClient.setToken(null);
  }
}

export const authService = new AuthService();
