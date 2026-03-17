import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { habitsApi } from '../api/habits';
import { HabitWithHistory } from '../types';
import { StreakBadge } from '../components/habits/StreakBadge';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';

export function HabitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [habit, setHabit] = useState<HabitWithHistory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    habitsApi.get(id).then(({ data }) => setHabit(data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  if (!habit) return <div className="p-8 text-gray-500">Habit not found</div>;

  // Build 12-week calendar grid
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const checkInMap = new Map(habit.checkIns.map((c) => [c.date.slice(0, 10), c.completed]));
  const days: { date: string; completed: boolean | null }[] = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, completed: checkInMap.has(key) ? checkInMap.get(key)! : null });
  }

  const progress = Math.min(100, Math.round((habit.currentStreak / habit.targetDays) * 100));

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link to="/habits" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">← Back to Habits</Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{habit.name}</h1>
          {habit.description && <p className="text-gray-500">{habit.description}</p>}
        </div>
        <Badge color="indigo">{habit.category}</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Current Streak', value: <StreakBadge streak={habit.currentStreak} /> },
          { label: 'Longest Streak', value: `${habit.longestStreak} days` },
          { label: 'Completion Rate', value: `${habit.completionRate}%` },
          { label: 'Total Completions', value: habit.totalCompletions },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-xl font-bold text-gray-900 mb-1">{value}</div>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Progress to {habit.targetDays}-day goal</span>
          <span className="text-gray-500">{progress}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Calendar heatmap */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Last 12 Weeks</h2>
        <div className="grid grid-cols-12 gap-1">
          {Array.from({ length: 12 }, (_, week) => (
            <div key={week} className="flex flex-col gap-1">
              {Array.from({ length: 7 }, (_, day) => {
                const d = days[week * 7 + day];
                return (
                  <div
                    key={day}
                    title={d?.date}
                    className={`h-4 w-4 rounded-sm ${
                      !d || d.completed === null ? 'bg-gray-100' :
                      d.completed ? 'bg-green-500' : 'bg-red-200'
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="h-3 w-3 bg-green-500 rounded-sm inline-block" /> Completed</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 bg-red-200 rounded-sm inline-block" /> Skipped</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 bg-gray-100 rounded-sm inline-block" /> No data</span>
        </div>
      </div>
    </div>
  );
}
