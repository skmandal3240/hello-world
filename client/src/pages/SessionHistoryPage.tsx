import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sessionsApi } from '../api/sessions';
import { Session } from '../types/session';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import ErrorBanner from '../components/ui/ErrorBanner';

export default function SessionHistoryPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    sessionsApi
      .list()
      .then(({ data }) => setSessions(data.sessions))
      .catch(() => setError('Failed to load session history.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Session History</h1>
      {error && <ErrorBanner message={error} />}
      {sessions.length === 0 && !error && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">📚</div>
          <p>No sessions yet. <Link to="/match" className="text-brand-600 hover:underline">Find a partner</Link> to get started!</p>
        </div>
      )}
      <div className="space-y-3">
        {sessions.map((s) => {
          const partner = s.userA.id === user?.id ? s.userB : s.userA;
          const mins = s.durationSeconds ? Math.floor(s.durationSeconds / 60) : 0;
          return (
            <Link
              key={s.id}
              to={`/history/${s.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-brand-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {s.targetLanguage.flagEmoji} {s.targetLanguage.name}
                    </span>
                    <Badge color={s.status === 'ENDED' ? 'green' : 'gray'}>
                      {s.status.toLowerCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    with {partner?.displayName || 'Unknown'} · {mins} min
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(s.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
