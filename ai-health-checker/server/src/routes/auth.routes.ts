import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1).max(100),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function issueTokens(userId: string, email: string) {
  return {
    accessToken: signAccessToken({ userId, email }),
    refreshToken: signRefreshToken({ userId, email }),
  };
}

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, displayName } = SignupSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, passwordHash, displayName } });
    const tokens = issueTokens(user.id, user.email);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.refreshToken.create({ data: { token: tokens.refreshToken, userId: user.id, expiresAt } });

    res.status(201).json({
      user: { id: user.id, email: user.email, displayName: user.displayName },
      ...tokens,
    });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    logger.error({ error }, 'Signup failed');
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const tokens = issueTokens(user.id, user.email);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.refreshToken.create({ data: { token: tokens.refreshToken, userId: user.id, expiresAt } });

    res.json({
      user: { id: user.id, email: user.email, displayName: user.displayName },
      ...tokens,
    });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    logger.error({ error }, 'Login failed');
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
    const payload = verifyRefreshToken(refreshToken);
    const newTokens = issueTokens(payload.userId, payload.email);

    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.refreshToken.create({ data: { token: newTokens.refreshToken, userId: payload.userId, expiresAt } });

    res.json(newTokens);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken, userId: req.user!.userId },
      data: { revoked: true },
    });
    res.json({ message: 'Logged out' });
  } catch {
    res.json({ message: 'Logged out' });
  }
});

router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, displayName: true, timezone: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    logger.error({ error }, 'Get me failed');
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const body = z.object({ displayName: z.string().min(1).max(100).optional() }).parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: body,
      select: { id: true, email: true, displayName: true },
    });
    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
    logger.error({ error }, 'Update me failed');
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
