import { api } from './axios';
import { Habit, HabitWithHistory, HabitCategory, HabitFrequency } from '../types';

export interface CreateHabitData {
  name: string;
  description?: string;
  frequency?: HabitFrequency;
  category?: HabitCategory;
  targetDays?: number;
}

export const habitsApi = {
  list: () => api.get<Habit[]>('/habits'),
  get: (id: string) => api.get<HabitWithHistory>(`/habits/${id}`),
  create: (data: CreateHabitData) => api.post<Habit>('/habits', data),
  update: (id: string, data: Partial<CreateHabitData>) => api.patch<Habit>(`/habits/${id}`, data),
  archive: (id: string) => api.post<Habit>(`/habits/${id}/archive`),
  delete: (id: string) => api.delete(`/habits/${id}`),
};
