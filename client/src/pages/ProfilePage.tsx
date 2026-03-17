import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  const statItems = [
    { label: 'Total Sessions', value: user.totalSessions },
    { label: 'Current Streak', value: `${user.currentStreak} days` },
    { label: 'Longest Streak', value: `${user.longestStreak} days` },
    {
      label: 'Last Session',
      value: user.lastSessionDate
        ? new Date(user.lastSessionDate).toLocaleDateString()
        : 'Never',
    },
  ];

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-2xl font-bold text-brand-600">
            {user.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user.displayName}</h2>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {user.nativeLanguage && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Native language</p>
              <p className="font-medium text-gray-800">
                {user.nativeLanguage.flagEmoji} {user.nativeLanguage.name}
              </p>
            </div>
          )}
          {user.learningLanguage && (
            <div className="bg-brand-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Learning</p>
              <p className="font-medium text-gray-800">
                {user.learningLanguage.flagEmoji} {user.learningLanguage.name}
                <span className="ml-1 text-xs font-normal text-brand-600">({user.proficiencyLevel})</span>
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {statItems.map((stat) => (
            <div key={stat.label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
              <p className="font-semibold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <Link to="/onboarding">
        <Button variant="secondary" className="w-full">Update language preferences</Button>
      </Link>
    </div>
  );
}
