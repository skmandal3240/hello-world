import { useState, useEffect, useCallback } from 'react';
import { recipesApi } from '../api/recipes';
import { Recipe, SavedRecipe } from '../types';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await recipesApi.list();
      setRecipes(data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const generate = async (cuisinePreference?: string, servings?: number) => {
    const { data } = await recipesApi.generate({ cuisinePreference, servings });
    setRecipes((prev) => [data, ...prev]);
    return data;
  };

  return { recipes, loading, reload: load, generate };
}

export function useSavedRecipes() {
  const [saved, setSaved] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await recipesApi.getSaved();
      setSaved(data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (recipeId: string, rating?: number, notes?: string) => {
    const { data } = await recipesApi.save(recipeId, rating, notes);
    setSaved((prev) => [data, ...prev.filter((s) => s.recipeId !== recipeId)]);
    return data;
  };

  const unsave = async (savedId: string) => {
    await recipesApi.unsave(savedId);
    setSaved((prev) => prev.filter((s) => s.id !== savedId));
  };

  return { saved, loading, reload: load, save, unsave };
}
