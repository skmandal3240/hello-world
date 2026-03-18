import { api } from './axios';
import { MealPlan, MealPlanEntry, MealType } from '../types';

export const mealPlanApi = {
  get: (week?: string) => api.get<MealPlan>('/meal-plan', { params: week ? { week } : {} }),
  setEntry: (data: { dayOfWeek: number; mealType: MealType; recipeId?: string; customName?: string }) =>
    api.post<MealPlanEntry>('/meal-plan/entries', data),
  removeEntry: (entryId: string) => api.delete(`/meal-plan/entries/${entryId}`),
  generate: () => api.post<{ weekStart: string; entries: MealPlanEntry[] }>('/meal-plan/generate'),
};
