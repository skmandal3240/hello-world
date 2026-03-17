import { prisma } from '../config/prisma';
import { ProficiencyLevel } from '@prisma/client';
import { createError } from '../middleware/errorHandler';

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      displayName: true,
      avatarUrl: true,
      proficiencyLevel: true,
      onboardingComplete: true,
      createdAt: true,
      nativeLanguage: { select: { id: true, code: true, name: true, flagEmoji: true } },
      learningLanguage: { select: { id: true, code: true, name: true, flagEmoji: true } },
      totalSessions: true,
      currentStreak: true,
      longestStreak: true,
      lastSessionDate: true,
    },
  });
  if (!user) throw createError('User not found', 404);
  return user;
}

export async function updateProfile(
  userId: string,
  data: { displayName?: string; avatarUrl?: string }
) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, displayName: true, avatarUrl: true },
  });
}

export async function completeOnboarding(
  userId: string,
  nativeLanguageId: string,
  learningLanguageId: string,
  proficiencyLevel: ProficiencyLevel
) {
  const [native, learning] = await Promise.all([
    prisma.language.findUnique({ where: { id: nativeLanguageId } }),
    prisma.language.findUnique({ where: { id: learningLanguageId } }),
  ]);
  if (!native) throw createError('Native language not found', 404);
  if (!learning) throw createError('Learning language not found', 404);
  if (nativeLanguageId === learningLanguageId)
    throw createError('Native and learning language must differ', 400);

  return prisma.user.update({
    where: { id: userId },
    data: { nativeLanguageId, learningLanguageId, proficiencyLevel, onboardingComplete: true },
    select: {
      id: true,
      proficiencyLevel: true,
      onboardingComplete: true,
      nativeLanguage: { select: { id: true, code: true, name: true, flagEmoji: true } },
      learningLanguage: { select: { id: true, code: true, name: true, flagEmoji: true } },
    },
  });
}

export async function getStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      totalSessions: true,
      currentStreak: true,
      longestStreak: true,
      lastSessionDate: true,
      nativeLanguage: { select: { code: true, name: true, flagEmoji: true } },
      learningLanguage: { select: { code: true, name: true, flagEmoji: true } },
    },
  });
  if (!user) throw createError('User not found', 404);
  return user;
}
