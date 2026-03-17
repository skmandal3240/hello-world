import { api } from './axios';
import { User, ProficiencyLevel } from '../types/auth';

export const usersApi = {
  getMe: () => api.get<User>('/users/me'),
  updateMe: (data: { displayName?: string; avatarUrl?: string }) =>
    api.patch<Partial<User>>('/users/me', data),
  getStats: () => api.get('/users/me/stats'),
  onboarding: (nativeLanguageId: string, learningLanguageId: string, proficiencyLevel: ProficiencyLevel) =>
    api.patch('/users/me/onboarding', { nativeLanguageId, learningLanguageId, proficiencyLevel }),
};
