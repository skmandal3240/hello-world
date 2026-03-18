import React from 'react';
import { MealPlanEntry, MealType } from '../../types';

interface Props {
  entry?: MealPlanEntry;
  dayOfWeek: number;
  mealType: MealType;
  onClear?: (entryId: string) => void;
}

const mealIcons: Record<MealType, string> = {
  BREAKFAST: '🌅',
  LUNCH: '☀️',
  DINNER: '🌙',
  SNACK: '🍎',
};

export function MealSlot({ entry, dayOfWeek, mealType, onClear }: Props) {
  const label = entry?.recipe?.name ?? entry?.customName;

  return (
    <div className={`min-h-[60px] rounded-lg border p-2 text-xs transition-colors ${
      label ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200 border-dashed'
    }`}>
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          {label ? (
            <p className="font-medium text-emerald-800 line-clamp-2">{label}</p>
          ) : (
            <p className="text-gray-400 italic">Empty</p>
          )}
        </div>
        {entry && onClear && (
          <button
            onClick={() => onClear(entry.id)}
            className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
            title="Clear slot"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
