import { useState, FormEvent, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MoodPicker from '../components/MoodPicker';
import api from '../lib/api';

export default function NewEntryPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [moodScore, setMoodScore] = useState(5);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) setTags((prev) => [...prev, tag]);
    setTagInput('');
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) { setError('Please write something in your entry.'); return; }
    setError('');
    setSaving(true);
    try {
      const { data } = await api.post('/entries', { title: title.trim() || undefined, content: content.trim(), moodScore, tags });
      navigate(`/journal/${data.id}`);
    } catch {
      setError('Failed to save entry. Please try again.');
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">New journal entry</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              placeholder="Give your entry a title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">How are you feeling? <span className="text-rose-500">*</span></label>
            <MoodPicker value={moodScore} onChange={setMoodScore} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your entry <span className="text-rose-500">*</span></label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
              placeholder="Write freely about your thoughts, feelings, and experiences..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex flex-wrap gap-2 border border-gray-200 rounded-lg px-3 py-2 min-h-[42px] focus-within:ring-2 focus-within:ring-rose-300">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                  {tag}
                  <button type="button" onClick={() => setTags((p) => p.filter((t) => t !== tag))} className="hover:text-rose-900">×</button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={addTag}
                className="flex-1 min-w-[120px] text-sm outline-none"
                placeholder={tags.length === 0 ? 'Add tags (press Enter or comma)...' : ''}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/journal')}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-rose-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-rose-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save entry'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
