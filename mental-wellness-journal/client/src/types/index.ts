export interface JournalEntry {
  id: string;
  title?: string;
  content: string;
  moodScore: number;
  tags: string[];
  aiReflection?: string;
  aiReflectionGeneratedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MoodLog {
  id: string;
  score: number;
  note?: string;
  loggedAt: string;
}

export interface MoodStats {
  avg: number | null;
  trend: 'improving' | 'declining' | 'stable' | null;
  best: MoodLog | null;
  worst: MoodLog | null;
  totalDays: number;
}

export interface JournalingStreak {
  currentStreak: number;
  longestStreak: number;
}

export interface CbtExercise {
  id: string;
  category: string;
  title: string;
  description: string;
  instructions: string;
  durationMinutes: number;
}

export interface ExerciseCompletion {
  id: string;
  exerciseId: string;
  completedAt: string;
  notes?: string;
  exercise: { title: string; category: string };
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
  avgMood30d: number | null;
  exercisesCompleted: number;
  recentEntries: JournalEntry[];
}
