import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

export async function listLanguages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const languages = await prisma.language.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, code: true, name: true, nativeName: true, flagEmoji: true },
    });
    res.json(languages);
  } catch (err) {
    next(err);
  }
}
