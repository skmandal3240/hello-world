import { useState } from 'react';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import ErrorBanner from '../components/ui/ErrorBanner';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'INR'];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({
    displayName: user?.displayName || '',
    currency: user?.currency || 'USD',
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pwError, setPwError] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setMessage('');
    setSaving(true);
    try {
      await authApi.updateProfile(form);
      setMessage('Profile updated successfully.');
    } catch (err: any) { setError(err.response?.data?.error || 'Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setPwError('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPwError('New passwords do not match.'); return;
    }
    setSavingPw(true);
    try {
      await authApi.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('Password changed successfully.');
    } catch (err: any) { setPwError(err.response?.data?.error || 'Failed to change password'); }
    finally { setSavingPw(false); }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm">{message}</div>
      )}

      {/* Profile info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Account details</h2>
        {error && <div className="mb-4"><ErrorBanner message={error} /></div>}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">{user?.email}</p>
          </div>
          <Input
            label="Display name"
            value={form.displayName}
            onChange={e => setForm(f => ({...f, displayName: e.target.value}))}
            required
          />
          <Select
            label="Default currency"
            value={form.currency}
            onChange={e => setForm(f => ({...f, currency: e.target.value}))}
          >
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Button type="submit" loading={saving}>Save changes</Button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Change password</h2>
        {pwError && <div className="mb-4"><ErrorBanner message={pwError} /></div>}
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input label="Current password" type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm(f => ({...f, currentPassword: e.target.value}))} required />
          <Input label="New password" type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm(f => ({...f, newPassword: e.target.value}))} required minLength={8} />
          <Input label="Confirm new password" type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(f => ({...f, confirmPassword: e.target.value}))} required />
          <Button type="submit" variant="secondary" loading={savingPw}>Change password</Button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-red-200 p-5">
        <h2 className="font-semibold text-red-700 mb-2">Sign out</h2>
        <p className="text-sm text-gray-500 mb-4">You'll need to sign back in to access your account.</p>
        <Button variant="secondary" onClick={logout} className="border-red-300 text-red-700 hover:bg-red-50">Sign out</Button>
      </div>
    </div>
  );
}
