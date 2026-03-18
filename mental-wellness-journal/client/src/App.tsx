import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import JournalPage from './pages/JournalPage';
import NewEntryPage from './pages/NewEntryPage';
import EntryDetailPage from './pages/EntryDetailPage';
import MoodTrackerPage from './pages/MoodTrackerPage';
import ExercisesPage from './pages/ExercisesPage';
import ExerciseDetailPage from './pages/ExerciseDetailPage';
import NotificationsPage from './pages/NotificationsPage';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-rose-500 text-lg">Loading...</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/journal" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
      <Route path="/journal/new" element={<ProtectedRoute><NewEntryPage /></ProtectedRoute>} />
      <Route path="/journal/:id" element={<ProtectedRoute><EntryDetailPage /></ProtectedRoute>} />
      <Route path="/mood" element={<ProtectedRoute><MoodTrackerPage /></ProtectedRoute>} />
      <Route path="/exercises" element={<ProtectedRoute><ExercisesPage /></ProtectedRoute>} />
      <Route path="/exercises/:id" element={<ProtectedRoute><ExerciseDetailPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
