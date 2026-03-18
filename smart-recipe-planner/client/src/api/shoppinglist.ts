import { api } from './axios';
import { ShoppingList, ShoppingListItem } from '../types';

export const shoppingListApi = {
  get: (week?: string) => api.get<ShoppingList>('/shopping-list', { params: week ? { week } : {} }),
  generate: () => api.post<ShoppingList>('/shopping-list/generate'),
  toggleItem: (id: string) => api.patch<ShoppingListItem>(`/shopping-list/items/${id}`),
  deleteItem: (id: string) => api.delete(`/shopping-list/items/${id}`),
};
