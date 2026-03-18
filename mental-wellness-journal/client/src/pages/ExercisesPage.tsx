import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ExerciseCard from '../components/ExerciseCard';
import api from '../lib/api';
import { CbtExercise, ExerciseCompletion } from '../types';

const CATEGORIES = ['ALL', 'THOUGHT_RECORD', 'GRATITUDE', 'BREATHING', 'GROUNDING', 'COGNITIVE_RESTRUCTURING', 'BEHAVIORAL_ACTIVATION'];
const CATEGORY_LABEL: Record<string, string> = {
  ALL: 'All',
  THOUGHT_RECORD: 'Thought Record',
  GRATITUDE: 'Gratitude',
  BREATHING: 'Breathing',
  GROUNDING: 'Grounding',
  COGNITIVE_RESTRUCTURING: 'Cognitive',
  BEHAVIORAL_ACTIVATION: 'Behavioral',
};

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<CbtExercise[]>([]);
  const [recentCompletions, setRecentCompletions] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<CbtExercise[]>('/exercises'),
      api.get<ExerciseCompletion[]>('/exercises/history?limit=5'),
    ]).then(([exRes, histRes]) => {
      setExercises(exRes.data);
      setRecentCompletions(new Set(histRes.data.map((c) => c.exerciseId)));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = category === 'ALL' ? exercises : exercises.filter((e) => e.category === category);

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CBT Exercises</h1>
            <p className="text-gray-500 text-sm mt-1">Evidence-based techniques for mental wellness</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`text-sm px-4 py-1.5 rounded-full transition-colors ${category === cat ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-rose-50'}`}
            >
              {CATEGORY_LABEL[cat]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading exercises...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No exercises in this category.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                completedToday={recentCompletions.has(exercise.id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
