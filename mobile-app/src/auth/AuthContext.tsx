import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api/client';
import type { LoginResponse, UserRole } from '../types/auth';

type AuthState = {
  token: string | null;
  role: UserRole | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const TOKEN_KEY = 'pp_token';
const ROLE_KEY = 'pp_role';

const normalizeRole = (role?: string | null): UserRole | null => {
  if (!role) return null;
  if (role === 'PM') return 'PROPERTY_MANAGER';
  if (['TENANT', 'PROPERTY_MANAGER', 'OWNER', 'ADMIN'].includes(role)) return role as UserRole;
  return null;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [storedToken, storedRole] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(ROLE_KEY),
      ]);
      setToken(storedToken);
      setRole(normalizeRole(storedRole));
      setLoading(false);
    })();
  }, []);

  const login = async (username: string, password: string) => {
    const data = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    const nextToken = data.token ?? data.access_token;
    const nextRole = normalizeRole(data.user?.role);

    if (!nextToken) throw new Error('No token returned from login');

    await AsyncStorage.multiSet([
      [TOKEN_KEY, nextToken],
      [ROLE_KEY, nextRole ?? 'TENANT'],
    ]);

    setToken(nextToken);
    setRole(nextRole ?? 'TENANT');
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, ROLE_KEY]);
    setToken(null);
    setRole(null);
  };

  const value = useMemo(
    () => ({ token, role, loading, login, logout }),
    [token, role, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
