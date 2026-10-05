import { useCarrito } from '../../hooks/useCarrito';

export default function Carrito() {
  const { items, total, isEmpty, update, remove, clear } = useCarrito();

  if (isEmpty) return <div>El carrito está vacío</div>;

  return (
    <div>
      <h2>Carrito</h2>
      {items.map((item) => (
        <div key={item.platoId} style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem' }}>
          <h4>{item.plato?.nombre}</h4>
          <p>Cantidad: {item.cantidad}</p>
          <p>Subtotal: ${((item.plato?.precio || 0) * item.cantidad).toFixed(2)}</p>
          <button onClick={() => update(item.platoId, item.cantidad + 1)} className="btn">
            +
          </button>
          <button onClick={() => update(item.platoId, item.cantidad - 1)} className="btn">
            -
          </button>
          <button onClick={() => remove(item.platoId)} className="btn">
            Eliminar
          </button>
        </div>
      ))}
      <h3>Total: ${total.toFixed(2)}</h3>
      <button onClick={clear} className="btn">
        Vaciar carrito
      </button>
    </div>
  );
}