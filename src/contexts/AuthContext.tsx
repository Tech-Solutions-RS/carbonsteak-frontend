import { createContext, useContext, useEffect, useState } from 'react';
import type { AuthResponse, AuthState } from '../types/auth';

type AuthContextType = AuthState & {
  login: (credentials: { correo: string; contrasena: string }) => Promise<void>;
  logout: () => void;
};

const initialState: AuthState = {
  token: null,
  rol: null,
  usuarioId: null,
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    const usuarioId = localStorage.getItem('usuarioId');
    if (token) {
      setState({
        token,
        rol,
        usuarioId: usuarioId ? (isNaN(Number(usuarioId)) ? usuarioId : Number(usuarioId)) : null,
        isAuthenticated: true,
      });
    }
  }, []);

  const login = async (credentials: { correo: string; contrasena: string }) => {
    const { api } = await import('../services/api');
    const res = await api.post<AuthResponse>('/usuarios/login', credentials);
    const data = res.data;
    localStorage.setItem('token', data.token);
    localStorage.setItem('rol', data.rol);
    localStorage.setItem('usuarioId', String(data.usuarioId));
    setState({
      token: data.token,
      rol: data.rol,
      usuarioId: data.usuarioId,
      isAuthenticated: true,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('usuarioId');
    setState(initialState);
  };

  return <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
