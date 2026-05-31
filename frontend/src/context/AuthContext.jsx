import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('community-dabba-user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const token = localStorage.getItem('community-dabba-token');
        if (token) {
          const { data } = await api.get('/auth/me');
          setUser(data);
          localStorage.setItem('community-dabba-user', JSON.stringify(data));
        } else {
          setUser(null);
        }
      } catch {
        localStorage.removeItem('community-dabba-token');
        localStorage.removeItem('community-dabba-user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, []);

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    setUser(data);
    localStorage.setItem('community-dabba-user', JSON.stringify(data));
    localStorage.setItem('community-dabba-token', data.token);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    setUser(data);
    localStorage.setItem('community-dabba-user', JSON.stringify(data));
    localStorage.setItem('community-dabba-token', data.token);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('community-dabba-user');
    localStorage.removeItem('community-dabba-token');
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, setUser }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}