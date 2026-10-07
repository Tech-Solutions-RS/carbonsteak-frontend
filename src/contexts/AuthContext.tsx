import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginRequest, registrar } from '../services/auth';
import { getPerfil } from '../services/usuario';
import { EVENTO_SESION_EXPIRADA } from '../services/api';
import type { AuthResponse, AuthState, Credenciales, RegistroRequest } from '../types/auth';

type AuthContextType = AuthState & {
  login: (credenciales: Credenciales) => Promise<void>;
  registro: (datos: RegistroRequest) => Promise<void>;
  logout: () => void;
};

const CLAVES = {
  token: 'token',
  rol: 'rol',
  usuarioId: 'usuarioId',
  nombre: 'nombre',
  nombreId: 'nombreId',
} as const;

const initialState: AuthState = {
  token: null,
  rol: null,
  usuarioId: null,
  nombre: null,
  isAuthenticated: false,
};

/**
 * GET /usuarios/{id} devuelve el nombre; el resultado se cachea junto con el
 * usuarioId al que pertenece, de modo que un login de otra persona no muestre
 * el nombre del usuario anterior.
 */
function leerNombreEnCache(usuarioId: string | number | null): string | null {
  if (usuarioId === null) return null;
  const dueno = localStorage.getItem(CLAVES.nombreId);
  if (dueno !== String(usuarioId)) return null;
  return localStorage.getItem(CLAVES.nombre);
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * El JWT no se revoca del lado del servidor en este proyecto, asi que logout es
 * solo cliente: borrar lo guardado en localStorage y reiniciar el estado.
 */
function limpiarSesionGuardada() {
  localStorage.removeItem(CLAVES.token);
  localStorage.removeItem(CLAVES.rol);
  localStorage.removeItem(CLAVES.usuarioId);
  localStorage.removeItem(CLAVES.nombre);
  localStorage.removeItem(CLAVES.nombreId);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);
  const navigate = useNavigate();

  /**
   * POST /usuarios/login no trae el nombre, asi que se resuelve con
   * GET /usuarios/{id} (el mismo endpoint que ya usaba Dashboard) y se cachea.
   * Se lanza sin await: un fallo de perfil no puede romper el login.
   */
  const refrescarNombre = useCallback(async () => {
    try {
      const perfil = await getPerfil();
      const nombre = ((perfil?.nombre as string | undefined) ?? '').trim() || 'Usuario';
      const usuarioId = localStorage.getItem(CLAVES.usuarioId);
      if (!localStorage.getItem(CLAVES.token) || !usuarioId) return;
      localStorage.setItem(CLAVES.nombre, nombre);
      localStorage.setItem(CLAVES.nombreId, usuarioId);
      setState((prev) => (prev.isAuthenticated ? { ...prev, nombre } : prev));
    } catch {
      if (!localStorage.getItem(CLAVES.token)) return;
      setState((prev) =>
        prev.isAuthenticated && prev.nombre === null ? { ...prev, nombre: 'Usuario' } : prev
      );
    }
  }, []);

  // Rehidrata la sesion si el navegador conserva el token entre recargas.
  useEffect(() => {
    const token = localStorage.getItem(CLAVES.token);
    if (!token) return;

    const rol = localStorage.getItem(CLAVES.rol);
    const crudo = localStorage.getItem(CLAVES.usuarioId);
    const usuarioId =
      crudo !== null && !Number.isNaN(Number(crudo)) ? Number(crudo) : crudo;

    setState({
      token,
      rol,
      usuarioId,
      nombre: leerNombreEnCache(usuarioId),
      isAuthenticated: true,
    });
    refrescarNombre();
  }, [refrescarNombre]);

  const guardarSesion = (data: AuthResponse) => {
    localStorage.setItem(CLAVES.token, data.token);
    localStorage.setItem(CLAVES.rol, data.rol);
    localStorage.setItem(CLAVES.usuarioId, String(data.usuarioId));
    setState({
      token: data.token,
      rol: data.rol,
      usuarioId: data.usuarioId,
      nombre: leerNombreEnCache(data.usuarioId),
      isAuthenticated: true,
    });
    refrescarNombre();
  };

  const login = async ({ correo, contrasena }: Credenciales) => {
    const data = await loginRequest(correo, contrasena);
    guardarSesion(data);
  };

  /**
   * El registro no devuelve token, asi que encadenamos un login real con las
   * mismas credenciales para dejar la sesion activa de inmediato.
   */
  const registro = async (datos: RegistroRequest) => {
    await registrar(datos);
    const data = await loginRequest(datos.correo, datos.contrasena);
    guardarSesion(data);
  };

  const logout = useCallback(() => {
    limpiarSesionGuardada();
    setState(initialState);
  }, []);

  // Una peticion protegida respondio 401: la sesion ya no vale.
  useEffect(() => {
    const alExpirar = () => {
      logout();
      navigate('/login', { replace: true });
    };

    window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
  }, [logout, navigate]);

  return (
    <AuthContext.Provider value={{ ...state, login, registro, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}