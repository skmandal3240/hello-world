import React, { useState } from 'react';
import { Habit, CheckIn } from '../../types';
import { Button } from '../ui/Button';
import { StreakBadge } from '../habits/StreakBadge';

interface CheckInCardProps {
  habit: Habit;
  checkIn: CheckIn | null;
  onCheckIn: (completed: boolean, note?: string) => Promise<void>;
}

export function CheckInCard({ habit, checkIn, onCheckIn }: CheckInCardProps) {
  const [note, setNote] = useState(checkIn?.note ?? '');
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async (completed: boolean) => {
    setLoading(true);
    try { await onCheckIn(completed, note || undefined); }
    finally { setLoading(false); }
  };

  return (
    <div className={`bg-white rounded-xl border-2 p-5 transition-colors ${checkIn?.completed ? 'border-green-400' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{habit.name}</h3>
          <p className="text-sm text-gray-500">{habit.category}</p>
        </div>
        <StreakBadge streak={habit.currentStreak} />
      </div>

      <input
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        placeholder="Add a note... (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <div className="flex gap-2">
        <Button
          size="sm"
          variant={checkIn?.completed ? 'primary' : 'secondary'}
          onClick={() => handleCheckIn(true)}
          loading={loading}
          className="flex-1"
        >
          {checkIn?.completed ? '✓ Done' : 'Mark Done'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleCheckIn(false)}
          loading={loading}
        >
          Skip
        </Button>
      </div>
    </div>
  );
}
