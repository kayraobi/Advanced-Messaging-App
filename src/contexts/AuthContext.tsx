import React, { createContext, useContext, useState, useCallback } from 'react';
import { authService } from '../services/authService';
import { socketService } from '../services/socketService';
import type { User } from '../types/user.types';

interface AuthContextValue {
  isLoggedIn: boolean;
  user: User | null;
  login: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: async () => {},
  refreshUser: async () => null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const refreshUser = useCallback(async () => {
    const stored = await authService.getStoredUser();
    if (stored) {
      setUser(stored);
      return stored;
    }
    setUser(null);
    return null;
  }, []);

  const login = useCallback(() => {
    setIsLoggedIn(true);
    void refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    await authService.logout();
    socketService.disconnect();
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
