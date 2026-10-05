import { useState } from 'react';
import { getPedido } from '../../services/pedidos';
import { formatError } from '../../utils/errors';
import type { Pedido } from '../../types/pedido';

type Props = {
  pedidoId: number | string;
};

export default function EstadoPedido({ pedidoId }: Props) {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const consultar = async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await getPedido(pedidoId);
      setPedido(p);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Estado del pedido</h3>
      <button onClick={consultar} disabled={loading}>{loading ? 'Consultando...' : 'Consultar estado'}</button>
      {pedido && <p>Estado: {pedido.estado}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
