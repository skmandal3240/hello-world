import Anthropic from '@anthropic-ai/sdk';
import { Response } from 'express';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { prisma } from '../config/prisma';
import { createNotification } from './notifications.service';

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

// ── Daily Nudge ──────────────────────────────────────────────────────────────

export async function getDailyNudge(userId: string) {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  // Cache check
  const cached = await prisma.notification.findFirst({
    where: { userId, type: 'AI_NUDGE', createdAt: { gte: startOfDay } },
    orderBy: { createdAt: 'desc' },
  });
  if (cached) return { title: cached.title, body: cached.body };

  const habits = await prisma.habit.findMany({
    where: { userId, isArchived: false },
    select: { name: true, category: true, currentStreak: true, longestStreak: true, targetDays: true, totalCompletions: true },
  });

  if (habits.length === 0) {
    return { title: 'Welcome!', body: 'Start by creating your first habit to track.' };
  }

  const todayCheckIns = await prisma.checkIn.findMany({
    where: { userId, date: startOfDay, completed: true },
    select: { habitId: true },
  });
  const completedTodayIds = new Set(todayCheckIns.map((c) => c.habitId));

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      system: 'You are a warm, supportive habit coach. Give personalized, specific encouragement in 2-3 sentences. Be concise and uplifting.',
      messages: [{
        role: 'user',
        content: `My habits today:\n${JSON.stringify({ habits, completedToday: todayCheckIns.length, totalHabits: habits.length })}\n\nGive me a motivating nudge for today.`,
      }],
    });

    const body = response.content[0].type === 'text' ? response.content[0].text : 'Keep going — every day counts!';
    const title = 'Your Daily Motivation';

    await createNotification(userId, 'AI_NUDGE', title, body);
    return { title, body };
  } catch (err) {
    logger.error({ err }, 'AI nudge generation failed');
    return { title: 'Keep Going!', body: 'Every small step forward builds your streak. You can do this!' };
  }
}

// ── Weekly Summary ────────────────────────────────────────────────────────────

export async function getWeeklySummary(userId: string) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const cached = await prisma.notification.findFirst({
    where: { userId, type: 'AI_WEEKLY_SUMMARY', createdAt: { gte: startOfWeek } },
  });
  if (cached) return { title: cached.title, body: cached.body };

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const habits = await prisma.habit.findMany({
    where: { userId, isArchived: false },
    include: {
      checkIns: {
        where: { date: { gte: sevenDaysAgo } },
        select: { date: true, completed: true },
      },
    },
  });

  if (habits.length === 0) return { title: 'Weekly Summary', body: 'Create some habits to get your weekly AI summary!' };

  const summaryData = habits.map((h) => ({
    name: h.name,
    category: h.category,
    currentStreak: h.currentStreak,
    completedThisWeek: h.checkIns.filter((c) => c.completed).length,
    totalThisWeek: h.checkIns.length,
  }));

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: 'You are a habit coach providing weekly progress summaries. Be encouraging, specific, and actionable.',
      messages: [{
        role: 'user',
        content: `My weekly habit data:\n${JSON.stringify(summaryData)}\n\nGive me a concise weekly summary with: 1) What went well 2) One area to improve 3) One actionable tip for next week.`,
      }],
    });

    const body = response.content[0].type === 'text' ? response.content[0].text : 'Great work this week! Keep building those habits.';
    const title = 'Your Weekly Summary';

    await createNotification(userId, 'AI_WEEKLY_SUMMARY', title, body);
    return { title, body };
  } catch (err) {
    logger.error({ err }, 'Weekly summary generation failed');
    return { title: 'Weekly Summary', body: 'Keep tracking your habits to get personalized weekly insights!' };
  }
}

// ── Re-engagement Message ─────────────────────────────────────────────────────

export async function getReengagementMessage(userId: string, habitId: string) {
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
  if (!habit) return;

  const lastCheckIn = await prisma.checkIn.findFirst({
    where: { habitId, completed: true },
    orderBy: { date: 'desc' },
  });

  const daysSince = lastCheckIn
    ? Math.floor((Date.now() - lastCheckIn.date.getTime()) / 86400000)
    : null;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
      system: 'You are a compassionate habit coach. Help re-engage users who have missed their habit without guilt. Be warm and encouraging.',
      messages: [{
        role: 'user',
        content: `Habit: ${habit.name} (${habit.category}), streak was ${habit.currentStreak} days, last completed ${daysSince !== null ? `${daysSince} days ago` : 'unknown'}. Write a compassionate re-engagement message.`,
      }],
    });

    const body = response.content[0].type === 'text' ? response.content[0].text : `Ready to restart your ${habit.name} habit? Every comeback is a new beginning!`;
    await createNotification(userId, 'AI_REENGAGEMENT', `Time to revisit: ${habit.name}`, body, { habitId });
  } catch (err) {
    logger.error({ err }, 'Re-engagement message failed');
  }
}

// ── Chat (Streaming SSE) ──────────────────────────────────────────────────────

export async function chat(userId: string, message: string, res: Response) {
  const habits = await prisma.habit.findMany({
    where: { userId, isArchived: false },
    select: { name: true, category: true, currentStreak: true, longestStreak: true, totalCompletions: true, frequency: true },
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentCheckIns = await prisma.checkIn.findMany({
    where: { userId, date: { gte: sevenDaysAgo } },
    select: { completed: true, date: true },
  });
  const completedThisWeek = recentCheckIns.filter((c) => c.completed).length;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: 'You are a helpful habit coach with access to the user\'s habit data. Answer questions about their habits, streaks, and patterns. Be encouraging and specific.',
      messages: [{
        role: 'user',
        content: `My habit context: ${JSON.stringify({ habits, completedThisWeek })}\n\nQuestion: ${message}`,
      }],
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }
    res.write('data: [DONE]\n\n');
  } catch (err) {
    logger.error({ err }, 'AI chat failed');
    res.write(`data: ${JSON.stringify({ error: 'AI service unavailable' })}\n\n`);
  } finally {
    res.end();
  }
}
