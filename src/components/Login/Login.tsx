import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { formatError } from '../../utils/errors';
import Carta from '../common/Carta';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Body exacto de POST /usuarios/login: solo correo y contrasena.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!correo.trim()) {
      setError('El correo es obligatorio');
      return;
    }

    if (!contrasena) {
      setError('La contraseña es obligatoria');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await login({ correo: correo.trim(), contrasena });
      // El token ya quedo guardado; el render siguiente redirige al dashboard.
    } catch (err) {
      // El backend responde { error, codigo, timestamp }; formatError toma err.error.
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Carta titulo="Iniciar sesión" ancho="form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="correo">Correo</label>
          <input
            id="correo"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="contrasena">Contraseña</label>
          <input
            id="contrasena"
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn--full" disabled={loading}>
          {loading ? 'Cargando...' : 'Ingresar'}
        </button>
      </form>
      {error && (
        <p role="alert" className="alert alert--error">
          {error}
        </p>
      )}
    </Carta>
  );
}