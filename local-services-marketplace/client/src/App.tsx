import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import ProviderDetailPage from './pages/ProviderDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import ProviderDashboardPage from './pages/ProviderDashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/providers/:id" element={<ProviderDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard/customer" element={<CustomerDashboardPage />} />
            <Route path="/dashboard/provider" element={<ProviderDashboardPage />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
