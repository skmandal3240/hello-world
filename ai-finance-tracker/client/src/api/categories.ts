import { api } from './axios';
import { Category } from '../types/transaction';

export const categoriesApi = {
  list: () => api.get<Category[]>('/categories'),
  create: (data: { name: string; icon: string; color: string }) => api.post<Category>('/categories', data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};
