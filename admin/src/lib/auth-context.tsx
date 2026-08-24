import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../services/api';

interface Admin {
  id: string;
  telegramId: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  admin: Admin | null;
  loading: boolean;
  login: (telegramId: number, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authApi.me()
        .then((res) => setAdmin(res.data.data))
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('admin');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (telegramId: number, password: string) => {
    const res = await authApi.login({ telegramId, password });
    localStorage.setItem('token', res.data.data.token);
    localStorage.setItem('admin', JSON.stringify(res.data.data.admin));
    setAdmin(res.data.data.admin);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
