import React from 'react';
import { useMealPlan } from '../hooks/useMealPlan';
import { WeekGrid } from '../components/mealplan/WeekGrid';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { useToast } from '../components/ui/Toast';

function getMonday(d: Date = new Date()) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export default function MealPlanPage() {
  const weekStart = getMonday();
  const { plan, loading, generating, removeEntry, generatePlan } = useMealPlan();
  const { showToast } = useToast();

  const handleGenerate = async () => {
    try {
      await generatePlan();
      showToast('Weekly meal plan generated!');
    } catch {
      showToast('Failed to generate meal plan', 'error');
    }
  };

  const handleClearEntry = async (entryId: string) => {
    try {
      await removeEntry(entryId);
    } catch {
      showToast('Failed to remove entry', 'error');
    }
  };

  const weekLabel = weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const weekEndDate = new Date(weekStart);
  weekEndDate.setDate(weekStart.getDate() + 6);
  const weekEndLabel = weekEndDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meal Plan</h2>
          <p className="text-gray-500 text-sm mt-1">{weekLabel} – {weekEndLabel}</p>
        </div>
        <Button onClick={handleGenerate} loading={generating}>
          ✨ Generate with AI
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <WeekGrid
            mealPlan={plan ?? undefined}
            weekStart={weekStart}
            onClearEntry={handleClearEntry}
          />
        </div>
      )}

      {!loading && !plan?.entries.length && (
        <div className="text-center py-8 text-gray-400">
          <p className="mb-4">No meals planned yet. Generate an AI meal plan or add entries manually.</p>
        </div>
      )}
    </div>
  );
}
