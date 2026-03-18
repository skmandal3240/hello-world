import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../lib/api';
import { CbtExercise } from '../types';

const CATEGORY_ICONS: Record<string, string> = {
  THOUGHT_RECORD: '📝',
  GRATITUDE: '🙏',
  BREATHING: '💨',
  GROUNDING: '🌿',
  COGNITIVE_RESTRUCTURING: '🧠',
  BEHAVIORAL_ACTIVATION: '⚡',
};

export default function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<CbtExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    api.get<CbtExercise>(`/exercises/${id}`)
      .then((res) => setExercise(res.data))
      .catch(() => navigate('/exercises'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleComplete = async (e: FormEvent) => {
    e.preventDefault();
    setCompleting(true);
    try {
      await api.post(`/exercises/${id}/complete`, { notes: notes.trim() || undefined });
      setCompleted(true);
    } catch {
      // ignore
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <><Navbar /><div className="flex h-64 items-center justify-center text-gray-400">Loading...</div></>;
  if (!exercise) return null;

  const icon = CATEGORY_ICONS[exercise.category] || '✨';
  const categoryLabel = exercise.category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Link to="/exercises" className="hover:text-rose-600">Exercises</Link>
          <span>/</span>
          <span>{exercise.title}</span>
        </div>

        <div className="text-4xl mb-4">{icon}</div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">{exercise.title}</h1>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
          <span className="bg-gray-100 px-3 py-1 rounded-full">{categoryLabel}</span>
          <span>⏱ {exercise.durationMinutes} minutes</span>
        </div>

        <p className="text-gray-600 mb-8 leading-relaxed">{exercise.description}</p>

        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 mb-8">
          <h2 className="font-semibold text-gray-800 mb-4">Instructions</h2>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{exercise.instructions}</div>
        </div>

        {completed ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
            <p className="text-2xl mb-2">🎉</p>
            <p className="font-semibold text-emerald-800 mb-1">Exercise completed!</p>
            <p className="text-sm text-emerald-600 mb-4">Great work taking care of your mental wellness.</p>
            <Link to="/exercises" className="text-sm text-emerald-700 hover:underline">← Back to exercises</Link>
          </div>
        ) : (
          <form onSubmit={handleComplete} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
                placeholder="Any reflections or thoughts from doing this exercise..."
              />
            </div>
            <button
              type="submit"
              disabled={completing}
              className="w-full bg-rose-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-rose-700 disabled:opacity-50 transition-colors"
            >
              {completing ? 'Saving...' : '✓ Mark as completed'}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
