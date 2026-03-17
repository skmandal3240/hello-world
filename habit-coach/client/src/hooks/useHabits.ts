import { useState, useEffect, useCallback } from 'react';
import { habitsApi, CreateHabitData } from '../api/habits';
import { Habit } from '../types';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await habitsApi.list();
      setHabits(data);
      setError(null);
    } catch {
      setError('Failed to load habits');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createHabit = async (data: CreateHabitData) => {
    const { data: habit } = await habitsApi.create(data);
    setHabits((prev) => [...prev, habit]);
    return habit;
  };

  const updateHabit = async (id: string, data: Partial<CreateHabitData>) => {
    const { data: updated } = await habitsApi.update(id, data);
    setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
    return updated;
  };

  const archiveHabit = async (id: string) => {
    await habitsApi.archive(id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const deleteHabit = async (id: string) => {
    await habitsApi.delete(id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  return { habits, loading, error, reload: load, createHabit, updateHabit, archiveHabit, deleteHabit };
}
