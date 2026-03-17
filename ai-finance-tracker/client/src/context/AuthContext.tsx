import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types/auth';
import { api } from '../api/axios';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback((user: User, accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { setLoading(false); return; }
    api.get<User>('/auth/me').then(({ data }) => setUser(data))
      .catch(() => { localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); })
      .finally(() => setLoading(false));
  }, []);

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
