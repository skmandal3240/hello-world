export type SessionStatus = 'WAITING' | 'MATCHED' | 'ACTIVE' | 'ENDED' | 'ABANDONED';

export interface Utterance {
  id: string;
  sessionId: string;
  speakerId: string;
  transcript: string;
  languageCode: string;
  sequenceNumber: number;
  spokenAt: string;
}

export interface GrammarError {
  original: string;
  corrected: string;
  explanation: string;
  severity: 'minor' | 'moderate' | 'major';
}

export interface VocabularySuggestion {
  word: string;
  alternative: string;
  reason: string;
}

export interface FeedbackEntry {
  id?: string;
  utteranceId: string;
  correctedText: string | null;
  grammarErrors: GrammarError[];
  vocabularySuggestions: VocabularySuggestion[];
  pronunciationScore: number | null;
  overallFeedback: string | null;
  createdAt?: string;
}

export interface Session {
  id: string;
  status: SessionStatus;
  startedAt: string | null;
  endedAt: string | null;
  durationSeconds: number | null;
  createdAt: string;
  targetLanguage: { code: string; name: string; flagEmoji: string | null };
  sourceLanguage: { code: string; name: string; flagEmoji: string | null };
  userA: { id: string; displayName: string };
  userB: { id: string; displayName: string } | null;
  utterances?: Utterance[];
}
