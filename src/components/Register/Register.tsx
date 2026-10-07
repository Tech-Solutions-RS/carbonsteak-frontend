import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { formatError } from '../../utils/errors';
import Carta from '../common/Carta';

export default function Register() {
  const { registro, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Los 4 campos son los unicos que pide POST /usuarios/registro (@NotBlank).
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!correo.trim()) {
      setError('El correo es obligatorio');
      return;
    }
    if (!contrasena) {
      setError('La contraseña es obligatoria');
      return;
    }
    if (!telefono.trim()) {
      setError('El teléfono es obligatorio');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // registro() hace POST /usuarios/registro y luego POST /usuarios/login
      // con las mismas credenciales, dejando la sesion ya abierta.
      await registro({
        nombre: nombre.trim(),
        correo: correo.trim(),
        contrasena,
        telefono: telefono.trim(),
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <p>Sesión activa. Redirigiendo...</p>;
  }

  return (
    <Carta titulo="Registro" ancho="form">
      {error && (
        <p role="alert" className="alert alert--error">
          {error}
        </p>
      )}

      <form onSubmit={manejarSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="correo">Correo</label>
          <input
            type="email"
            id="correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="contrasena">Contraseña</label>
          <input
            type="password"
            id="contrasena"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="telefono">Teléfono</label>
          <input
            type="text"
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn--full" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      <p className="card-link">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </Carta>
  );
}