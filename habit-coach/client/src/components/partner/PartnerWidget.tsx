import React, { useState, useEffect } from 'react';
import { partnerApi } from '../../api/partner';
import { PartnerStatus } from '../../types';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

export function PartnerWidget() {
  const [status, setStatus] = useState<PartnerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    partnerApi.status()
      .then(({ data }) => setStatus(data))
      .finally(() => setLoading(false));
  }, []);

  const sendEncouragement = async () => {
    try {
      await partnerApi.sendMessage('Keep up the great work! 🎉');
      showToast('Encouragement sent!');
    } catch {
      showToast('Failed to send', 'error');
    }
  };

  if (loading) return null;

  if (!status || status.status === 'UNMATCHED') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-2">Accountability Partner</h3>
        <p className="text-sm text-gray-500 mb-3">Get paired with an anonymous partner to stay accountable.</p>
        <a href="/partner" className="text-sm text-indigo-600 hover:underline">Find a partner →</a>
      </div>
    );
  }

  if (status.status === 'PENDING') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-2">Finding Your Partner...</h3>
        <p className="text-sm text-gray-500">Queue position #{status.queuePosition}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-3">Your Partner</h3>
      <div className="flex items-center gap-3 mb-3">
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: status.partner?.avatarColor }}
        >
          ?
        </div>
        <div>
          <p className="text-sm font-medium">Anonymous Partner</p>
          <p className="text-xs text-gray-500">🔥 {status.partner?.topStreak} day streak</p>
        </div>
      </div>
      <Button size="sm" variant="secondary" onClick={sendEncouragement} className="w-full">
        Send Encouragement 👏
      </Button>
    </div>
  );
}
