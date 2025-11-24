import { createContext, useState, useEffect } from 'react';
import socket from '../services/socket';
import type {ReactNode } from 'react';
import type { User } from '../types';
import api from '../services/api';

// Define o formato do nosso Contexto
interface AuthContextType {
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Cria o contexto com um valor inicial "undefined" (vai ser preenchido pelo Provider)
export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      socket.connect();
    }
  }, []);

  const login = (userData: User, token: string) => {
    setUser(userData);
    
    // Salva no LocalStorage
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    
    // Configura o token para as próximas requisições
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Conecta o socket
    socket.connect();
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    api.defaults.headers.common['Authorization'] = '';
    socket.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}