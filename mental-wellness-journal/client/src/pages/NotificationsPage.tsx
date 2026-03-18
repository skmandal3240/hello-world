import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../lib/api';
import { Notification } from '../types';

const TYPE_ICONS: Record<string, string> = {
  AI_DAILY_PROMPT: '✍️',
  AI_WEEKLY_SUMMARY: '📊',
  STREAK_MILESTONE: '🔥',
  SYSTEM: '🔔',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Notification[]>('/notifications')
      .then((res) => setNotifications(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`).catch(() => {});
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all').catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = async (id: string) => {
    await api.delete(`/notifications/${id}`).catch(() => {});
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Notifications {unreadCount > 0 && <span className="text-lg font-normal text-rose-500">({unreadCount} new)</span>}
          </h1>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-sm text-gray-500 hover:text-rose-600 transition-colors">
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">🔔</p>
            <p className="text-gray-400">No notifications yet. Keep journaling!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-white rounded-2xl p-4 border transition-colors ${notif.isRead ? 'border-gray-100' : 'border-rose-200 bg-rose-50/30'}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0">{TYPE_ICONS[notif.type] || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-medium ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</p>
                      {!notif.isRead && (
                        <span className="shrink-0 w-2 h-2 bg-rose-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{notif.body}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400">{new Date(notif.createdAt).toLocaleString()}</span>
                      {!notif.isRead && (
                        <button onClick={() => markRead(notif.id)} className="text-xs text-rose-600 hover:underline">Mark read</button>
                      )}
                      <button onClick={() => deleteNotification(notif.id)} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
