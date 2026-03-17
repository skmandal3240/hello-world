import { api } from './axios';
import { CheckIn, TodayStatus } from '../types';

export const checkinsApi = {
  today: () => api.get<TodayStatus[]>('/check-ins/today'),
  history: (days?: number) => api.get<CheckIn[]>(`/check-ins/history${days ? `?days=${days}` : ''}`),
  log: (habitId: string, completed: boolean, note?: string, date?: string) =>
    api.post<{ checkIn: CheckIn; habit: unknown }>('/check-ins', { habitId, completed, note, date }),
  update: (id: string, data: { completed?: boolean; note?: string }) =>
    api.patch<CheckIn>(`/check-ins/${id}`, data),
};
