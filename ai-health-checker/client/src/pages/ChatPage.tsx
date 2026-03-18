import { useState, useEffect, useRef, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { SymptomSession } from '../types';
import MessageBubble from '../components/MessageBubble';
import TriageBadge from '../components/TriageBadge';

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SymptomSession | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!id) return;
    api.get<SymptomSession>(`/sessions/${id}`)
      .then((res) => setSession(res.data))
      .catch(() => setError('Session not found'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending || session?.status === 'COMPLETED') return;

    const content = input.trim();
    setInput('');
    setSending(true);
    setError(null);

    // Optimistic update — add user message immediately
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      sessionId: id!,
      role: 'USER' as const,
      content,
      createdAt: new Date().toISOString(),
    };
    setSession((prev) =>
      prev ? { ...prev, messages: [...(prev.messages ?? []), tempUserMsg] } : prev
    );

    try {
      const { data } = await api.post<{ userMessage: typeof tempUserMsg; assistantMessage: typeof tempUserMsg; session: SymptomSession }>
        (`/sessions/${id}/messages`, { content });
      // Replace optimistic msg with real data
      setSession((prev) =>
        prev ? {
          ...data.session,
          messages: [...(prev.messages ?? []).filter((m) => m.id !== tempUserMsg.id),
            data.userMessage,
            data.assistantMessage,
          ],
        } : prev
      );
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send message');
      // Rollback optimistic update
      setSession((prev) =>
        prev ? { ...prev, messages: (prev.messages ?? []).filter((m) => m.id !== tempUserMsg.id) } : prev
      );
      setInput(content);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const generateSummary = async () => {
    setSummaryLoading(true);
    try {
      const { data } = await api.post<{ doctorSummary: string }>(`/sessions/${id}/summary`);
      setSession((prev) => prev ? { ...prev, doctorSummary: data.doctorSummary } : prev);
      setShowSummary(true);
    } catch {
      setError('Failed to generate summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const completeSession = async () => {
    setCompleting(true);
    try {
      const { data } = await api.post<SymptomSession>(`/sessions/${id}/complete`);
      setSession((prev) => prev ? { ...prev, status: data.status } : prev);
    } catch {
      setError('Failed to complete session');
    } finally {
      setCompleting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e as unknown as FormEvent);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-[calc(100vh-4rem)] text-gray-400">Loading...</div>;
  if (!session) return <div className="text-center py-20 text-gray-500">{error || 'Session not found'}</div>;

  const isCompleted = session.status === 'COMPLETED';
  const messages = session.messages ?? [];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/sessions" className="text-gray-400 hover:text-gray-600 shrink-0">←</Link>
          <div className="min-w-0">
            <h1 className="font-semibold text-gray-900 truncate text-sm">{session.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <TriageBadge level={session.triageLevel} size="sm" />
              {isCompleted && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Completed</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {messages.length >= 4 && (
            <button
              onClick={session.doctorSummary ? () => setShowSummary(!showSummary) : generateSummary}
              disabled={summaryLoading}
              className="text-xs px-3 py-1.5 border border-sky-200 text-sky-600 rounded-lg hover:bg-sky-50 transition-colors disabled:opacity-50"
            >
              {summaryLoading ? 'Generating...' : session.doctorSummary ? (showSummary ? 'Hide Summary' : 'View Summary') : '📋 Doctor Summary'}
            </button>
          )}
          {!isCompleted && messages.length >= 2 && (
            <button
              onClick={completeSession}
              disabled={completing}
              className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {completing ? 'Saving...' : 'Mark Complete'}
            </button>
          )}
        </div>
      </div>

      {/* Doctor Summary Panel */}
      {showSummary && session.doctorSummary && (
        <div className="bg-sky-50 border-b border-sky-100 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-sky-800">📋 Doctor Appointment Summary</h3>
            <button onClick={() => setShowSummary(false)} className="text-sky-400 hover:text-sky-600 text-xs">✕</button>
          </div>
          <div className="text-xs text-gray-700 whitespace-pre-wrap bg-white border border-sky-200 rounded-lg p-4 max-h-48 overflow-y-auto">
            {session.doctorSummary}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-b border-red-100 px-4 py-2 text-red-600 text-sm shrink-0">{error}</div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-8">Starting your consultation...</div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} role={msg.role} content={msg.content} createdAt={msg.createdAt} />
        ))}
        {sending && (
          <div className="flex justify-start mb-4">
            <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sm mr-2">🩺</div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-5">
                <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 shrink-0">
        {isCompleted ? (
          <div className="text-center text-sm text-gray-400 py-2">
            This consultation is complete.{' '}
            <button
              onClick={async () => {
                const { data } = await api.post('/sessions');
                navigate(`/sessions/${data.id}`);
              }}
              className="text-sky-600 hover:underline"
            >
              Start a new one
            </button>
          </div>
        ) : (
          <form onSubmit={sendMessage} className="flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your symptoms... (Enter to send, Shift+Enter for new line)"
              rows={2}
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="bg-sky-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-sky-700 transition-colors disabled:opacity-50 h-[42px]"
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
