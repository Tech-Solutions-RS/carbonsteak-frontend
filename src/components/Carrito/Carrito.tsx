import { useCarrito } from '../../hooks/useCarrito';
import { formatCOP } from '../../utils/format';
import Carta from '../common/Carta';

export default function Carrito() {
  const { items, total, isEmpty, update, remove, clear } = useCarrito();

  if (isEmpty) {
    return (
      <Carta titulo="Carrito" ancho="detalle">
        <p className="resumen-linea">El carrito está vacío</p>
      </Carta>
    );
  }

  return (
    <Carta titulo="Carrito" ancho="detalle">
      {items.map((item) => (
        <div key={item.platoId} className="cart-item">
          <span className="nombre">{item.plato?.nombre}</span>
          <span className="cantidad">Cantidad: {item.cantidad}</span>

          <span className="acciones">
            <button
              className="btn btn--outline btn--sm"
              onClick={() => update(item.platoId, item.cantidad + 1)}
            >
              +
            </button>
            <button
              className="btn btn--outline btn--sm"
              onClick={() => update(item.platoId, item.cantidad - 1)}
            >
              -
            </button>
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => remove(item.platoId)}
            >
              Eliminar
            </button>
          </span>

          <span className="subtotal">
            Subtotal: {formatCOP((item.plato?.precio || 0) * item.cantidad)}
          </span>
        </div>
      ))}

      <div className="total-row">
        <span>Total</span>
        <span>{formatCOP(total)}</span>
      </div>

      <div className="btn-row">
        <button className="btn btn--ghost" onClick={clear}>
          Vaciar carrito
        </button>
      </div>
    </Carta>
  );
}
