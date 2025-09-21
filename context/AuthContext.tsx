import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { LoginPayload, SignupPayload, ProfilePayload } from '../services/api';
import Storage from '../utils/storage';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  // Optional profile fields from backend
  age?: number;
  date_of_birth?: string;
  gender?: string;
  phone_number?: string;
  aadhaar_number?: string;
};

export type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  hydrated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload, profile?: ProfilePayload) => Promise<void>;
  logout: () => void;
  devBypass?: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to normalize different backend auth response shapes
  const normalizeAuth = (resp: any): { token?: string; user?: AuthUser } => {
    if (!resp || typeof resp !== 'object') return {};
    const token = resp.token || resp.accessToken || resp.access_token || resp.jwt || resp.idToken;
    let user: any = resp.user || resp.profile || resp.data?.user || resp.data?.profile;
    if (!user && resp.name && resp.email) {
      user = { id: resp.id || resp.userId || 'unknown', name: resp.name, email: resp.email };
    }
    if (user) {
      user = {
        id: user.id || user._id || user.userId || user.user_id || 'unknown',
        name: user.name || user.fullName || user.username || 'User',
        email: user.email || user.mail || '',
      } as AuthUser;
    }
    return { token, user };
  };

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
        console.log('[AUTH] Hydrating from storage:', { storedToken: !!storedToken, storedUser: !!storedUser });
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
        console.log('[AUTH] Hydration complete');
      }
    })();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);

    try {
      console.log('[AUTH] Starting login process');

      if (!payload?.email || !payload?.password) {
        throw new Error('Email and password are required');
      }

      const resp = await api.login(payload);
      console.log('[AUTH] Login API response received:', typeof resp);

      if (!resp) {
        throw new Error('No response from login API');
      }

      const { token: nToken, user: nUser } = normalizeAuth(resp);
      console.log('[AUTH] Normalized auth data:', { hasToken: !!nToken, hasUser: !!nUser });

      if (!nToken) {
        throw new Error('Invalid login response from server (no token)');
      }

      // Set token immediately for UI responsiveness
      console.log('[AUTH] Setting token in state');
      setToken(nToken);

      // Set at least a minimal user so UI can render
      const baseUser = nUser || ({ id: 'unknown', name: 'User', email: '' } as AuthUser);
      console.log('[AUTH] Setting base user in state:', baseUser);
      setUser(baseUser);

      // Persist to storage
      if (Storage.isAvailable()) {
        try {
          await Promise.all([
            Storage.setItem('auth_token', nToken),
            Storage.setItem('auth_user', JSON.stringify(baseUser)),
          ]);
          console.log('[AUTH] Login data persisted to storage');
        } catch (storageError) {
          console.warn('[AUTH] Login storage failed:', storageError);
          // Continue anyway - login was successful
        }
      }

      // Fetch full profile if available
      try {
        console.log('[AUTH] Fetching profile data');
        const prof = await api.getProfile(nToken);
        console.log('[AUTH] Profile API response:', typeof prof);

        if (prof && (prof.name || prof.email || prof.user_id)) {
          const merged: AuthUser = {
            id: (prof.user_id || prof.id || baseUser.id) as string,
            name: (prof.name || baseUser.name) as string,
            email: (prof.email || baseUser.email) as string,
            age: prof.age ?? baseUser.age,
            date_of_birth: prof.date_of_birth ?? baseUser.date_of_birth,
            gender: prof.gender ?? baseUser.gender,
            phone_number: prof.phone_number ?? baseUser.phone_number,
            aadhaar_number: prof.aadhaar_number ?? baseUser.aadhaar_number,
          };
          console.log('[AUTH] Merged user data:', merged);
          setUser(merged);

          if (Storage.isAvailable()) {
            try {
              await Storage.setItem('auth_user', JSON.stringify(merged));
              console.log('[AUTH] Updated user persisted to storage');
            } catch (updateError) {
              console.warn('[AUTH] User update storage failed:', updateError);
            }
          }
        }
      } catch (profileError) {
        console.warn('[AUTH] Profile fetch failed, using base user:', profileError);
        // Continue with base user - login was still successful
      }

      console.log('[AUTH] Login process completed successfully');
    } catch (e: any) {
      const errorMsg = e?.message || 'Login failed';
      console.error('[AUTH] Login error:', errorMsg, e);

      // Reset state on error
      setToken(null);
      setUser(null);
      setError(errorMsg);

      throw new Error(errorMsg);
    } finally {
      setLoading(false);
      console.log('[AUTH] Login process finished, loading set to false');
    }
  }, []);

  const signup = useCallback(async (payload: SignupPayload, profile?: ProfilePayload) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.signup(payload);
      const { token: nToken, user: nUser } = normalizeAuth(resp);
      if (!nToken || !nUser) {
        throw new Error('Invalid signup response from server');
      }
      setToken(nToken);
      setUser(nUser);
      // persist
      if (Storage.isAvailable()) {
        await Promise.all([
          Storage.setItem('auth_token', nToken),
          Storage.setItem('auth_user', JSON.stringify(nUser)),
        ]);
      }
      // If profile payload is provided, update profile on backend
      if (profile && nToken) {
        try {
          await api.updateProfile(profile, nToken);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('Profile update failed:', (e as any)?.message);
        }
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
    ? async () => {
        try {
          console.log('[AUTH] Dev bypass triggered');
          const testToken = 'dev-token-' + Date.now();
          const testUser = {
            id: 'dev-user',
            name: 'Dev User',
            email: 'dev@example.com',
            age: 25,
            date_of_birth: '1999-01-01',
            gender: 'Other',
            phone_number: '1234567890',
            aadhaar_number: '123456789012'
          };

          console.log('[AUTH] Dev bypass - setting state and persisting');

          // Set token and user state first (immediate UI update)
          setToken(testToken);
          setUser(testUser);

          // Persist to storage asynchronously (don't block UI)
          if (Storage.isAvailable()) {
            try {
              await Promise.all([
                Storage.setItem('auth_token', testToken),
                Storage.setItem('auth_user', JSON.stringify(testUser)),
              ]);
              console.log('[AUTH] Dev bypass data persisted to storage');
            } catch (storageError) {
              console.warn('[AUTH] Dev bypass storage failed:', storageError);
              // Continue anyway - dev bypass should still work
            }
          }

          // Small delay to ensure state propagation
          await new Promise<void>((resolve) => setTimeout(resolve, 50));

          console.log('[AUTH] Dev bypass completed successfully');
          return { success: true, token: testToken };
        } catch (error) {
          console.error('[AUTH] Dev bypass failed:', error);
          // Reset state if dev bypass fails
          setToken(null);
          setUser(null);
          throw new Error(`Dev bypass failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
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
