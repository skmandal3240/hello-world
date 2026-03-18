import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { DietaryPreference } from '../types';

const ALL_PREFS: DietaryPreference[] = ['NONE', 'VEGETARIAN', 'VEGAN', 'GLUTEN_FREE', 'DAIRY_FREE', 'KETO', 'PALEO', 'LOW_CARB', 'HALAL', 'KOSHER'];

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [servings, setServings] = useState(String(user?.servings ?? 2));
  const [weeklyBudget, setWeeklyBudget] = useState(String(user?.weeklyBudget ?? ''));
  const [prefs, setPrefs] = useState<DietaryPreference[]>(user?.dietaryPreferences ?? []);
  const [loading, setLoading] = useState(false);

  const togglePref = (pref: DietaryPreference) => {
    setPrefs((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: updatedUser } = await authApi.updateMe({
        displayName: displayName.trim(),
        servings: parseInt(servings) || 2,
        weeklyBudget: weeklyBudget ? parseFloat(weeklyBudget) : undefined,
        dietaryPreferences: prefs,
      });
      setUser(updatedUser);
      showToast('Profile updated!');
    } catch {
      showToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile</h2>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="h-16 w-16 rounded-full bg-emerald-600 flex items-center justify-center text-white text-2xl font-bold">
            {user?.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user?.displayName}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Household Size</label>
              <Input type="number" min="1" max="20" value={servings} onChange={(e) => setServings(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Budget ($)</label>
              <Input type="number" min="0" step="0.01" placeholder="Optional" value={weeklyBudget} onChange={(e) => setWeeklyBudget(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preferences</label>
            <div className="flex flex-wrap gap-2">
              {ALL_PREFS.map((pref) => (
                <button
                  key={pref}
                  type="button"
                  onClick={() => togglePref(pref)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    prefs.includes(pref)
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400'
                  }`}
                >
                  {pref.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full">Save Changes</Button>
        </form>
      </div>
    </div>
  );
}
