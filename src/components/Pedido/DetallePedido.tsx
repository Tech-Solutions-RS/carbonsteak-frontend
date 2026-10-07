import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPedido } from '../../services/pedidos';
import { formatError } from '../../utils/errors';
import { formatCOP } from '../../utils/format';
import type { Pedido } from '../../types/pedido';
import Carta from '../common/Carta';
import EstadoBadge from '../common/EstadoBadge';

function formatearFecha(fecha?: string): string {
  if (!fecha) return '—';
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
}

export default function DetallePedido() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let activo = true;
    (async () => {
      try {
        const p = await getPedido(id);
        if (activo) setPedido(p);
      } catch (err) {
        if (activo) setError(formatError(err));
      } finally {
        if (activo) setLoading(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Carta titulo={`Pedido #${id}`} ancho="detalle">
        <p>Cargando pedido...</p>
      </Carta>
    );
  }

  if (!pedido) {
    return (
      <Carta titulo={`Pedido #${id}`} ancho="detalle" className="stack">
        {error && <p className="alert alert--error">{error}</p>}
        <div className="btn-row">
          <button className="btn btn--outline" onClick={() => navigate('/mis-pedidos')}>
            Volver a mis pedidos
          </button>
        </div>
      </Carta>
    );
  }

  return (
    <Carta titulo={`Pedido #${pedido.id}`} ancho="detalle" className="stack">
      {error && <p className="alert alert--error">{error}</p>}

      <div className="id-grid">
        <div className="id-block">
          <span className="id-label">ID del pedido</span>
          <span className="id-value">#{pedido.id}</span>
        </div>
        <div className="id-block">
          <span className="id-label">Estado</span>
          <span className="id-value">
            <EstadoBadge estado={pedido.estado} />
          </span>
        </div>
        <div className="id-block">
          <span className="id-label">Fecha</span>
          <span className="id-value">{formatearFecha(pedido.fechaCreacion)}</span>
        </div>
        <div className="id-block">
          <span className="id-label">Total</span>
          <span className="id-value">{formatCOP(pedido.total)}</span>
        </div>
      </div>

      <p className="resumen-linea">
        <strong>Dirección de entrega:</strong> {pedido.direccionEntrega ?? '—'}
      </p>

      {pedido.lineas.length > 0 && (
        <ul className="lineas-pedido">
          {pedido.lineas.map((l, i) => (
            <li key={`${l.platoId}-${i}`} className="fila-pedido">
              <span className="fila-pedido-info">
                Plato #{l.platoId} × {l.cantidad}
              </span>
              {l.precio != null && <span>{formatCOP(l.precio * l.cantidad)}</span>}
            </li>
          ))}
        </ul>
      )}

      <div className="btn-row">
        {pedido.estado === 'PENDIENTE' && (
          <button
            className="btn"
            onClick={() => navigate(`/pago/${pedido.id}`, { state: { monto: pedido.total } })}
          >
            Pagar
          </button>
        )}
        <button className="btn btn--outline" onClick={() => navigate('/mis-pedidos')}>
          Volver a mis pedidos
        </button>
      </div>
    </Carta>
  );
}