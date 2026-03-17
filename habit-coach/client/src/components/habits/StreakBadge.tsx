import React from 'react';

export function StreakBadge({ streak }: { streak: number }) {
  const color = streak >= 30 ? 'text-yellow-500' : streak >= 7 ? 'text-orange-500' : 'text-red-400';
  return (
    <span className={`inline-flex items-center gap-1 font-bold ${color}`}>
      🔥 {streak}
    </span>
  );
}
