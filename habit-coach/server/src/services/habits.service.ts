import { HabitCategory, HabitFrequency } from '@prisma/client';
import { prisma } from '../config/prisma';
import { createError } from '../middleware/errorHandler';

export async function getHabits(userId: string) {
  return prisma.habit.findMany({
    where: { userId, isArchived: false },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getHabitById(userId: string, habitId: string) {
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
  if (!habit) throw createError('Habit not found', 404);
  return habit;
}

export async function createHabit(
  userId: string,
  data: {
    name: string;
    description?: string;
    frequency?: HabitFrequency;
    category?: HabitCategory;
    targetDays?: number;
  }
) {
  return prisma.habit.create({
    data: { userId, ...data },
  });
}

export async function updateHabit(
  userId: string,
  habitId: string,
  data: {
    name?: string;
    description?: string;
    frequency?: HabitFrequency;
    category?: HabitCategory;
    targetDays?: number;
  }
) {
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
  if (!habit) throw createError('Habit not found', 404);
  return prisma.habit.update({ where: { id: habitId }, data });
}

export async function archiveHabit(userId: string, habitId: string) {
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
  if (!habit) throw createError('Habit not found', 404);
  return prisma.habit.update({ where: { id: habitId }, data: { isArchived: !habit.isArchived } });
}

export async function deleteHabit(userId: string, habitId: string) {
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
  if (!habit) throw createError('Habit not found', 404);
  await prisma.habit.delete({ where: { id: habitId } });
}

export async function getHabitWithHistory(userId: string, habitId: string) {
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
  if (!habit) throw createError('Habit not found', 404);

  const since = new Date();
  since.setDate(since.getDate() - 84); // 12 weeks

  const checkIns = await prisma.checkIn.findMany({
    where: { habitId, date: { gte: since } },
    orderBy: { date: 'desc' },
  });

  const totalCheckIns = await prisma.checkIn.count({ where: { habitId } });
  const completedCheckIns = await prisma.checkIn.count({ where: { habitId, completed: true } });

  return {
    ...habit,
    checkIns,
    completionRate: totalCheckIns > 0 ? Math.round((completedCheckIns / totalCheckIns) * 100) : 0,
  };
}
