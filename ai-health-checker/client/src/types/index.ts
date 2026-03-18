export type TriageLevel = 'EMERGENT' | 'URGENT' | 'SEE_DOCTOR' | 'MONITOR' | 'SELF_CARE';
export type SessionStatus = 'ACTIVE' | 'COMPLETED';
export type MessageRole = 'USER' | 'ASSISTANT';

export interface User {
  id: string;
  email: string;
  displayName: string;
  timezone: string;
  createdAt: string;
}

export interface SessionMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface SymptomSession {
  id: string;
  userId: string;
  title: string;
  triageLevel: TriageLevel | null;
  status: SessionStatus;
  doctorSummary: string | null;
  summaryGeneratedAt: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: SessionMessage[];
  _count?: { messages: number };
}

export interface DashboardStats {
  totalSessions: number;
  triageBreakdown: Record<string, number>;
  recentSessions: (SymptomSession & { _count: { messages: number } })[];
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}
