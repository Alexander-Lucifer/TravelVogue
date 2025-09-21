import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { AuthResponse, LoginPayload, SignupPayload } from '../services/api';
import Storage from '../utils/storage';

export type AuthUser = AuthResponse['user'];

export type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  hydrated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
  devBypass?: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from storage on first mount
  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          Storage.getItem('auth_token'),
          Storage.getItem('auth_user'),
        ]);
        if (storedToken) setToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            // ignore parse error
          }
        }
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.login(payload);
      if (!resp?.token || !resp?.user) {
        throw new Error('Invalid login response from server');
      }
      setToken(resp.token);
      setUser(resp.user);
      // persist
      if (Storage.isAvailable()) {
        await Promise.all([
          Storage.setItem('auth_token', resp.token),
          Storage.setItem('auth_user', JSON.stringify(resp.user)),
        ]);
      }
    } catch (e: any) {
      setError(e?.message || 'Login failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (payload: SignupPayload) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.signup(payload);
      if (!resp?.token || !resp?.user) {
        throw new Error('Invalid signup response from server');
      }
      setToken(resp.token);
      setUser(resp.user);
      // persist
      if (Storage.isAvailable()) {
        await Promise.all([
          Storage.setItem('auth_token', resp.token),
          Storage.setItem('auth_user', JSON.stringify(resp.user)),
        ]);
      }
    } catch (e: any) {
      setError(e?.message || 'Signup failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    if (Storage.isAvailable()) {
      Storage.removeItem('auth_token');
      Storage.removeItem('auth_user');
    }
  }, []);

  const devBypass = __DEV__
    ? () => {
        setToken('dev-token');
        setUser({ id: 'dev', name: 'Dev User', email: 'dev@example.com' });
      }
    : undefined;

  const value = useMemo(
    () => ({ token, user, loading, error, hydrated, login, signup, logout, devBypass }),
    [token, user, loading, error, hydrated, login, signup, logout, devBypass]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
