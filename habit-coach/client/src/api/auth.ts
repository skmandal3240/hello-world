import { api } from './axios';
import { User } from '../types';

export const authApi = {
  signup: (email: string, password: string, displayName: string) =>
    api.post<{ user: User; tokens: { accessToken: string; refreshToken: string } }>('/auth/signup', { email, password, displayName }),
  login: (email: string, password: string) =>
    api.post<{ user: User; tokens: { accessToken: string; refreshToken: string } }>('/auth/login', { email, password }),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
  getMe: () => api.get<User>('/auth/me'),
  updateMe: (data: Partial<User>) => api.patch<User>('/auth/me', data),
};
