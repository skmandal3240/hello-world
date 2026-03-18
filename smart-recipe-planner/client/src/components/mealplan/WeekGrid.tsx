import React from 'react';
import { MealPlan, MealType } from '../../types';
import { MealSlot } from './MealSlot';

interface Props {
  mealPlan?: MealPlan;
  weekStart: Date;
  onClearEntry: (entryId: string) => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEAL_TYPES: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

export function WeekGrid({ mealPlan, weekStart, onClearEntry }: Props) {
  const getEntry = (dayOfWeek: number, mealType: MealType) =>
    mealPlan?.entries.find((e) => e.dayOfWeek === dayOfWeek && e.mealType === mealType);

  const getDayDate = (dayIndex: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + dayIndex);
    return d.getDate();
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] border-collapse">
        <thead>
          <tr>
            <th className="text-left text-xs font-medium text-gray-500 pb-2 pr-3 w-24">Meal</th>
            {DAYS.map((day, i) => (
              <th key={day} className="text-center text-xs font-medium text-gray-700 pb-2 px-1">
                <div>{day}</div>
                <div className="text-gray-400 font-normal">{getDayDate(i)}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MEAL_TYPES.map((mealType) => (
            <tr key={mealType}>
              <td className="text-xs font-medium text-gray-500 pr-3 py-1 align-top">{mealType}</td>
              {DAYS.map((_, dayIdx) => (
                <td key={dayIdx} className="px-1 py-1 align-top">
                  <MealSlot
                    entry={getEntry(dayIdx, mealType)}
                    dayOfWeek={dayIdx}
                    mealType={mealType}
                    onClear={onClearEntry}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
