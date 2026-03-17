import { api } from './axios';
import { Session } from '../types/session';

export const sessionsApi = {
  list: (page = 1, limit = 20) =>
    api.get<{ sessions: Session[]; total: number; page: number; pages: number }>(
      `/sessions?page=${page}&limit=${limit}`
    ),
  getById: (id: string) => api.get<Session>(`/sessions/${id}`),
  getFeedback: (sessionId: string) => api.get(`/sessions/${sessionId}/feedback`),
};
