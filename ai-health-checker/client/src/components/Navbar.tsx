import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <nav className="bg-white border-b border-sky-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-sky-600">
          🩺 HealthCheck AI
        </Link>
        <div className="flex items-center gap-5 text-sm font-medium text-gray-600">
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-sky-600 transition-colors">Dashboard</Link>
              <Link to="/sessions" className="hover:text-sky-600 transition-colors">Consultations</Link>
              <Link to="/notifications" className="hover:text-sky-600 transition-colors">Alerts</Link>
              <span className="text-gray-300">|</span>
              <span className="text-gray-700 text-xs">{user.displayName}</span>
              <button onClick={handleLogout} className="text-red-400 hover:text-red-600 transition-colors text-xs">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-sky-600 transition-colors">Login</Link>
              <Link to="/signup" className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
