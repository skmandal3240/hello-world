import { useState, useEffect, useCallback } from 'react';
import { shoppingListApi } from '../api/shoppinglist';
import { ShoppingList } from '../types';

export function useShoppingList() {
  const [list, setList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await shoppingListApi.get();
      setList(data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const generate = async () => {
    setGenerating(true);
    try {
      const { data } = await shoppingListApi.generate();
      setList(data);
      return data;
    } finally { setGenerating(false); }
  };

  const toggleItem = async (id: string) => {
    const { data: item } = await shoppingListApi.toggleItem(id);
    setList((prev) => prev ? { ...prev, items: prev.items.map((i) => i.id === id ? item : i) } : prev);
  };

  const deleteItem = async (id: string) => {
    await shoppingListApi.deleteItem(id);
    setList((prev) => prev ? { ...prev, items: prev.items.filter((i) => i.id !== id) } : prev);
  };

  return { list, loading, generating, reload: load, generate, toggleItem, deleteItem };
}
