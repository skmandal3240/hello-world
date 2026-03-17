import React, { useState, useEffect } from 'react';
import { aiApi } from '../../api/ai';
import { Spinner } from '../ui/Spinner';

export function NudgeCard() {
  const [nudge, setNudge] = useState<{ title: string; body: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aiApi.nudge()
      .then(({ data }) => setNudge(data))
      .catch(() => setNudge({ title: 'Keep Going!', body: 'Every habit you build makes tomorrow easier.' }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5 flex justify-center">
      <Spinner size="sm" />
    </div>
  );

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🤖</span>
        <h3 className="font-semibold text-indigo-800">{nudge?.title}</h3>
      </div>
      <p className="text-indigo-700 text-sm leading-relaxed">{nudge?.body}</p>
    </div>
  );
}
