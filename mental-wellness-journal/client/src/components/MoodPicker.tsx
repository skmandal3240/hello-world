const MOOD_CONFIG = [
  { score: 1, emoji: '😞', label: 'Very Low', color: 'bg-red-500' },
  { score: 2, emoji: '😢', label: 'Low', color: 'bg-red-400' },
  { score: 3, emoji: '😟', label: 'Struggling', color: 'bg-orange-500' },
  { score: 4, emoji: '😕', label: 'Off', color: 'bg-orange-400' },
  { score: 5, emoji: '😐', label: 'Neutral', color: 'bg-yellow-400' },
  { score: 6, emoji: '🙂', label: 'Okay', color: 'bg-yellow-500' },
  { score: 7, emoji: '😊', label: 'Good', color: 'bg-green-400' },
  { score: 8, emoji: '😄', label: 'Great', color: 'bg-green-500' },
  { score: 9, emoji: '😁', label: 'Excellent', color: 'bg-emerald-500' },
  { score: 10, emoji: '🤩', label: 'Amazing', color: 'bg-emerald-600' },
];

export function getMoodConfig(score: number) {
  return MOOD_CONFIG.find(m => m.score === score) || MOOD_CONFIG[4];
}

interface Props {
  value: number;
  onChange: (score: number) => void;
}

export default function MoodPicker({ value, onChange }: Props) {
  return (
    <div>
      <div className="flex gap-1 flex-wrap">
        {MOOD_CONFIG.map(m => (
          <button
            key={m.score}
            type="button"
            onClick={() => onChange(m.score)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all ${
              value === m.score
                ? `${m.color} text-white scale-110 shadow-lg`
                : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
            }`}
            title={m.label}
          >
            <span className="text-2xl">{m.emoji}</span>
            <span className="text-xs mt-0.5">{m.score}</span>
          </button>
        ))}
      </div>
      {value > 0 && (
        <p className="text-sm text-gray-500 mt-2">
          {getMoodConfig(value).emoji} {getMoodConfig(value).label} ({value}/10)
        </p>
      )}
    </div>
  );
}
