import { useState, useEffect, useCallback } from 'react';
import { mealPlanApi } from '../api/mealplan';
import { MealPlan, MealType } from '../types';

export function useMealPlan(week?: string) {
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await mealPlanApi.get(week);
      setPlan(data);
    } finally { setLoading(false); }
  }, [week]);

  useEffect(() => { load(); }, [load]);

  const setEntry = async (dayOfWeek: number, mealType: MealType, recipeId?: string, customName?: string) => {
    const { data: entry } = await mealPlanApi.setEntry({ dayOfWeek, mealType, recipeId, customName });
    setPlan((prev) => {
      if (!prev) return prev;
      const filtered = prev.entries.filter((e) => !(e.dayOfWeek === dayOfWeek && e.mealType === mealType));
      return { ...prev, entries: [...filtered, entry] };
    });
    return entry;
  };

  const removeEntry = async (entryId: string) => {
    await mealPlanApi.removeEntry(entryId);
    setPlan((prev) => prev ? { ...prev, entries: prev.entries.filter((e) => e.id !== entryId) } : prev);
  };

  const generatePlan = async () => {
    setGenerating(true);
    try {
      await mealPlanApi.generate();
      await load();
    } finally { setGenerating(false); }
  };

  return { plan, loading, generating, reload: load, setEntry, removeEntry, generatePlan };
}
