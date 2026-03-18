import { useState, useEffect, FormEvent, KeyboardEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MoodPicker from '../components/MoodPicker';
import api from '../lib/api';
import { JournalEntry } from '../types';

export default function EntryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [reflecting, setReflecting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editMood, setEditMood] = useState(5);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    api.get<JournalEntry>(`/entries/${id}`)
      .then((res) => {
        setEntry(res.data);
        setEditTitle(res.data.title || '');
        setEditContent(res.data.content);
        setEditMood(res.data.moodScore);
        setEditTags(res.data.tags);
      })
      .catch(() => navigate('/journal'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const triggerReflection = async () => {
    if (!entry) return;
    setReflecting(true);
    try {
      const res = await api.post<JournalEntry>(`/entries/${id}/reflect`);
      setEntry(res.data);
    } catch {
      // silently ignore — backend may process async
    } finally {
      setReflecting(false);
    }
  };

  const addTag = () => {
    const tag = editTagInput.trim().toLowerCase();
    if (tag && !editTags.includes(tag)) setEditTags((p) => [...p, tag]);
    setEditTagInput('');
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
    if (e.key === 'Backspace' && !editTagInput && editTags.length > 0) setEditTags((p) => p.slice(0, -1));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaveError('');
    try {
      const res = await api.patch<JournalEntry>(`/entries/${id}`, {
        title: editTitle.trim() || undefined,
        content: editContent.trim(),
        moodScore: editMood,
        tags: editTags,
      });
      setEntry(res.data);
      setEditing(false);
    } catch {
      setSaveError('Failed to save changes. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this journal entry? This cannot be undone.')) return;
    setDeleting(true);
    await api.delete(`/entries/${id}`).catch(() => {});
    navigate('/journal');
  };

  const moodColor = (score: number) => {
    if (score >= 8) return 'bg-emerald-100 text-emerald-700';
    if (score >= 5) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  if (loading) return <><Navbar /><div className="flex h-64 items-center justify-center text-gray-400">Loading...</div></>;
  if (!entry) return null;

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Link to="/journal" className="hover:text-rose-600">Journal</Link>
          <span>/</span>
          <span>{new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-5">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-2xl font-bold border-b border-gray-200 pb-2 focus:outline-none focus:border-rose-400"
              placeholder="Title (optional)"
            />
            <MoodPicker value={editMood} onChange={setEditMood} />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={10}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
            />
            <div className="flex flex-wrap gap-2 border border-gray-200 rounded-lg px-3 py-2 min-h-[42px] focus-within:ring-2 focus-within:ring-rose-300">
              {editTags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                  {tag}
                  <button type="button" onClick={() => setEditTags((p) => p.filter((t) => t !== tag))}>×</button>
                </span>
              ))}
              <input
                type="text"
                value={editTagInput}
                onChange={(e) => setEditTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={addTag}
                className="flex-1 min-w-[120px] text-sm outline-none"
                placeholder="Add tags..."
              />
            </div>
            {saveError && <p className="text-sm text-red-600">{saveError}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setEditing(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="submit" className="flex-1 bg-rose-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-rose-700 transition-colors">Save changes</button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {entry.title || new Date(entry.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h1>
              <span className={`shrink-0 text-sm px-3 py-1 rounded-full font-medium ${moodColor(entry.moodScore)}`}>Mood {entry.moodScore}/10</span>
            </div>

            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{entry.content}</p>

            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {entry.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            )}

            <div className="mt-6 border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">✨ AI Reflection</h2>
                {!entry.aiReflection && (
                  <button
                    onClick={triggerReflection}
                    disabled={reflecting}
                    className="text-xs text-rose-600 border border-rose-200 px-3 py-1 rounded-lg hover:bg-rose-50 disabled:opacity-50 transition-colors"
                  >
                    {reflecting ? 'Generating...' : 'Generate reflection'}
                  </button>
                )}
              </div>
              {entry.aiReflection ? (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                  {entry.aiReflection}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No reflection yet. Click "Generate reflection" to get AI insights on this entry.</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(true)} className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">Edit</button>
              <button onClick={handleDelete} disabled={deleting} className="border border-red-200 text-red-500 px-4 py-2 rounded-lg text-sm hover:bg-red-50 disabled:opacity-50 transition-colors">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
