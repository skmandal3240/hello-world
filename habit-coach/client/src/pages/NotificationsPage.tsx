import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { NotificationType } from '../types';

const typeIcon: Record<NotificationType, string> = {
  AI_NUDGE: '🤖', AI_REENGAGEMENT: '💬', AI_WEEKLY_SUMMARY: '📊',
  PARTNER_ENCOURAGEMENT: '👏', PARTNER_MATCHED: '🤝', SYSTEM: '🔔',
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationsPage() {
  const { notifications, loading, markRead, markAllRead } = useNotifications();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        {notifications.some((n) => !n.isRead) && (
          <Button size="sm" variant="ghost" onClick={markAllRead}>Mark all read</Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">🔔</p>
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && markRead(n.id)}
              className={`bg-white rounded-xl border p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                n.isRead ? 'border-gray-200' : 'border-indigo-200 bg-indigo-50/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{typeIcon[n.type]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                    {!n.isRead && <span className="h-2 w-2 rounded-full bg-indigo-600 flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{n.body}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(n.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
