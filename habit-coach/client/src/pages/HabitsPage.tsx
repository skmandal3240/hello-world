import React, { useState } from 'react';
import { useHabits } from '../hooks/useHabits';
import { HabitCard } from '../components/habits/HabitCard';
import { HabitForm } from '../components/habits/HabitForm';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { useToast } from '../components/ui/Toast';
import { HabitCategory } from '../types';

const ALL_CATEGORIES: HabitCategory[] = ['HEALTH', 'FITNESS', 'LEARNING', 'PRODUCTIVITY', 'MINDFULNESS', 'NUTRITION', 'SOCIAL', 'CREATIVITY', 'FINANCE', 'OTHER'];

export function HabitsPage() {
  const { habits, loading, createHabit, archiveHabit } = useHabits();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<HabitCategory | 'ALL'>('ALL');

  const filtered = filter === 'ALL' ? habits : habits.filter((h) => h.category === filter);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Habits</h1>
          <p className="text-gray-500">{habits.length} active habits</p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ New Habit</Button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          All
        </button>
        {ALL_CATEGORIES.filter((c) => habits.some((h) => h.category === c)).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-4">🌱</p>
          <p className="font-semibold text-gray-900 mb-2">No habits found</p>
          <p className="text-gray-500 mb-4">Create your first habit to get started</p>
          <Button onClick={() => setShowForm(true)}>Create Habit</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onArchive={() => {
                archiveHabit(habit.id).then(() => showToast('Habit archived')).catch(() => showToast('Failed', 'error'));
              }}
            />
          ))}
        </div>
      )}

      <HabitForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={async (data) => {
          await createHabit(data);
          showToast('Habit created!');
        }}
      />
    </div>
  );
}
