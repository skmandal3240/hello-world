interface Props {
  streak: number;
  label?: string;
}

export default function StreakBadge({ streak, label = 'day streak' }: Props) {
  if (streak === 0) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <span className="text-2xl">🌱</span>
        <span className="text-sm">Start your streak today!</span>
      </div>
    );
  }

  const flames = streak >= 30 ? '🔥🔥🔥' : streak >= 14 ? '🔥🔥' : '🔥';
  return (
    <div className="flex items-center gap-2">
      <span className="text-3xl">{flames}</span>
      <div>
        <span className="text-2xl font-bold text-rose-600">{streak}</span>
        <span className="text-gray-500 text-sm ml-1">{label}</span>
      </div>
    </div>
  );
}
