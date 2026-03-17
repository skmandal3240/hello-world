import { HabitFrequency } from '@prisma/client';

export interface CheckInRecord {
  date: Date;
  completed: boolean;
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getISOWeekKey(d: Date): string {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export function calculateCurrentStreak(
  checkIns: CheckInRecord[],
  frequency: HabitFrequency,
  today: Date
): number {
  if (frequency === HabitFrequency.DAILY) {
    const completedDays = new Set(
      checkIns.filter((c) => c.completed).map((c) => toDateKey(c.date))
    );
    let streak = 0;
    const cur = new Date(today);
    cur.setHours(0, 0, 0, 0);
    while (completedDays.has(toDateKey(cur))) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    }
    return streak;
  } else {
    // WEEKLY
    const completedWeeks = new Set(
      checkIns.filter((c) => c.completed).map((c) => getISOWeekKey(c.date))
    );
    let streak = 0;
    const cur = new Date(today);
    while (completedWeeks.has(getISOWeekKey(cur))) {
      streak++;
      cur.setDate(cur.getDate() - 7);
    }
    return streak;
  }
}

export function calculateLongestStreak(
  checkIns: CheckInRecord[],
  frequency: HabitFrequency
): number {
  if (checkIns.length === 0) return 0;

  if (frequency === HabitFrequency.DAILY) {
    const completedDays = checkIns
      .filter((c) => c.completed)
      .map((c) => toDateKey(c.date))
      .sort();

    let longest = 0;
    let current = 0;
    let prevKey = '';

    for (const key of completedDays) {
      if (!prevKey) {
        current = 1;
      } else {
        const prev = new Date(prevKey);
        prev.setDate(prev.getDate() + 1);
        current = toDateKey(prev) === key ? current + 1 : 1;
      }
      if (current > longest) longest = current;
      prevKey = key;
    }
    return longest;
  } else {
    const completedWeeks = [...new Set(
      checkIns.filter((c) => c.completed).map((c) => getISOWeekKey(c.date))
    )].sort();

    let longest = 0;
    let current = 0;
    let prevWeek = '';

    for (const wk of completedWeeks) {
      if (!prevWeek) {
        current = 1;
      } else {
        const [py, pw] = prevWeek.split('-W').map(Number);
        const [cy, cw] = wk.split('-W').map(Number);
        const isConsecutive = (cy === py && cw === pw + 1) || (cy === py + 1 && pw >= 52 && cw === 1);
        current = isConsecutive ? current + 1 : 1;
      }
      if (current > longest) longest = current;
      prevWeek = wk;
    }
    return longest;
  }
}

export function calculateCompletionRate(
  checkIns: CheckInRecord[],
  createdAt: Date,
  today: Date
): number {
  const daysSinceCreation = Math.max(
    1,
    Math.floor((today.getTime() - createdAt.getTime()) / 86400000) + 1
  );
  const completed = checkIns.filter((c) => c.completed).length;
  return Math.round((completed / daysSinceCreation) * 100);
}
