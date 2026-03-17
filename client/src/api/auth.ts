import { api } from './axios';
import { AuthResponse, AuthTokens } from '../types/auth';

export const authApi = {
  signup: (email: string, password: string, displayName: string) =>
    api.post<AuthResponse>('/auth/signup', { email, password, displayName }),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
};
