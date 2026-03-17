import React from 'react';
import { Link } from 'react-router-dom';
import { Habit } from '../../types';
import { StreakBadge } from './StreakBadge';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

const categoryColors: Record<string, 'indigo' | 'green' | 'blue' | 'purple' | 'yellow' | 'pink' | 'red' | 'gray'> = {
  HEALTH: 'green', FITNESS: 'blue', LEARNING: 'indigo', PRODUCTIVITY: 'purple',
  MINDFULNESS: 'pink', NUTRITION: 'yellow', SOCIAL: 'red', CREATIVITY: 'pink',
  FINANCE: 'green', OTHER: 'gray',
};

interface HabitCardProps {
  habit: Habit;
  isCheckedIn?: boolean;
  onCheckIn?: () => void;
  onArchive?: () => void;
}

export function HabitCard({ habit, isCheckedIn, onCheckIn, onArchive }: HabitCardProps) {
  const progress = Math.min(100, Math.round((habit.currentStreak / habit.targetDays) * 100));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <Link to={`/habits/${habit.id}`} className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
            {habit.name}
          </Link>
          {habit.description && <p className="text-sm text-gray-500 mt-0.5">{habit.description}</p>}
        </div>
        <Badge color={categoryColors[habit.category] ?? 'gray'}>{habit.category}</Badge>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <StreakBadge streak={habit.currentStreak} />
        <span className="text-sm text-gray-500">Best: {habit.longestStreak} days</span>
        <span className="text-sm text-gray-500">{habit.frequency}</span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress to {habit.targetDays}-day goal</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex gap-2">
        {onCheckIn && (
          <Button
            size="sm"
            variant={isCheckedIn ? 'secondary' : 'primary'}
            onClick={onCheckIn}
            className="flex-1"
          >
            {isCheckedIn ? '✓ Done' : 'Check In'}
          </Button>
        )}
        {onArchive && (
          <Button size="sm" variant="ghost" onClick={onArchive}>Archive</Button>
        )}
      </div>
    </div>
  );
}
