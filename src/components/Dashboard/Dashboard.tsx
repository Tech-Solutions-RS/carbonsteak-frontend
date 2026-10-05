import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPerfil } from '../../services/usuario';

export default function Dashboard() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar el perfil del usuario autenticado usando el usuarioId del localStorage
    const usuarioId = localStorage.getItem('usuarioId');
    if (usuarioId) {
      getPerfil().then((data) => {
        setNombre(data.nombre || 'Usuario');
        setLoading(false);
      }).catch((err) => {
        console.error('Error al cargar perfil en dashboard:', err);
        setNombre('Usuario');
        setLoading(false);
      });
    } else {
      setNombre('Usuario');
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '640px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        Bienvenido, {nombre}
      </h1>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            background: '#1e40af',
            color: 'white',
            fontSize: '1rem',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onClick={() => navigate('/')}
        >
          Menú
        </button>

        <button
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            background: '#3b82f6',
            color: 'white',
            fontSize: '1rem',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onClick={() => navigate('/pedidos')}
        >
          Mis Pedidos
        </button>
      </div>
    </div>
  );
}