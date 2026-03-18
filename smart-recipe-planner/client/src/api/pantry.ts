import { api } from './axios';
import { PantryItem, IngredientCategory } from '../types';

interface PantryItemInput {
  name: string;
  quantity: number;
  unit: string;
  category?: IngredientCategory;
  expiryDate?: string;
}

export const pantryApi = {
  list: () => api.get<PantryItem[]>('/pantry'),
  add: (data: PantryItemInput) => api.post<PantryItem>('/pantry', data),
  addBulk: (items: PantryItemInput[]) => api.post<PantryItem[]>('/pantry/bulk', { items }),
  update: (id: string, data: Partial<PantryItemInput>) => api.patch<PantryItem>(`/pantry/${id}`, data),
  delete: (id: string) => api.delete(`/pantry/${id}`),
};
