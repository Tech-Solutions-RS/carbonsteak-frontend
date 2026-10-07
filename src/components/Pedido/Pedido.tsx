import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCarrito } from '../../hooks/useCarrito';
import { crearPedido } from '../../services/pedidos';
import { registrarPedidoPropio } from '../../services/pedidosHistorial';
import { formatError } from '../../utils/errors';
import { formatCOP } from '../../utils/format';
import type { Pedido } from '../../types/pedido';
import Carta from '../common/Carta';
import EstadoBadge from '../common/EstadoBadge';

export default function PedidoComponent() {
  const { items, isEmpty, clear } = useCarrito();
  const navigate = useNavigate();
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDireccion, setErrorDireccion] = useState<string | null>(null);

  const handleCrearPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (isEmpty) {
      setErrorDireccion('Tu carrito está vacío. Agrega platos antes de crear un pedido.');
      return;
    }
    if (!direccionEntrega.trim()) {
      setErrorDireccion('La dirección de entrega es obligatoria.');
      return;
    }
    setErrorDireccion(null);
    setError(null);
    setLoading(true);
    try {
      const lineas = items.map((i) => ({ platoId: i.platoId, cantidad: i.cantidad }));
      const creado = await crearPedido({ lineas, direccionEntrega: direccionEntrega.trim() });
      registrarPedidoPropio(creado);
      setPedido(creado);
      clear();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  if (isEmpty && !pedido) {
    return (
      <Carta titulo="Crear pedido" ancho="form">
        <div className="empty-state">
          <p>Tu carrito está vacío. Agrega platos antes de crear un pedido.</p>
          <button className="btn btn--full" onClick={() => navigate('/menu')}>
            Ir al menú
          </button>
        </div>
      </Carta>
    );
  }

  if (pedido) {
    return (
      <Carta titulo="Pedido creado" ancho="detalle">
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
            <span className="id-label">Total</span>
            <span className="id-value">{formatCOP(pedido.total)}</span>
          </div>
        </div>

        <p className="resumen-linea">
          <strong>Dirección de entrega:</strong> {pedido.direccionEntrega}
        </p>

        <div className="btn-row">
          <button
            className="btn"
            onClick={() =>
              navigate(`/pago/${pedido.id}`, { state: { monto: pedido.total } })
            }
          >
            Ir a pagar
          </button>
          {isEmpty ? (
            <button className="btn btn--outline" onClick={() => navigate('/menu')}>
              Volver al menú
            </button>
          ) : (
            <button className="btn btn--outline" onClick={() => setPedido(null)}>
              Nuevo pedido
            </button>
          )}
        </div>

        <p className="card-link">
          <Link to="/mis-pedidos">Ver mis pedidos</Link>
        </p>

        {error && <p className="alert alert--error">{error}</p>}
      </Carta>
    );
  }

  return (
    <Carta titulo="Crear pedido" ancho="form">
      <form onSubmit={handleCrearPedido} noValidate>
        <div className="form-group">
          <label htmlFor="direccion-entrega">Dirección de entrega</label>
          <input
            id="direccion-entrega"
            type="text"
            placeholder="Calle 100 #50-20"
            value={direccionEntrega}
            onChange={(e) => {
              setDireccionEntrega(e.target.value);
              if (errorDireccion) setErrorDireccion(null);
            }}
          />
        </div>

        {errorDireccion && (
          <p className="alert alert--error" role="alert">
            {errorDireccion}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn btn--full">
          {loading ? 'Creando...' : 'Confirmar pedido'}
        </button>
      </form>
      {error && <p className="alert alert--error">{error}</p>}
    </Carta>
  );
}