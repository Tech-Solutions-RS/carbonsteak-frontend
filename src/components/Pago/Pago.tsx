import { useState } from 'react';
import { api } from '../../services/api';
import type { MetodoPago } from '../../types/pago';

type Props = {
  pedidoId: number | string;
  monto: number;
};

export default function Pago({ pedidoId, monto }: Props) {
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('TARJETA');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [pagoId, setPagoId] = useState<number | null>(null);
  const [pedidoEstado, setPedidoEstado] = useState<'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO'>('PENDIENTE');

  const handlePagar = async (e: React.FormEvent) => {
    e.preventDefault();
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
        lineas: any[];
        usuarioId: number;
      }>(`/pedidos/${pedidoId}`);

      setPedidoEstado(res3.data.estado);

      // Si el pago fue exitoso, el estado debería ser CONFIRMADO
      if (res3.data.estado === 'CONFIRMADO') {
        setExito(
          `¡Pago exitoso! Tu pedido #${pedidoId} ha sido confirmado.`
        );
      } else {
        setExito(
          `Tu pedido #${pedidoId} quedó en estado: ${res3.data.estado}`
        );
      }
    } catch (err: any) {
      const status = err?.status ?? err?.codigo;
      if (String(status) === '409' && metodoPago === 'EFECTIVO') {
        setInfo(
          'El pago en efectivo debe confirmarlo el cajero en el restaurante. Tu pedido queda pendiente de pago.'
        );
        setPedidoEstado('PENDIENTE');
      } else {
        setError(
          'Hubo un error al procesar el pago. Tu pedido no ha sido confirmado.'
        );
        setPedidoEstado('CANCELADO');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '640px', margin: '0 auto' }}>
      <h2>Pago - Pedido #{pedidoId}</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {info && (
        <p
          style={{
            color: '#8a6d3b',
            background: '#fff8e5',
            border: '1px solid #ffe69c',
            padding: '0.75rem',
            borderRadius: '4px',
          }}
        >
          {info}
        </p>
      )}

      {exito && (
        <p style={{ color: 'green', marginBottom: '1rem' }}>{exito}</p>
      )}

      {pagoId && <p>Pago #{pagoId}</p>}

      {pedidoEstado && (
        <p>Estado del pedido: {pedidoEstado}</p>
      )}

      {!exito && !loading && (
        <form onSubmit={handlePagar}>
          <div style={{ marginBottom: '1rem' }}>
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

          <p>Monto: ${monto.toFixed(2)}</p>

          <button type="submit" disabled={loading} className="btn">
            {loading ? 'Procesando...' : 'Pagar'}
          </button>
        </form>
      )}

      {loading && (
        <p>Procesando pago...</p>
      )}
    </div>
  );
}