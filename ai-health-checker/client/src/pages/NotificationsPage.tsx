import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Notification } from '../types';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Notification[]>('/notifications')
      .then((res) => setNotifications(res.data))
      .catch(() => setError('Failed to load notifications'))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      /* ignore */
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      /* ignore */
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      /* ignore */
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sky-600 text-sm mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm text-sky-600 hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔔</div>
          <p className="text-gray-400">No notifications yet</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm divide-y divide-gray-50">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-4 px-6 py-4 group ${n.isRead ? '' : 'bg-sky-50/40'}`}
            >
              <div className="shrink-0 mt-0.5">
                {n.isRead ? (
                  <div className="w-2 h-2 rounded-full bg-gray-200" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-sky-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                  {n.title}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="text-xs text-sky-600 hover:underline"
                  >
                    Read
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(n.id)}
                  className="text-xs text-gray-300 hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
