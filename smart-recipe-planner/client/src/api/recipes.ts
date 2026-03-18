import { api } from './axios';
import { Recipe, SavedRecipe } from '../types';

export const recipesApi = {
  list: (params?: { cuisine?: string; tags?: string }) =>
    api.get<Recipe[]>('/recipes', { params }),
  get: (id: string) => api.get<Recipe>(`/recipes/${id}`),
  generate: (data: { cuisinePreference?: string; servings?: number }) =>
    api.post<Recipe>('/recipes/generate', data),
  getSaved: () => api.get<SavedRecipe[]>('/recipes/saved'),
  save: (recipeId: string, rating?: number, notes?: string) =>
    api.post<SavedRecipe>('/recipes/saved', { recipeId, rating, notes }),
  updateSaved: (id: string, data: { rating?: number; notes?: string }) =>
    api.patch<SavedRecipe>(`/recipes/saved/${id}`, data),
  unsave: (id: string) => api.delete(`/recipes/saved/${id}`),
};
