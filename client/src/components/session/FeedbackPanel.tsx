import { FeedbackEntry, Utterance } from '../../types/session';
import FeedbackCard from './FeedbackCard';
import Spinner from '../ui/Spinner';

interface FeedbackPanelProps {
  utterances: Utterance[];
  feedbackMap: Record<string, FeedbackEntry>;
  currentUserId: string;
}

export default function FeedbackPanel({ utterances, feedbackMap, currentUserId }: FeedbackPanelProps) {
  const myUtterances = utterances.filter((u) => u.speakerId === currentUserId);

  return (
    <div className="flex flex-col gap-4 overflow-y-auto max-h-full">
      <h3 className="text-sm font-semibold text-gray-700">AI Feedback</h3>
      {myUtterances.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">
          Feedback will appear here after you speak.
        </p>
      )}
      {myUtterances.map((u) => {
        const fb = feedbackMap[u.id];
        return (
          <div key={u.id}>
            <p className="text-xs text-gray-500 mb-1 truncate">"{u.transcript}"</p>
            {fb ? <FeedbackCard feedback={fb} /> : (
              <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                <Spinner size="sm" /> Analyzing…
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
