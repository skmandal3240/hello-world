export type HabitFrequency = 'DAILY' | 'WEEKLY';

export type HabitCategory =
  | 'HEALTH' | 'FITNESS' | 'LEARNING' | 'PRODUCTIVITY'
  | 'MINDFULNESS' | 'NUTRITION' | 'SOCIAL' | 'CREATIVITY'
  | 'FINANCE' | 'OTHER';

export type NotificationType =
  | 'AI_NUDGE' | 'AI_REENGAGEMENT' | 'AI_WEEKLY_SUMMARY'
  | 'PARTNER_ENCOURAGEMENT' | 'PARTNER_MATCHED' | 'SYSTEM';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarColor: string;
  bio?: string;
  timezone: string;
  matchingEnabled: boolean;
  preferredCategory?: HabitCategory;
  createdAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  frequency: HabitFrequency;
  category: HabitCategory;
  targetDays: number;
  isArchived: boolean;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  createdAt: string;
  updatedAt: string;
}

export interface HabitWithHistory extends Habit {
  checkIns: CheckIn[];
  completionRate: number;
}

export interface CheckIn {
  id: string;
  userId: string;
  habitId: string;
  date: string;
  completed: boolean;
  note?: string;
  createdAt: string;
}

export interface TodayStatus {
  habit: Habit;
  checkIn: CheckIn | null;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface PartnerMessage {
  id: string;
  content: string;
  isFromMe: boolean;
  isRead: boolean;
  createdAt: string;
}

export interface PartnerStatus {
  status: 'MATCHED' | 'PENDING' | 'UNMATCHED';
  pairId?: string;
  category?: HabitCategory;
  queuePosition?: number;
  partner?: {
    avatarColor: string;
    habitCount: number;
    topStreak: number;
  };
}

export interface AnonymousHabit {
  id: string;
  anonymousName: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  currentStreak: number;
  longestStreak: number;
}
