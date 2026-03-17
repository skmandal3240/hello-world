import React, { useState, useRef, useEffect } from 'react';
import { PartnerMessage } from '../../types';
import { Button } from '../ui/Button';

interface MessageThreadProps {
  messages: PartnerMessage[];
  onSend: (content: string) => Promise<void>;
}

export function MessageThread({ messages, onSend }: MessageThreadProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      await onSend(text);
      setText('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-96 bg-white rounded-xl border border-gray-200">
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No messages yet. Say hello!</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.isFromMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${
              m.isFromMe ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="border-t border-gray-200 p-3 flex gap-2">
        <input
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Send encouragement..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
        />
        <Button type="submit" size="sm" loading={loading}>Send</Button>
      </form>
    </div>
  );
}
