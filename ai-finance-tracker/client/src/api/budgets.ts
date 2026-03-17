import { api } from './axios';
import { Budget } from '../types/budget';

export const budgetsApi = {
  list: (month?: number, year?: number) =>
    api.get<Budget[]>('/budgets', { params: { month, year } }),
  upsert: (data: { categoryId: string; amount: number; month: number; year: number }) =>
    api.post<Budget>('/budgets', data),
  delete: (id: string) => api.delete(`/budgets/${id}`),
};
