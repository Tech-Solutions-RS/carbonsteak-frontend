import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../../hooks/useCarrito';
import { crearPedido, getPedido } from '../../services/pedidos';
import { formatError } from '../../utils/errors';
import type { Pedido } from '../../types/pedido';

export default function PedidoComponent() {
  const { items, isEmpty, clear } = useCarrito();
  const navigate = useNavigate();
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCrearPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmpty || !direccionEntrega.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const lineas = items.map((i) => ({ platoId: i.platoId, cantidad: i.cantidad }));
      const creado = await crearPedido({ lineas, direccionEntrega });
      setPedido(creado);
      clear();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleConsultar = async (id: number | string) => {
    try {
      const p = await getPedido(id);
      setPedido(p);
    } catch (err) {
      setError(formatError(err));
    }
  };

  if (pedido) {
    return (
      <div>
        <h2>Pedido creado</h2>
        <p>ID: {pedido.id}</p>
        <p>Estado: {pedido.estado}</p>
        <p>Total: ${pedido.total}</p>
        <p>Dirección: {pedido.direccionEntrega}</p>
        <button onClick={() => handleConsultar(pedido.id)}>Actualizar estado</button>
        <button onClick={() => setPedido(null)}>Nuevo pedido</button>
        <button
          className="btn"
          onClick={() =>
            navigate(`/pago/${pedido.id}`, { state: { monto: pedido.total } })
          }
        >
          Ir a pagar
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <h2>Crear pedido</h2>
      <form onSubmit={handleCrearPedido}>
        <div>
          <label>Dirección de entrega</label>
          <input value={direccionEntrega} onChange={(e) => setDireccionEntrega(e.target.value)} required />
        </div>
        <button type="submit" disabled={isEmpty || loading} className="btn">
          {loading ? 'Creando...' : 'Confirmar pedido'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
