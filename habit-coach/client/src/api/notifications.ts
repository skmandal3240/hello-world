import { api } from './axios';
import { Notification } from '../types';

export const notificationsApi = {
  list: (page?: number) => api.get<{ notifications: Notification[]; total: number; page: number }>(`/notifications${page ? `?page=${page}` : ''}`),
  unreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};
