import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../lib/api';
import { JournalEntry } from '../types';

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [before, setBefore] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchEntries = (cursor?: string) => {
    const params = new URLSearchParams({ limit: '20' });
    if (cursor) params.set('before', cursor);
    api.get<JournalEntry[]>(`/entries?${params}`)
      .then((res) => {
        const data = res.data;
        setEntries((prev) => cursor ? [...prev, ...data] : data);
        setHasMore(data.length === 20);
        if (data.length > 0) setBefore(data[data.length - 1].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEntries(); }, []);

  const moodColor = (score: number) => {
    if (score >= 8) return 'bg-emerald-100 text-emerald-700';
    if (score >= 5) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Journal</h1>
          <Link to="/journal/new" className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors">
            + New entry
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading entries...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-4">📔</p>
            <p className="text-gray-500 mb-4">Your journal is empty. Write your first entry!</p>
            <Link to="/journal/new" className="bg-rose-600 text-white px-6 py-3 rounded-lg hover:bg-rose-700 transition-colors">
              Start journaling
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <Link key={entry.id} to={`/journal/${entry.id}`} className="block bg-white border border-gray-100 rounded-2xl p-5 hover:border-rose-200 transition-colors shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 mb-1 truncate">
                      {entry.title || new Date(entry.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-2">{entry.content}</p>
                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${moodColor(entry.moodScore)}`}>
                      {entry.moodScore}/10
                    </span>
                    <span className="text-xs text-gray-400">{new Date(entry.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {entry.aiReflection && (
                  <div className="mt-3 text-xs text-rose-600 flex items-center gap-1">
                    <span>✨</span> AI reflection available
                  </div>
                )}
              </Link>
            ))}
            {hasMore && (
              <button
                onClick={() => fetchEntries(before ?? undefined)}
                className="w-full py-3 text-sm text-gray-500 hover:text-rose-600 transition-colors"
              >
                Load more
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
