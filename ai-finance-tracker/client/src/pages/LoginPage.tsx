import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import ErrorBanner from '../components/ui/ErrorBanner';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await authApi.login(form.email, form.password);
      login(data.user, data.tokens.accessToken, data.tokens.refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-brand-600">FinanceAI</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>
        {error && <ErrorBanner message={error} />}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
          <Input label="Password" type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required />
          <Button type="submit" loading={loading} size="lg" className="w-full mt-2">Sign in</Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          No account? <Link to="/signup" className="text-brand-600 font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
