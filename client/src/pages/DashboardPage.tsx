import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;

  const statItems = [
    { label: 'Sessions', value: user.totalSessions, icon: '🗣️' },
    { label: 'Day streak', value: user.currentStreak, icon: '🔥' },
    { label: 'Best streak', value: user.longestStreak, icon: '🏆' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.displayName}! 👋
        </h1>
        {user.learningLanguage && (
          <p className="text-gray-500 mt-1">
            Keep up your {user.learningLanguage.flagEmoji} {user.learningLanguage.name} practice.
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {statItems.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
            <div className="text-3xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-semibold mb-2">Ready to practice?</h2>
        <p className="text-brand-100 text-sm mb-5">
          Get matched with a native speaker and practice {user.learningLanguage?.name} now.
        </p>
        <Link to="/match">
          <Button className="bg-white text-brand-700 hover:bg-brand-50 focus:ring-white">
            Find a partner
          </Button>
        </Link>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent sessions</h2>
          <Link to="/history" className="text-sm text-brand-600 hover:underline">View all</Link>
        </div>
        {user.totalSessions === 0 && (
          <div className="text-center py-10 text-gray-400">
            <div className="text-4xl mb-3">📖</div>
            <p className="text-sm">No sessions yet. Start your first conversation!</p>
          </div>
        )}
      </div>
    </div>
  );
}
