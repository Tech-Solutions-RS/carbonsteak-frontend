import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

type Props = {
  children: React.ReactNode;
};

/**
 * Guard de ruta: sin token en el contexto no se renderiza la pantalla protegida,
 * se redirige a /login. El aislamiento de datos por usuarioId lo hace el backend;
 * aqui solo se comprueba que exista sesion.
 */
export default function RequireAuth({ children }: Props) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}