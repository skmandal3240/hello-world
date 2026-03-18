import { api } from './axios';
import { User, DietaryPreference } from '../types';

interface AuthTokens { accessToken: string; refreshToken: string; }

export const authApi = {
  signup: (email: string, password: string, displayName: string) =>
    api.post<{ user: User; tokens: AuthTokens }>('/auth/signup', { email, password, displayName }),
  login: (email: string, password: string) =>
    api.post<{ user: User; tokens: AuthTokens }>('/auth/login', { email, password }),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  getMe: () => api.get<User>('/auth/me'),
  updateMe: (data: { displayName?: string; dietaryPreferences?: DietaryPreference[]; servings?: number; weeklyBudget?: number }) =>
    api.patch<User>('/auth/me', data),
};
