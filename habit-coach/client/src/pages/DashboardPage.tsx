import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHabits } from '../hooks/useHabits';
import { NudgeCard } from '../components/ai/NudgeCard';
import { HabitCard } from '../components/habits/HabitCard';
import { PartnerWidget } from '../components/partner/PartnerWidget';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';

export function DashboardPage() {
  const { user } = useAuth();
  const { habits, loading } = useHabits();

  const totalStreak = habits.reduce((sum, h) => sum + h.currentStreak, 0);
  const completionRate = habits.length > 0
    ? Math.round(habits.reduce((sum, h) => sum + h.totalCompletions, 0) / (habits.length * 30) * 100)
    : 0;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          {user?.displayName} 👋
        </h1>
        <p className="text-gray-500">Here's your habit progress today</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Active Habits', value: habits.length, icon: '✅' },
          { label: 'Total Streak Days', value: totalStreak, icon: '🔥' },
          { label: 'Overall Completion', value: `${Math.min(completionRate, 100)}%`, icon: '📊' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Nudge */}
      <div className="mb-6">
        <NudgeCard />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Habits</h2>
            <div className="flex gap-2">
              <Link to="/check-in">
                <Button size="sm" variant="secondary">Check In Today</Button>
              </Link>
              <Link to="/habits">
                <Button size="sm" variant="ghost">Manage</Button>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : habits.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-4xl mb-4">🌱</p>
              <p className="font-semibold text-gray-900 mb-2">No habits yet</p>
              <p className="text-gray-500 mb-4">Create your first habit to get started</p>
              <Link to="/habits"><Button>Create Habit</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {habits.slice(0, 4).map((habit) => (
                <HabitCard key={habit.id} habit={habit} />
              ))}
              {habits.length > 4 && (
                <Link to="/habits" className="text-sm text-indigo-600 hover:underline text-center py-2">
                  +{habits.length - 4} more habits
                </Link>
              )}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Partner</h2>
          <PartnerWidget />
        </div>
      </div>
    </div>
  );
}
