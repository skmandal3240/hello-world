import { Utterance } from '../../types/session';

interface TranscriptPanelProps {
  utterances: Utterance[];
  currentUserId: string;
}

export default function TranscriptPanel({ utterances, currentUserId }: TranscriptPanelProps) {
  return (
    <div className="flex flex-col gap-3 overflow-y-auto max-h-96 pr-2">
      {utterances.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-8">
          Session started. Say something to begin!
        </p>
      )}
      {utterances.map((u, i) => {
        const isMe = u.speakerId === currentUserId;
        return (
          <div key={u.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm
                ${isMe
                  ? 'bg-brand-600 text-white rounded-tr-sm'
                  : 'bg-gray-100 text-gray-900 rounded-tl-sm'}`}
            >
              <p>{u.transcript}</p>
              <p className={`text-xs mt-1 ${isMe ? 'text-brand-100' : 'text-gray-400'}`}>
                {new Date(u.spokenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
