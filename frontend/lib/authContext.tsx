'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';
import { api } from './api';
import { guestStorage } from './guestStorage';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auto-sync guest items from localStorage to backend upon login
  const syncGuestDataToBackend = async () => {
    try {
      const guestWatchlist = guestStorage.getWatchlist();
      if (guestWatchlist.length > 0) {
        await api.syncWatchlist(guestWatchlist);
      }

      const guestHistory = guestStorage.getHistory();
      if (guestHistory.length > 0) {
        await api.syncHistory(guestHistory);
      }
      console.log('Guest items successfully synced with user account.');
    } catch (e) {
      console.warn('Failed to sync guest data:', e);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('cinevo_auth_token');
      if (savedToken) {
        setToken(savedToken);
        try {
          const profile = await api.getProfile();
          setUser(profile);
        } catch {
          // Token expired or invalid
          localStorage.removeItem('cinevo_auth_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.login({ email, password });
    localStorage.setItem('cinevo_auth_token', data.token);
    setToken(data.token);
    setUser(data.user);
    await syncGuestDataToBackend();
  };

  const register = async (email: string, password: string, name?: string) => {
    const data = await api.register({ email, password, name });
    localStorage.setItem('cinevo_auth_token', data.token);
    setToken(data.token);
    setUser(data.user);
    await syncGuestDataToBackend();
  };

  const logout = () => {
    localStorage.removeItem('cinevo_auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
