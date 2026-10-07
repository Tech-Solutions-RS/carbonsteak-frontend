import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPedido } from '../../services/pedidos';
import { leerIdsPropios } from '../../services/pedidosHistorial';
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

/**
 * Historicos guardados en localStorage por usuario (services/pedidosHistorial).
 * Cada pedido se refresca con GET /pedidos/{id} real para mostrar el estado
 * actual: el backend responde 403 si el pedido no pertenece al usuario.
 */
export default function MisPedidos() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      const ids = leerIdsPropios();
      if (ids.length === 0) {
        if (activo) setLoading(false);
        return;
      }

      try {
        const resultados = await Promise.allSettled(ids.map((id) => getPedido(id)));
        if (!activo) return;

        const validos: Pedido[] = [];
        let primerError: string | null = null;
        resultados.forEach((r) => {
          if (r.status === 'fulfilled') validos.push(r.value);
          else if (!primerError) primerError = formatError((r.reason as { error?: string; message?: string }) ?? '');
        });

        setPedidos(validos);
        if (validos.length === 0 && primerError) setError(primerError);
      } catch (err) {
        if (activo) setError(formatError(err));
      } finally {
        if (activo) setLoading(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  if (loading) {
    return (
      <Carta titulo="Mis pedidos" ancho="detalle">
        <p>Cargando tus pedidos...</p>
      </Carta>
    );
  }

  return (
    <Carta titulo="Mis pedidos" ancho="detalle" className="stack">
      {error && <p className="alert alert--error">{error}</p>}

      {pedidos.length === 0 && !error && (
        <div className="empty-state">
          <p>Aún no tienes pedidos. Crea el primero desde el menú.</p>
          <button className="btn btn--full" onClick={() => navigate('/menu')}>
            Ir al menú
          </button>
        </div>
      )}

      {pedidos.map((p) => (
        <div key={String(p.id)} className="fila-pedido">
          <div className="fila-pedido-info">
            <span className="fila-pedido-id">#{p.id}</span>
            <span className="fila-pedido-fecha">{formatearFecha(p.fechaCreacion)}</span>
          </div>
          <EstadoBadge estado={p.estado} />
          <span className="fila-pedido-total">{formatCOP(p.total)}</span>
          {p.estado === 'PENDIENTE' ? (
            <button
              className="btn btn--sm"
              onClick={() => navigate(`/pago/${p.id}`, { state: { monto: p.total } })}
            >
              Pagar
            </button>
          ) : (
            <Link className="btn btn--outline btn--sm" to={`/pedidos/${p.id}`}>
              Ver detalle
            </Link>
          )}
        </div>
      ))}
    </Carta>
  );
}