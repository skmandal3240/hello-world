import { useEffect, useState, useRef } from 'react';
import { insightsApi } from '../api/insights';
import { AiInsight, ChatMessage } from '../types/insight';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorBanner from '../components/ui/ErrorBanner';

const INSIGHT_ICONS: Record<string, string> = {
  WEEKLY_SUMMARY: '📊',
  SAVINGS_TIP: '💡',
  ANOMALY: '⚠️',
  FORECAST: '🔮',
};

export default function InsightsPage() {
  const now = new Date();
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const loadInsights = () => {
    setLoading(true);
    insightsApi.list().then(({ data }) => setInsights(data)).finally(() => setLoading(false));
  };

  const loadForecast = () => {
    insightsApi.forecast().then(({ data }) => setForecast(data)).catch(() => {});
  };

  useEffect(() => { loadInsights(); loadForecast(); }, []);

  const handleGenerate = async () => {
    setGenerating(true); setError('');
    try {
      await insightsApi.generate(now.getMonth() + 1, now.getFullYear());
      loadInsights();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate insights');
    } finally { setGenerating(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
        <Button size="sm" onClick={handleGenerate} loading={generating}>
          ✨ Generate this month's insights
        </Button>
      </div>

      {error && <ErrorBanner message={error} />}

      {/* Forecast card */}
      {forecast && (
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 text-white rounded-2xl p-5">
          <p className="text-brand-100 text-sm font-medium mb-3">🔮 Balance Forecast</p>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: '30 days', value: forecast.day30 },
              { label: '60 days', value: forecast.day60 },
              { label: '90 days', value: forecast.day90 },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-brand-200 text-xs">{label}</p>
                <p className={`text-xl font-bold mt-1 ${value < 0 ? 'text-red-300' : 'text-white'}`}>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
                </p>
              </div>
            ))}
          </div>
          {forecast.riskLevel && (
            <span className={`inline-block text-xs rounded-full px-2 py-0.5 font-medium ${
              forecast.riskLevel === 'HIGH' ? 'bg-red-500' :
              forecast.riskLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-green-500'
            }`}>
              {forecast.riskLevel} RISK
            </span>
          )}
          {forecast.recommendations?.length > 0 && (
            <ul className="mt-3 space-y-1">
              {forecast.recommendations.map((r: string, i: number) => (
                <li key={i} className="text-brand-100 text-sm">• {r}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insights list */}
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-700">Recent Analysis</h2>
          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : insights.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-gray-400 text-sm">No insights yet. Generate your first analysis above.</p>
            </div>
          ) : (
            insights.map(insight => (
              <div key={insight.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{INSIGHT_ICONS[insight.type] || '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{insight.title}</p>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{insight.body}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(insight.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Chat interface */}
        <div>
          <h2 className="font-semibold text-gray-700 mb-3">Ask your finances</h2>
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}

function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'assistant', content: 'Hi! I\'m your AI finance assistant. Ask me anything about your spending, budgets, or financial goals.', createdAt: new Date().toISOString() },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput(''); setError('');

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text, createdAt: new Date().toISOString() };
    setMessages(m => [...m, userMsg]);
    setSending(true);

    try {
      const { data } = await insightsApi.chat(text);
      const assistantMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.reply, createdAt: new Date().toISOString() };
      setMessages(m => [...m, assistantMsg]);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send message');
    } finally { setSending(false); }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 flex flex-col h-[520px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
              msg.role === 'user'
                ? 'bg-brand-600 text-white rounded-tr-sm'
                : 'bg-gray-100 text-gray-800 rounded-tl-sm'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && <div className="px-4 pb-2"><p className="text-xs text-red-500">{error}</p></div>}

      {/* Input */}
      <div className="p-3 border-t border-gray-100 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="How much did I spend on food this month?"
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          disabled={sending}
        />
        <Button size="sm" onClick={handleSend} disabled={!input.trim() || sending}>Send</Button>
      </div>
    </div>
  );
}
