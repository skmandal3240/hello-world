import { prisma } from '../config/prisma';
import { randomUUID } from 'crypto';

interface QueueEntry {
  userId: string;
  socketId: string;
  learningLanguageId: string;
  nativeLanguageId: string;
  proficiencyLevel: string;
  joinedAt: Date;
}

interface PendingMatch {
  sessionId: string;
  userAId: string;
  userBId: string;
  userASocketId: string;
  userBSocketId: string;
  acceptedBy: Set<string>;
  createdAt: Date;
}

// In-memory structures (Redis-ready: each entry is a plain serializable object)
const queue: Map<string, QueueEntry> = new Map(); // userId → entry
const pendingMatches: Map<string, PendingMatch> = new Map(); // sessionId → match

export function joinQueue(entry: QueueEntry): void {
  queue.set(entry.userId, entry);
}

export function leaveQueue(userId: string): void {
  queue.delete(userId);
}

export function findMatch(userId: string): QueueEntry | null {
  const requester = queue.get(userId);
  if (!requester) return null;

  for (const [candidateId, candidate] of queue.entries()) {
    if (candidateId === userId) continue;
    // Language exchange match: A learns B's native, B learns A's native
    if (
      candidate.learningLanguageId === requester.nativeLanguageId &&
      candidate.nativeLanguageId === requester.learningLanguageId
    ) {
      return candidate;
    }
  }
  return null;
}

export async function createPendingMatch(
  userAId: string,
  userASocketId: string,
  userBId: string,
  userBSocketId: string,
  targetLanguageId: string,
  sourceLanguageId: string
): Promise<PendingMatch> {
  // Remove both from queue
  queue.delete(userAId);
  queue.delete(userBId);

  const session = await prisma.session.create({
    data: {
      userAId,
      userBId,
      targetLanguageId,
      sourceLanguageId,
      status: 'MATCHED',
    },
  });

  const match: PendingMatch = {
    sessionId: session.id,
    userAId,
    userBId,
    userASocketId,
    userBSocketId,
    acceptedBy: new Set(),
    createdAt: new Date(),
  };

  pendingMatches.set(session.id, match);
  return match;
}

export function acceptMatch(sessionId: string, userId: string): PendingMatch | null {
  const match = pendingMatches.get(sessionId);
  if (!match) return null;
  match.acceptedBy.add(userId);
  return match;
}

export function declineMatch(sessionId: string): PendingMatch | null {
  const match = pendingMatches.get(sessionId);
  if (match) pendingMatches.delete(sessionId);
  return match || null;
}

export function removePendingMatch(sessionId: string): void {
  pendingMatches.delete(sessionId);
}

export async function startSession(sessionId: string): Promise<void> {
  await prisma.session.update({
    where: { id: sessionId },
    data: { status: 'ACTIVE', startedAt: new Date() },
  });
  pendingMatches.delete(sessionId);
}

export async function endSession(sessionId: string, userId: string): Promise<{ durationSeconds: number }> {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session?.startedAt) return { durationSeconds: 0 };

  const durationSeconds = Math.floor((Date.now() - session.startedAt.getTime()) / 1000);
  await prisma.session.update({
    where: { id: sessionId },
    data: { status: 'ENDED', endedAt: new Date(), durationSeconds },
  });
  return { durationSeconds };
}

export function getQueuePosition(userId: string): number {
  let pos = 0;
  for (const [id] of queue.entries()) {
    pos++;
    if (id === userId) return pos;
  }
  return -1;
}
