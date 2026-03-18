import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StreakBadge from '../components/StreakBadge';
import MoodChart from '../components/MoodChart';
import api from '../lib/api';
import { DashboardStats, MoodLog } from '../types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodLog[]>([]);
  const [dailyPrompt, setDailyPrompt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<DashboardStats>('/stats/dashboard'),
      api.get<MoodLog[]>('/mood?days=7'),
      api.get<{ prompt: string }>('/ai/daily-prompt'),
    ])
      .then(([statsRes, moodRes, promptRes]) => {
        setStats(statsRes.data);
        setMoodHistory(moodRes.data);
        setDailyPrompt(promptRes.data.prompt);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-64 text-gray-400">Loading dashboard...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {dailyPrompt && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5">
            <p className="text-xs font-semibold text-rose-500 uppercase tracking-wide mb-2">Today's journaling prompt</p>
            <p className="text-gray-700 italic">"{dailyPrompt}"</p>
            <Link to="/journal/new" className="inline-block mt-3 text-sm font-medium text-rose-600 hover:underline">
              Write today's entry →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">Current streak</p>
            <StreakBadge streak={stats?.currentStreak ?? 0} />
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">Longest streak</p>
            <p className="text-2xl font-bold text-gray-800">{stats?.longestStreak ?? 0} <span className="text-sm text-gray-400">days</span></p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">Total entries</p>
            <p className="text-2xl font-bold text-gray-800">{stats?.totalEntries ?? 0}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">Avg mood (30d)</p>
            <p className="text-2xl font-bold text-gray-800">
              {stats?.avgMood30d != null ? stats.avgMood30d.toFixed(1) : '—'} <span className="text-sm text-gray-400">/10</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Mood this week</h2>
          <MoodChart logs={moodHistory} />
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Recent journal entries</h2>
            <Link to="/journal" className="text-sm text-rose-600 hover:underline">View all</Link>
          </div>
          {stats?.recentEntries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-3">No entries yet. Start your journey today!</p>
              <Link to="/journal/new" className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-rose-700 transition-colors">
                Write first entry
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats?.recentEntries.map((entry) => (
                <Link key={entry.id} to={`/journal/${entry.id}`} className="block border border-gray-100 rounded-xl p-4 hover:border-rose-200 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{entry.title || new Date(entry.createdAt).toLocaleDateString()}</span>
                    <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">Mood {entry.moodScore}/10</span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{entry.content}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
