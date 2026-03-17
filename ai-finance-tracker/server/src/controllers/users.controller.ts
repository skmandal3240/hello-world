import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { prisma } from '../config/prisma';
import { comparePassword, hashPassword } from '../utils/hash';

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { id: true, email: true, displayName: true, currency: true, createdAt: true },
    });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(user);
  } catch (e) { next(e); }
};

export const updateMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { displayName, currency } = req.body;
    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: { ...(displayName && { displayName }), ...(currency && { currency }) },
      select: { id: true, email: true, displayName: true, currency: true, createdAt: true },
    });
    res.json(user);
  } catch (e) { next(e); }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    const valid = await comparePassword(currentPassword, user.passwordHash);
    if (!valid) { res.status(400).json({ error: 'Current password is incorrect' }); return; }
    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: req.userId! }, data: { passwordHash } });
    res.json({ message: 'Password changed successfully' });
  } catch (e) { next(e); }
};
