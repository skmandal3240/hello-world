import React, { useState } from 'react';
import { useTodayStatus } from '../hooks/useCheckIns';
import { CheckInCard } from '../components/checkin/CheckInCard';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

export function CheckInPage() {
  const { status, loading, logCheckIn } = useTodayStatus();
  const [done, setDone] = useState(false);

  const pending = status.filter((s) => !s.checkIn?.completed);
  const completed = status.filter((s) => s.checkIn?.completed);

  if (loading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;

  if (done || (status.length > 0 && pending.length === 0)) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">All done for today!</h1>
        <p className="text-gray-500 mb-2">
          You completed {completed.length} of {status.length} habits today.
        </p>
        <p className="text-gray-500 mb-6">Keep it up — consistency is the key to lasting habits.</p>
        <Link to="/dashboard"><Button>Back to Dashboard</Button></Link>
      </div>
    );
  }

  if (status.length === 0) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center">
        <div className="text-6xl mb-4">🌱</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">No habits to check in</h1>
        <p className="text-gray-500 mb-6">Create some habits first to track your progress.</p>
        <Link to="/habits"><Button>Create Habits</Button></Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Today's Check-In</h1>
        <p className="text-gray-500">
          {completed.length} of {status.length} habits completed
        </p>
        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${status.length > 0 ? (completed.length / status.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {pending.map(({ habit, checkIn }) => (
          <CheckInCard
            key={habit.id}
            habit={habit}
            checkIn={checkIn}
            onCheckIn={(completed, note) => logCheckIn(habit.id, completed, note)}
          />
        ))}
      </div>

      {completed.length > 0 && pending.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-gray-500 mb-3">Completed</h2>
          <div className="space-y-2 opacity-60">
            {completed.map(({ habit }) => (
              <div key={habit.id} className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-gray-700">{habit.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
