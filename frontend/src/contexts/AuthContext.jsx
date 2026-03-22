import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const LEVEL_CONFIG = [
  { min: 0, max: 99, label: 'Iniciante', next: 100 },
  { min: 100, max: 299, label: 'Explorador', next: 300 },
  { min: 300, max: 599, label: 'Guerreiro', next: 600 },
  { min: 600, max: Infinity, label: 'Mestre', next: null },
];

export const getLevelInfo = (xp) => {
  for (const tier of LEVEL_CONFIG) {
    if (xp >= tier.min && xp <= tier.max) {
      const progress = tier.next
        ? Math.round(((xp - tier.min) / (tier.next - tier.min)) * 100)
        : 100;
      return { ...tier, xp, progress };
    }
  }
  return { ...LEVEL_CONFIG[LEVEL_CONFIG.length - 1], xp, progress: 100 };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
    setUser(null);
  }, []);

  // Listen for 401 events from the API interceptor
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [logout]);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('taskflow_token');
    const cached = localStorage.getItem('taskflow_user');

    if (!token) {
      setLoading(false);
      return;
    }

    if (cached) {
      try {
        setUser(JSON.parse(cached));
      } catch {}
    }

    // Validate token against server
    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data);
        localStorage.setItem('taskflow_user', JSON.stringify(res.data));
      })
      .catch(() => {
        logout();
      })
      .finally(() => setLoading(false));
  }, [logout]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('taskflow_token', token);
    localStorage.setItem('taskflow_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('taskflow_token', token);
    localStorage.setItem('taskflow_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const updateUserXP = (xpGained, newBadges = []) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        xp: prev.xp + xpGained,
        badges: [...prev.badges, ...newBadges],
      };
      localStorage.setItem('taskflow_user', JSON.stringify(updated));
      return updated;
    });
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      localStorage.setItem('taskflow_user', JSON.stringify(res.data));
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUserXP, refreshUser, getLevelInfo }}
    >
      {children}
    </AuthContext.Provider>
  );
};
