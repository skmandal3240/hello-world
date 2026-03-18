import { useState, useEffect, useCallback } from 'react';
import { pantryApi } from '../api/pantry';
import { PantryItem, IngredientCategory } from '../types';

interface PantryItemInput { name: string; quantity: number; unit: string; category?: IngredientCategory; expiryDate?: string; }

export function usePantry() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await pantryApi.list();
      setItems(data);
      setError(null);
    } catch { setError('Failed to load pantry'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addItem = async (data: PantryItemInput) => {
    const { data: item } = await pantryApi.add(data);
    setItems((prev) => [...prev, item]);
    return item;
  };

  const updateItem = async (id: string, data: Partial<PantryItemInput>) => {
    const { data: updated } = await pantryApi.update(id, data);
    setItems((prev) => prev.map((i) => i.id === id ? updated : i));
    return updated;
  };

  const deleteItem = async (id: string) => {
    await pantryApi.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return { items, loading, error, reload: load, addItem, updateItem, deleteItem };
}
