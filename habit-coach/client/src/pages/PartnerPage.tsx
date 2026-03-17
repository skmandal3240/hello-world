import React, { useState, useEffect, useCallback } from 'react';
import { partnerApi } from '../api/partner';
import { useSocket } from '../hooks/useSocket';
import { PartnerStatus, AnonymousHabit, PartnerMessage, HabitCategory } from '../types';
import { MessageThread } from '../components/partner/MessageThread';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Spinner } from '../components/ui/Spinner';
import { StreakBadge } from '../components/habits/StreakBadge';

const CATEGORIES: { value: HabitCategory; label: string }[] = [
  { value: 'HEALTH', label: 'Health' }, { value: 'FITNESS', label: 'Fitness' },
  { value: 'LEARNING', label: 'Learning' }, { value: 'PRODUCTIVITY', label: 'Productivity' },
  { value: 'MINDFULNESS', label: 'Mindfulness' }, { value: 'NUTRITION', label: 'Nutrition' },
  { value: 'SOCIAL', label: 'Social' }, { value: 'CREATIVITY', label: 'Creativity' },
  { value: 'FINANCE', label: 'Finance' }, { value: 'OTHER', label: 'Other' },
];

export function PartnerPage() {
  const [status, setStatus] = useState<PartnerStatus | null>(null);
  const [habits, setHabits] = useState<AnonymousHabit[]>([]);
  const [messages, setMessages] = useState<PartnerMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<HabitCategory>('FITNESS');
  const [optInLoading, setOptInLoading] = useState(false);

  const onNewMessage = useCallback((msg: unknown) => {
    setMessages((prev) => [...prev, msg as PartnerMessage]);
  }, []);

  const onPartnerMatched = useCallback(() => {
    partnerApi.status().then(({ data }) => setStatus(data));
  }, []);

  useSocket(onNewMessage, onPartnerMatched);

  const load = useCallback(async () => {
    try {
      const { data: s } = await partnerApi.status();
      setStatus(s);
      if (s.status === 'MATCHED') {
        const [{ data: h }, { data: m }] = await Promise.all([
          partnerApi.habits(),
          partnerApi.messages(),
        ]);
        setHabits(h);
        setMessages(m);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleOptIn = async () => {
    setOptInLoading(true);
    try {
      const { data } = await partnerApi.optIn(category);
      setStatus(data);
    } finally {
      setOptInLoading(false);
    }
  };

  const handleOptOut = async () => {
    await partnerApi.optOut();
    setStatus({ status: 'UNMATCHED' });
    setHabits([]);
    setMessages([]);
  };

  const handleSendMessage = async (content: string) => {
    const { data } = await partnerApi.sendMessage(content);
    setMessages((prev) => [...prev, data]);
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Accountability Partner</h1>
      <p className="text-gray-500 mb-6">Get matched with an anonymous partner who shares your habit goals.</p>

      {status?.status === 'UNMATCHED' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-md">
          <h2 className="font-semibold text-gray-900 mb-4">Find a Partner</h2>
          <p className="text-sm text-gray-500 mb-4">
            Choose a habit category to match with someone working on similar goals. Your identity stays anonymous.
          </p>
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as HabitCategory)}
            options={CATEGORIES}
            className="mb-4"
          />
          <Button onClick={handleOptIn} loading={optInLoading} className="w-full">Find Partner</Button>
        </div>
      )}

      {status?.status === 'PENDING' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-md text-center">
          <div className="animate-pulse text-3xl mb-3">🔍</div>
          <h2 className="font-semibold text-gray-900 mb-2">Looking for your partner...</h2>
          <p className="text-sm text-gray-500 mb-2">Category: {status.category}</p>
          <p className="text-sm text-gray-500 mb-4">Queue position #{status.queuePosition}</p>
          <Button variant="ghost" onClick={handleOptOut} size="sm">Cancel</Button>
        </div>
      )}

      {status?.status === 'MATCHED' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: status.partner?.avatarColor }}
              >
                ?
              </div>
              <div>
                <p className="font-semibold text-gray-900">Your Anonymous Partner</p>
                <p className="text-sm text-gray-500">Category: {status.category}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleOptOut}>Leave Partnership</Button>
          </div>

          {habits.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-3">Partner's Habits</h2>
              <div className="grid grid-cols-2 gap-3">
                {habits.map((h) => (
                  <div key={h.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="font-medium text-gray-900 text-sm">{h.anonymousName}</p>
                    <p className="text-xs text-gray-500 mb-2">{h.frequency}</p>
                    <StreakBadge streak={h.currentStreak} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="font-semibold text-gray-900 mb-3">Messages</h2>
            <MessageThread messages={messages} onSend={handleSendMessage} />
          </div>
        </div>
      )}
    </div>
  );
}
