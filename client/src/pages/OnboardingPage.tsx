import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { languagesApi } from '../api/languages';
import { usersApi } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { Language, ProficiencyLevel } from '../types/auth';
import Button from '../components/ui/Button';
import ErrorBanner from '../components/ui/ErrorBanner';
import Spinner from '../components/ui/Spinner';

const LEVELS: { value: ProficiencyLevel; label: string; desc: string }[] = [
  { value: 'A1', label: 'A1 — Beginner', desc: 'Basic phrases' },
  { value: 'A2', label: 'A2 — Elementary', desc: 'Simple sentences' },
  { value: 'B1', label: 'B1 — Intermediate', desc: 'Everyday topics' },
  { value: 'B2', label: 'B2 — Upper-Intermediate', desc: 'Complex topics' },
  { value: 'C1', label: 'C1 — Advanced', desc: 'Fluent expression' },
  { value: 'C2', label: 'C2 — Mastery', desc: 'Near-native' },
];

export default function OnboardingPage() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [nativeId, setNativeId] = useState('');
  const [learningId, setLearningId] = useState('');
  const [level, setLevel] = useState<ProficiencyLevel>('B1');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    languagesApi.list().then(({ data }) => setLanguages(data)).finally(() => setFetching(false));
  }, []);

  const handleSubmit = async () => {
    if (!nativeId || !learningId) { setError('Please select both languages.'); return; }
    if (nativeId === learningId) { setError('Native and learning language must differ.'); return; }
    setError('');
    setLoading(true);
    try {
      await usersApi.onboarding(nativeId, learningId, level);
      await refreshUser();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome! Let's get you set up</h1>
        <p className="text-gray-500 text-sm mb-8">Tell us about your language exchange goals.</p>

        {error && <ErrorBanner message={error} />}

        <div className="space-y-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">My native language</label>
            <select
              value={nativeId}
              onChange={(e) => setNativeId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select language…</option>
              {languages.map((l) => (
                <option key={l.id} value={l.id}>{l.flagEmoji} {l.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">I want to learn</label>
            <select
              value={learningId}
              onChange={(e) => setLearningId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select language…</option>
              {languages.filter((l) => l.id !== nativeId).map((l) => (
                <option key={l.id} value={l.id}>{l.flagEmoji} {l.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">My current level</label>
            <div className="grid grid-cols-2 gap-2">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl.value}
                  onClick={() => setLevel(lvl.value)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors
                    ${level === lvl.value
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="font-medium">{lvl.label}</div>
                  <div className="text-xs text-gray-500">{lvl.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button onClick={handleSubmit} loading={loading} size="lg" className="w-full mt-8">
          Start learning
        </Button>
      </div>
    </div>
  );
}
