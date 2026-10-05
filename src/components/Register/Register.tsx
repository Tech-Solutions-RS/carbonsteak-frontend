import { useState } from 'react';
import { api } from '../../services/api';

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [telefono, setTelefono] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setExito(null);

    // Validación: campos obligatorios
    if (!nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setError('Por favor, introduce un correo electrónico válido');
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

    // Validación: contraseñas coinciden
    if (contrasena !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      await api.post('/usuarios/registro', { nombre, correo, contrasena, telefono });
      setExito('¡Registro exitoso! Ya puedes iniciar sesión.');
      setTimeout(() => {
        setExito(null);
      }, 3000);
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Error al registrar';
      setError(message);
    }
  };

  return (
    <div className="pedido-screen">
      <h1>Registro</h1>

      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
      {exito && <p style={{ color: 'green', marginBottom: '1rem' }}>¡Registro exitoso! Ya puedes iniciar sesión.</p>}

      <form onSubmit={manejarSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre completo</label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Juan Pérez"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="correo">Correo electrónico</label>
          <input
            type="email"
            id="correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="juan.perez@ejemplo.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="telefono">Teléfono</label>
          <input
            type="text"
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="+52 55 1234 5678"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirm-password">Confirmar contraseña</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" className="pago-btn" style={{ marginTop: '1.5rem' }}>
          Registrarse
        </button>
      </form>

      <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        ¿Ya tienes cuenta? <a href="/login" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Inicia sesión</a>
      </p>
    </div>
  );
}