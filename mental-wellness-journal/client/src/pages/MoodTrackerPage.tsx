import { useState, useEffect, FormEvent } from 'react';
import Navbar from '../components/Navbar';
import MoodPicker from '../components/MoodPicker';
import MoodChart from '../components/MoodChart';
import api from '../lib/api';
import { MoodLog, MoodStats } from '../types';

export default function MoodTrackerPage() {
  const [history, setHistory] = useState<MoodLog[]>([]);
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [days, setDays] = useState(30);
  const [score, setScore] = useState(5);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchData = (d: number) => {
    Promise.all([
      api.get<MoodLog[]>(`/mood?days=${d}`),
      api.get<MoodStats>('/mood/stats'),
    ]).then(([histRes, statsRes]) => {
      setHistory(histRes.data);
      setStats(statsRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(days); }, [days]);

  const handleLog = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/mood', { score, note: note.trim() || undefined });
      setSaved(true);
      setNote('');
      fetchData(days);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const trendIcon = (trend: string | null) => {
    if (trend === 'improving') return '📈';
    if (trend === 'declining') return '📉';
    return '➡️';
  };

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Mood Tracker</h1>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Log today's mood</h2>
          {saved && <div className="bg-emerald-50 text-emerald-700 text-sm px-4 py-2 rounded-lg mb-4">Mood logged! ✓</div>}
          <form onSubmit={handleLog} className="space-y-4">
            <MoodPicker value={score} onChange={setScore} />
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
              placeholder="Optional note about how you're feeling..."
            />
            <button
              type="submit"
              disabled={saving}
              className="bg-rose-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-rose-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Log mood'}
            </button>
          </form>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">Avg mood</p>
              <p className="text-2xl font-bold text-gray-800">{stats.avg != null ? stats.avg.toFixed(1) : '—'}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">Trend</p>
              <p className="text-2xl">{trendIcon(stats.trend)}</p>
              <p className="text-xs text-gray-500 capitalize">{stats.trend || 'No data'}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">Best day</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.best?.score ?? '—'}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">Lowest day</p>
              <p className="text-2xl font-bold text-red-500">{stats.worst?.score ?? '—'}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Mood history</h2>
            <div className="flex gap-2">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => { setDays(d); setLoading(true); }}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${days === d ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-rose-50'}`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
          {loading ? <div className="h-40 flex items-center justify-center text-gray-400">Loading...</div> : <MoodChart logs={history} />}
        </div>
      </div>
    </>
  );
}
