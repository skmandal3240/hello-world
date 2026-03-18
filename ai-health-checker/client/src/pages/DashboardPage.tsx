import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { DashboardStats, TriageLevel } from '../types';
import TriageBadge from '../components/TriageBadge';

const TRIAGE_ORDER: TriageLevel[] = ['EMERGENT', 'URGENT', 'SEE_DOCTOR', 'MONITOR', 'SELF_CARE'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<DashboardStats>('/stats/dashboard')
      .then((res) => setStats(res.data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;
  if (error) return <div className="text-red-500 p-8 text-center">{error}</div>;
  if (!stats) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Your health consultation overview</p>
        </div>
        <button
          onClick={startNewSession}
          disabled={creating}
          className="bg-sky-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-sky-700 transition-colors disabled:opacity-50"
        >
          {creating ? 'Starting...' : '+ New Consultation'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Sessions</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalSessions}</p>
        </div>
        {TRIAGE_ORDER.filter((lvl) => stats.triageBreakdown[lvl]).slice(0, 3).map((lvl) => (
          <div key={lvl} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{lvl.replace('_', ' ')}</p>
            <p className="text-3xl font-bold text-gray-900">{stats.triageBreakdown[lvl] || 0}</p>
          </div>
        ))}
      </div>

      {/* Triage breakdown */}
      {Object.keys(stats.triageBreakdown).length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Triage Breakdown</h2>
          <div className="flex flex-wrap gap-3">
            {TRIAGE_ORDER.filter((lvl) => stats.triageBreakdown[lvl]).map((lvl) => (
              <div key={lvl} className="flex items-center gap-2">
                <TriageBadge level={lvl} size="sm" />
                <span className="text-sm font-medium text-gray-700">{stats.triageBreakdown[lvl]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent sessions */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Consultations</h2>
          <Link to="/sessions" className="text-sky-600 text-sm hover:underline">View all</Link>
        </div>
        {stats.recentSessions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-400 text-sm mb-4">No consultations yet</p>
            <button
              onClick={startNewSession}
              className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors"
            >
              Start your first consultation
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {stats.recentSessions.map((s) => (
              <Link
                key={s.id}
                to={`/sessions/${s.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-sky-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{s.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(s.createdAt).toLocaleDateString()} · {s._count.messages} messages
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <TriageBadge level={s.triageLevel} size="sm" />
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    s.status === 'COMPLETED'
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-sky-100 text-sky-600'
                  }`}>
                    {s.status === 'COMPLETED' ? 'Completed' : 'Active'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
