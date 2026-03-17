import { api } from './axios';
import { AiInsight, ForecastResult } from '../types/insight';

export const insightsApi = {
  list: () => api.get<AiInsight[]>('/insights'),
  generate: (month?: number, year?: number) => api.post<AiInsight>('/insights/generate', { month, year }),
  forecast: () => api.get<ForecastResult>('/insights/forecast'),
  chat: (message: string) => api.post<{ reply: string }>('/insights/chat', { message }),
};
