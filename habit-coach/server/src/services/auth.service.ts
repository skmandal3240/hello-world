import { randomUUID } from 'crypto';
import { prisma } from '../config/prisma';
import { hashPassword, comparePassword } from '../utils/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { createError } from '../middleware/errorHandler';
import { env } from '../config/env';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export async function signup(email: string, password: string, displayName: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw createError('Email already in use', 409);

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, displayName },
    select: { id: true, email: true, displayName: true, avatarColor: true, timezone: true, matchingEnabled: true, createdAt: true },
  });
  const tokens = await issueTokens(user.id, email);
  return { user, tokens };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    throw createError('Invalid credentials', 401);
  }
  const tokens = await issueTokens(user.id, email);
  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, tokens };
}

export async function refresh(token: string): Promise<AuthTokens> {
  let payload;
  try { payload = verifyRefreshToken(token); } catch { throw createError('Invalid refresh token', 401); }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw createError('Invalid or expired refresh token', 401);
  }
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
  return issueTokens(stored.userId, payload.userId);
}

export async function logout(token: string) {
  await prisma.refreshToken.updateMany({ where: { token }, data: { revoked: true } });
}

async function issueTokens(userId: string, email: string): Promise<AuthTokens> {
  const tokenId = randomUUID();
  const refreshExpiresMs = parseExpiry(env.JWT_REFRESH_EXPIRES_IN);
  const [accessToken, refreshToken] = [
    signAccessToken({ userId, email }),
    signRefreshToken({ userId, tokenId }),
  ];
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId, expiresAt: new Date(Date.now() + refreshExpiresMs) },
  });
  return { accessToken, refreshToken };
}

function parseExpiry(expiry: string): number {
  const unit = expiry.slice(-1);
  const val = parseInt(expiry.slice(0, -1), 10);
  return val * ({ s: 1000, m: 60000, h: 3600000, d: 86400000 }[unit] || 1000);
}
