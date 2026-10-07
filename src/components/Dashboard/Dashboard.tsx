import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Carta from '../common/Carta';

export default function Dashboard() {
  const navigate = useNavigate();
  const { nombre } = useAuth();

  // El nombre lo resuelve AuthContext (GET /usuarios/{id}); mientras no llegue,
  // se mantiene el mismo estado de carga de antes.
  if (nombre === null) {
    return <div>Cargando...</div>;
  }

  return (
    <Carta titulo={`Bienvenido, ${nombre}`} ancho="detalle">
      <div className="btn-row">
        <button className="btn" onClick={() => navigate('/')}>
          Menú
        </button>
        <button className="btn btn--outline" onClick={() => navigate('/pedido')}>
          Crear pedido
        </button>
      </div>
    </Carta>
  );
}
