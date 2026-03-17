import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth';
import Button from '../ui/Button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try { await authApi.logout(refreshToken); } catch { /* ignore */ }
    }
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="text-xl font-bold text-brand-600">
          LangExchange
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</Link>
          <Link to="/match" className="text-sm text-gray-600 hover:text-gray-900">Find Partner</Link>
          <Link to="/history" className="text-sm text-gray-600 hover:text-gray-900">History</Link>
          <Link to="/profile" className="text-sm text-gray-600 hover:text-gray-900">
            {user?.displayName}
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>Sign out</Button>
        </nav>
      </div>
    </header>
  );
}
