import { api } from './axios';
import { PartnerStatus, AnonymousHabit, PartnerMessage, HabitCategory } from '../types';

export const partnerApi = {
  status: () => api.get<PartnerStatus>('/partner/status'),
  optIn: (category: HabitCategory) => api.post<PartnerStatus>('/partner/opt-in', { category }),
  optOut: () => api.post('/partner/opt-out'),
  habits: () => api.get<AnonymousHabit[]>('/partner/habits'),
  messages: (page?: number) => api.get<PartnerMessage[]>(`/partner/messages${page ? `?page=${page}` : ''}`),
  sendMessage: (content: string) => api.post<PartnerMessage>('/partner/messages', { content }),
};
