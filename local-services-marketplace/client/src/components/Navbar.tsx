import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isProvider } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
          🏠 LocalPro
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link to="/browse" className="hover:text-blue-600 transition-colors">Browse</Link>
          {user ? (
            <>
              {isProvider ? (
                <Link to="/dashboard/provider" className="hover:text-blue-600 transition-colors">Provider Dashboard</Link>
              ) : (
                <Link to="/dashboard/customer" className="hover:text-blue-600 transition-colors">My Bookings</Link>
              )}
              <span className="text-gray-400">|</span>
              <span className="text-gray-700">{user.name}</span>
              <button onClick={handleLogout} className="text-red-500 hover:text-red-700 transition-colors">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-600 transition-colors">Login</Link>
              <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
