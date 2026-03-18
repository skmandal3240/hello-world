import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { SymptomSession } from '../types';
import TriageBadge from '../components/TriageBadge';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SymptomSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const limit = 10;

  useEffect(() => {
    setLoading(true);
    api.get<{ sessions: SymptomSession[]; total: number }>(`/sessions?page=${page}&limit=${limit}`)
      .then((res) => {
        setSessions(res.data.sessions);
        setTotal(res.data.total);
      })
      .catch(() => setError('Failed to load sessions'))
      .finally(() => setLoading(false));
  }, [page]);

  const startNewSession = async () => {
    setCreating(true);
    try {
      const { data } = await api.post('/sessions');
      navigate(`/sessions/${data.id}`);
    } catch {
      setError('Failed to start session');
      setCreating(false);
    }
  };

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Delete this consultation?')) return;
    try {
      await api.delete(`/sessions/${id}`);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      setTotal((t) => t - 1);
    } catch {
      setError('Failed to delete session');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consultations</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total sessions</p>
        </div>
        <button
          onClick={startNewSession}
          disabled={creating}
          className="bg-sky-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-sky-700 transition-colors disabled:opacity-50"
        >
          {creating ? 'Starting...' : '+ New Consultation'}
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400">Loading...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🩺</div>
          <p className="text-gray-500 mb-4">No consultations yet</p>
          <button
            onClick={startNewSession}
            className="bg-sky-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-sky-700"
          >
            Start your first consultation
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm divide-y divide-gray-50">
          {sessions.map((s) => (
            <Link
              key={s.id}
              to={`/sessions/${s.id}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-sky-50 transition-colors group"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">{s.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-400">
                    {new Date(s.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{s._count?.messages ?? 0} messages</span>
                  {s.doctorSummary && (
                    <>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-green-600 font-medium">📋 Summary ready</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <TriageBadge level={s.triageLevel} size="sm" />
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  s.status === 'COMPLETED' ? 'bg-gray-100 text-gray-500' : 'bg-sky-100 text-sky-600'
                }`}>
                  {s.status === 'COMPLETED' ? 'Done' : 'Active'}
                </span>
                <button
                  onClick={(e) => deleteSession(s.id, e)}
                  className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-xs"
                >
                  ✕
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
