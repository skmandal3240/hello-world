import { MessageRole } from '../types';

interface Props {
  role: MessageRole;
  content: string;
  createdAt: string;
}

export default function MessageBubble({ role, content, createdAt }: Props) {
  const isUser = role === 'USER';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sm mr-2 shrink-0 mt-1">
          🩺
        </div>
      )}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-sky-600 text-white rounded-br-sm'
              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
          }`}
        >
          {content}
        </div>
        <span className="text-xs text-gray-400 mt-1 px-1">
          {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-white text-xs font-bold ml-2 shrink-0 mt-1">
          You
        </div>
      )}
    </div>
  );
}
