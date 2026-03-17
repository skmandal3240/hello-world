import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth';
import { useNavigate } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/transactions', label: 'Transactions', icon: '💳' },
  { to: '/budgets', label: 'Budgets', icon: '🎯' },
  { to: '/accounts', label: 'Accounts', icon: '🏦' },
  { to: '/insights', label: 'AI Insights', icon: '🤖' },
  { to: '/reports', label: 'Reports', icon: '📈' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const rt = localStorage.getItem('refreshToken');
    if (rt) { try { await authApi.logout(rt); } catch {} }
    logout();
    navigate('/');
  };

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="px-4 py-5 border-b border-gray-100">
        <h1 className="text-xl font-bold text-brand-600">FinanceAI</h1>
        <p className="text-xs text-gray-400 mt-0.5">{user?.displayName}</p>
      </div>
      <nav className="flex-1 py-4 px-2">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`
          }>
            <span>{l.icon}</span>{l.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <button onClick={handleLogout} className="w-full text-left text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-50">
          Sign out
        </button>
      </div>
    </aside>
  );
}
