import { FeedbackEntry } from '../../types/session';
import Badge from '../ui/Badge';

export default function FeedbackCard({ feedback }: { feedback: FeedbackEntry }) {
  const severityColor = (s: string) =>
    s === 'major' ? 'red' : s === 'moderate' ? 'yellow' : 'blue';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 text-sm">
      {feedback.pronunciationScore !== null && (
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full border-4 border-brand-500 flex items-center justify-center text-xs font-bold text-brand-600">
            {feedback.pronunciationScore}
          </div>
          <span className="text-xs text-gray-500">Pronunciation score</span>
        </div>
      )}

      {feedback.correctedText && (
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Corrected</p>
          <p className="text-gray-800 bg-green-50 rounded-lg px-3 py-2">{feedback.correctedText}</p>
        </div>
      )}

      {feedback.grammarErrors.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Grammar</p>
          <div className="space-y-2">
            {feedback.grammarErrors.map((e, i) => (
              <div key={i} className="flex items-start gap-2">
                <Badge color={severityColor(e.severity)}>{e.severity}</Badge>
                <div>
                  <span className="line-through text-red-500">{e.original}</span>
                  <span className="mx-1 text-gray-400">→</span>
                  <span className="text-green-600 font-medium">{e.corrected}</span>
                  <p className="text-xs text-gray-500 mt-0.5">{e.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {feedback.vocabularySuggestions.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Vocabulary</p>
          <div className="space-y-1">
            {feedback.vocabularySuggestions.map((v, i) => (
              <p key={i} className="text-xs text-gray-600">
                <span className="font-medium">{v.word}</span> → <span className="text-brand-600">{v.alternative}</span>
                {v.reason && <span className="text-gray-400"> — {v.reason}</span>}
              </p>
            ))}
          </div>
        </div>
      )}

      {feedback.overallFeedback && (
        <p className="text-xs text-gray-600 italic border-t border-gray-100 pt-3">
          {feedback.overallFeedback}
        </p>
      )}
    </div>
  );
}
