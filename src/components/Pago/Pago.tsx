import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../../hooks/useCarrito';
import { api } from '../../services/api';
import { getPedido } from '../../services/pedidos';
import { getCodigo, formatError } from '../../utils/errors';
import { formatCOP } from '../../utils/format';
import type { MetodoPago } from '../../types/pago';
import type { Pedido } from '../../types/pedido';
import Carta from '../common/Carta';
import EstadoBadge from '../common/EstadoBadge';

type Props = {
  pedidoId: number | string;
  monto?: number;
};

export default function Pago({ pedidoId, monto }: Props) {
  const navigate = useNavigate();
  const { isEmpty } = useCarrito();

  const [montoActual, setMontoActual] = useState<number>(monto && monto > 0 ? monto : 0);
  const [cargandoPedido, setCargandoPedido] = useState<boolean>(!(monto && monto > 0));
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('TARJETA');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [pagoId, setPagoId] = useState<number | null>(null);
  const [pedidoEstado, setPedidoEstado] = useState<Pedido['estado']>('PENDIENTE');

  /**
   * Entrada directa a /pago/:id sin pasar por "Pedido creado": no llega el monto
   * en location.state, asi que se recupera el pedido real para mostrar el total
   * y el estado actual.
   */
  useEffect(() => {
    if (monto && monto > 0) return;
    let activo = true;
    (async () => {
      try {
        const p = await getPedido(pedidoId);
        if (!activo) return;
        setMontoActual(p.total ?? 0);
        setPedidoEstado(p.estado ?? 'PENDIENTE');
      } catch (err) {
        if (activo) setError(formatError(err));
      } finally {
        if (activo) setCargandoPedido(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [pedidoId, monto]);

  const handlePagar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    setInfo(null);
    setExito(null);
    setPagoId(null);
    setPedidoEstado('PENDIENTE');

    try {
      // PASO 3: POST /pagos con { pedidoId, metodoPago }
      const res1 = await api.post<{ id: number }>('/pagos', {
        pedidoId,
        metodoPago,
      });
      const idDelPago = res1.data.id;
      setPagoId(idDelPago);

      // PASO 4: POST /pagos/{pagoId}/intentos con { resultado: "EXITOSO" }
      await api.post(`/pagos/${idDelPago}/intentos`, { resultado: 'EXITOSO' as const });

      // PASO 5: GET /pedidos/{pedidoId} para ver estado final
      const res3 = await api.get<{
        id: number | string;
        estado: 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO';
        total: number;
        lineas: unknown[];
        usuarioId: number;
      }>(`/pedidos/${pedidoId}`);

      setPedidoEstado(res3.data.estado);
      setMontoActual(res3.data.total ?? montoActual);

      // Si el pago fue exitoso, el estado debería ser CONFIRMADO
      if (res3.data.estado === 'CONFIRMADO') {
        setExito(`¡Pago exitoso! Tu pedido #${pedidoId} ha sido confirmado.`);
      } else {
        setExito(`Tu pedido #${pedidoId} quedó en estado: ${res3.data.estado}`);
      }
    } catch (err: any) {
      const status = getCodigo(err);
      if (status === '409' && metodoPago === 'EFECTIVO') {
        setInfo(
          'El pago en efectivo debe confirmarlo el cajero en el restaurante. Tu pedido queda pendiente de pago.'
        );
        setPedidoEstado('PENDIENTE');
      } else {
        setError(formatError(err));
        setPedidoEstado('CANCELADO');
      }
    } finally {
      setLoading(false);
    }
  };

  if (cargandoPedido) {
    return (
      <Carta titulo={`Pago - Pedido #${pedidoId}`} ancho="detalle">
        <p>Cargando pedido...</p>
      </Carta>
    );
  }

  return (
    <Carta titulo={`Pago - Pedido #${pedidoId}`} ancho="detalle" className="stack">
      {error && <p className="alert alert--error">{error}</p>}

      {info && <p className="alert alert--warn">{info}</p>}

      {exito && <p className="alert alert--success">{exito}</p>}

      <div className="id-grid">
        <div className="id-block">
          <span className="id-label">Pedido</span>
          <span className="id-value">#{pedidoId}</span>
        </div>
        <div className="id-block">
          <span className="id-label">Pago</span>
          <span className="id-value">{pagoId ? `#${pagoId}` : '—'}</span>
        </div>
        <div className="id-block">
          <span className="id-label">Estado del pedido</span>
          <span className="id-value">
            <EstadoBadge estado={pedidoEstado} />
          </span>
        </div>
      </div>

      {!exito && !loading && (
        <form onSubmit={handlePagar}>
          <div className="form-group">
            <label htmlFor="metodo-pago">Método de pago</label>
            <select
              id="metodo-pago"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
            >
              <option value="TARJETA">Tarjeta</option>
              <option value="EFECTIVO">Efectivo</option>
            </select>
          </div>

          <p className="total-row">
            <span>Monto</span>
            <span>{formatCOP(montoActual)}</span>
          </p>

          <button type="submit" disabled={loading} className="btn btn--full">
            {loading ? 'Procesando...' : 'Pagar'}
          </button>
        </form>
      )}

      {loading && <p>Procesando pago...</p>}

      {exito && (
        <div className="btn-row">
          {isEmpty ? (
            <button className="btn" onClick={() => navigate('/menu')}>
              Volver al menú
            </button>
          ) : (
            <button className="btn" onClick={() => navigate('/pedido')}>
              Nuevo pedido
            </button>
          )}
          <button className="btn btn--outline" onClick={() => navigate('/mis-pedidos')}>
            Ver mis pedidos
          </button>
        </div>
      )}
    </Carta>
  );
}