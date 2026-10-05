import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { formatError } from '../../utils/errors';
import { getPerfil } from '../../services/usuario';
import { Navigate } from 'react-router-dom';

export default function Login() {
  const { login, isAuthenticated, token } = useAuth();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [perfil, setPerfil] = useState<any>(null);

  // Cargar perfil UNA sola vez después de que el usuario se autentique
  // Este useEffect se ejecuta solo cuando isAuthenticated cambia de false a true
  useEffect(() => {
    if (isAuthenticated && !perfil && token) {
      setLoading(true);
      getPerfil().then((data) => {
        // Guardamos el perfil para posible uso futuro, pero no lo mostramos aquí
        // (se almacenará en el contexto auth para que otros componentes lo usen)
        console.log('Perfil cargado:', data);
        setPerfil(data);
        setLoading(false);
      }).catch((err) => {
        // Error al obtener perfil, pero el usuario ya está logueado, no es crítico
        console.error('Error al obtener perfil:', err);
        setLoading(false);
      });
    }
  }, [isAuthenticated, perfil, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ correo, contrasena });
      // Después de un pequeño delay, redirigir al dashboard
      // Usamos setTimeout para asegurar que el estado de auth se haya actualizado
      setTimeout(() => {
        // Navegamos al dashboard; replace: true significa que no se agrega historial atrás
        // window.location.pathname = '/dashboard';
      }, 100);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  // Si ya está autenticado, redirigir al dashboard (evitar ver el formulario de login)
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="login-card">
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Correo</label>
          <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
        </div>
        <div>
          <label>Contraseña</label>
          <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Cargando...' : 'Ingresar'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}