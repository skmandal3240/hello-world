import { Link } from 'react-router-dom';
import { CbtExercise } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  THOUGHT_RECORD: 'bg-purple-100 text-purple-700',
  GRATITUDE: 'bg-yellow-100 text-yellow-700',
  BREATHING: 'bg-blue-100 text-blue-700',
  GROUNDING: 'bg-green-100 text-green-700',
  COGNITIVE_RESTRUCTURING: 'bg-orange-100 text-orange-700',
  BEHAVIORAL_ACTIVATION: 'bg-rose-100 text-rose-700',
};

const CATEGORY_ICONS: Record<string, string> = {
  THOUGHT_RECORD: '📝',
  GRATITUDE: '🙏',
  BREATHING: '💨',
  GROUNDING: '🌿',
  COGNITIVE_RESTRUCTURING: '🧠',
  BEHAVIORAL_ACTIVATION: '⚡',
};

interface Props {
  exercise: CbtExercise;
  completedToday?: boolean;
}

export default function ExerciseCard({ exercise, completedToday }: Props) {
  const colorClass = CATEGORY_COLORS[exercise.category] || 'bg-gray-100 text-gray-700';
  const icon = CATEGORY_ICONS[exercise.category] || '✨';
  const categoryLabel = exercise.category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

  return (
    <Link to={`/exercises/${exercise.id}`} className="block bg-white rounded-xl shadow-sm border border-rose-50 p-5 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between">
        <div className="text-3xl mb-2">{icon}</div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
            {categoryLabel}
          </span>
          <span className="text-xs text-gray-400">⏱ {exercise.durationMinutes} min</span>
        </div>
      </div>
      <h3 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors">
        {exercise.title}
      </h3>
      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{exercise.description}</p>
      {completedToday && (
        <div className="mt-2 text-xs text-green-600 font-medium">✓ Completed recently</div>
      )}
    </Link>
  );
}
