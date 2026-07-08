import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { AdminUser, AuthSession } from '../../api/auth';
import { loginAdmin } from '../../api/auth';

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthSession>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * SECURITY & STORAGE STRATEGY CHOICE DOCUMENTATION:
   * To prevent unauthorized access and handle JWT tokens cleanly:
   * 1. JWT is stored in memory (`token` state) for fast, synchronous routing and API authorization checks.
   * 2. To persist session across reloads/reboots, we serialize session metadata to `localStorage` (secure storage strategy).
   * 3. On token expiration or a 401 Unauthorized API challenge, the centralized Axios response interceptor 
   *    (in src/api/client.ts) clears both the storage keys and local state, routing users back to `/login`.
   */
  useEffect(() => {
    const savedToken = localStorage.getItem('vantage_admin_jwt');
    const savedUser = localStorage.getItem('vantage_admin_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user credentials', e);
        // Clear corrupt storage
        localStorage.removeItem('vantage_admin_jwt');
        localStorage.removeItem('vantage_admin_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const session = await loginAdmin(password, email);
      setToken(session.token);
      setUser(session.user);
      
      localStorage.setItem('vantage_admin_jwt', session.token);
      localStorage.setItem('vantage_admin_user', JSON.stringify(session.user));
      
      return session;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('vantage_admin_jwt');
    localStorage.removeItem('vantage_admin_user');
    window.location.href = '/login';
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
