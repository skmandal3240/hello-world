import { api } from './axios';

export const aiApi = {
  nudge: () => api.get<{ title: string; body: string }>('/ai/nudge'),
  weeklySummary: () => api.get<{ title: string; body: string }>('/ai/weekly-summary'),
  chat: (message: string) => api.post('/ai/chat', { message }),
};

export function streamChat(message: string, onToken: (text: string) => void, onDone: () => void) {
  const token = localStorage.getItem('accessToken');
  const eventSource = new EventSource(`/api/ai/chat-stream?token=${token}`);

  // Use fetch for POST with streaming
  const controller = new AbortController();

  fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({ message }),
    signal: controller.signal,
  }).then(async (res) => {
    eventSource.close();
    const reader = res.body?.getReader();
    if (!reader) { onDone(); return; }
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') { onDone(); return; }
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) onToken(parsed.text);
          } catch { /* skip */ }
        }
      }
    }
    onDone();
  }).catch(() => onDone());

  return () => controller.abort();
}
