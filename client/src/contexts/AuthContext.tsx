import { createContext, useState, useEffect } from 'react';
import socket from '../services/socket';
import type { ReactNode } from 'react';
import type { User } from '../types';
import api from '../services/api';

// define o formato do nosso Contexto
interface AuthContextType {
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

// Cria o contexto com um valor inicial "undefined" (vai ser preenchido pelo Provider)
export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken && savedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        socket.connect();
      } catch (error) {
        console.error("Cache limpo devido a erro:", error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: User, tokenData: string) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', tokenData);
    api.defaults.headers.common['Authorization'] = `Bearer ${tokenData}`;
    socket.connect();
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    socket.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {/* Se estiver carregando, mostra nada (ou um spinner) para não chutar o usuário */}
      {!loading && children}
    </AuthContext.Provider>
  );
}