import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sessionsApi } from '../api/sessions';
import { Session, FeedbackEntry } from '../types/session';
import { useAuth } from '../context/AuthContext';
import TranscriptPanel from '../components/session/TranscriptPanel';
import FeedbackCard from '../components/session/FeedbackCard';
import Spinner from '../components/ui/Spinner';

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([sessionsApi.getById(id), sessionsApi.getFeedback(id)])
      .then(([s, f]) => {
        setSession(s.data);
        setFeedback(f.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (!session) return <p className="text-center text-gray-500 py-16">Session not found.</p>;

  const mins = session.durationSeconds ? Math.floor(session.durationSeconds / 60) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/history" className="text-sm text-brand-600 hover:underline mb-4 inline-block">← Back to history</Link>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {session.targetLanguage.flagEmoji} {session.targetLanguage.name} Session
        </h1>
        <span className="text-sm text-gray-400">{mins} min · {new Date(session.createdAt).toLocaleDateString()}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Transcript</h2>
          <TranscriptPanel utterances={session.utterances || []} currentUserId={user?.id || ''} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Your Corrections ({feedback.length})</h2>
          {feedback.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">No feedback recorded for this session.</p>
          )}
          <div className="space-y-4">
            {feedback.map((fb) => <FeedbackCard key={fb.id} feedback={fb} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
