import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { HabitCategory } from '../types';

const CATEGORIES: { value: HabitCategory; label: string }[] = [
  { value: 'HEALTH', label: 'Health' }, { value: 'FITNESS', label: 'Fitness' },
  { value: 'LEARNING', label: 'Learning' }, { value: 'PRODUCTIVITY', label: 'Productivity' },
  { value: 'MINDFULNESS', label: 'Mindfulness' }, { value: 'NUTRITION', label: 'Nutrition' },
  { value: 'SOCIAL', label: 'Social' }, { value: 'CREATIVITY', label: 'Creativity' },
  { value: 'FINANCE', label: 'Finance' }, { value: 'OTHER', label: 'Other' },
];

const AVATAR_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

export function ProfilePage() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    displayName: user?.displayName ?? '',
    bio: user?.bio ?? '',
    timezone: user?.timezone ?? 'UTC',
    avatarColor: user?.avatarColor ?? '#6366f1',
    matchingEnabled: user?.matchingEnabled ?? false,
    preferredCategory: user?.preferredCategory ?? 'FITNESS' as HabitCategory,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.updateMe(form);
      setUser(data);
      showToast('Profile updated!');
    } catch {
      showToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl border border-gray-200 p-6">
        {/* Avatar */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Avatar Color</p>
          <div className="flex gap-2">
            {AVATAR_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setForm((f) => ({ ...f, avatarColor: color }))}
                className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${form.avatarColor === color ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="mt-3 h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: form.avatarColor }}>
            {form.displayName.charAt(0).toUpperCase()}
          </div>
        </div>

        <Input
          label="Display Name"
          value={form.displayName}
          onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
        />

        <div>
          <label className="text-sm font-medium text-gray-700">Bio</label>
          <textarea
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            placeholder="Tell your partner a bit about your goals..."
          />
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-medium text-gray-900 mb-3">Accountability Partner Settings</h3>
          <label className="flex items-center gap-3 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={form.matchingEnabled}
              onChange={(e) => setForm((f) => ({ ...f, matchingEnabled: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Enable partner matching</span>
          </label>
          {form.matchingEnabled && (
            <Select
              label="Preferred Category"
              value={form.preferredCategory}
              onChange={(e) => setForm((f) => ({ ...f, preferredCategory: e.target.value as HabitCategory }))}
              options={CATEGORIES}
            />
          )}
        </div>

        <Button type="submit" loading={loading} className="w-full">Save Changes</Button>
      </form>
    </div>
  );
}
