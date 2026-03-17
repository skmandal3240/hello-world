import { useState, useEffect, useCallback } from 'react';
import { checkinsApi } from '../api/checkins';
import { TodayStatus } from '../types';

export function useTodayStatus() {
  const [status, setStatus] = useState<TodayStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await checkinsApi.today();
      setStatus(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const logCheckIn = async (habitId: string, completed: boolean, note?: string) => {
    const { data } = await checkinsApi.log(habitId, completed, note);
    setStatus((prev) =>
      prev.map((s) =>
        s.habit.id === habitId
          ? { ...s, checkIn: data.checkIn, habit: { ...s.habit, ...(data.habit as object) } }
          : s
      )
    );
    return data;
  };

  return { status, loading, reload: load, logCheckIn };
}
