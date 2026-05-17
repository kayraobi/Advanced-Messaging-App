import React, { createContext, useContext, useState, useCallback } from 'react';
import { authService } from '../services/authService';
import { socketService } from '../services/socketService';

interface AuthContextValue {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  login: () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = useCallback(() => setIsLoggedIn(true), []);

  const logout = useCallback(async () => {
    await authService.logout();
    socketService.disconnect();
    setIsLoggedIn(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
