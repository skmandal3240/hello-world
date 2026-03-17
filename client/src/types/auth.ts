export interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  flagEmoji: string | null;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  proficiencyLevel: ProficiencyLevel;
  onboardingComplete: boolean;
  nativeLanguage: Language | null;
  learningLanguage: Language | null;
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;
  createdAt: string;
}

export type ProficiencyLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
