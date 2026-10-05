import { useEffect, useMemo, useState } from 'react';
import { getPlatos, getCategorias } from '../../services/platos';
import type { Plato } from '../../types/plato';
import { useCarrito } from '../../hooks/useCarrito';
import { formatError } from '../../utils/errors';

const TODAS = 'todas';

export default function Menu() {
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [categorias, setCategorias] = useState<{ id: number | string; nombre: string }[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<string>(TODAS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { add } = useCarrito();

  useEffect(() => {
    (async () => {
      try {
        const [p, c] = await Promise.all([getPlatos(), getCategorias()]);
        setPlatos(p);
        setCategorias(c);
      } catch (err) {
        setError(formatError(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const visibles = useMemo(
    () =>
      categoriaActiva === TODAS
        ? platos
        : platos.filter((p) => String(p.categoria?.id) === categoriaActiva),
    [platos, categoriaActiva]
  );

  if (loading) return <div>Cargando menú...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="main-container">
      <div className="title-bar">
        <h1>Menú</h1>
        <select
          id="filtro-categoria"
          className="category-select"
          value={categoriaActiva}
          onChange={(e) => setCategoriaActiva(e.target.value)}
        >
          <option value={TODAS}>Todas</option>
          {categorias.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="platos-grid">
        {visibles.map((plato) => (
          <article key={plato.id} className="plato-card">
            <div className="plato-card-info">
              <p className="plato-card-categoria">
                {plato.categoria?.nombre ? plato.categoria.nombre.toUpperCase() : ''}
              </p>
              <h3 className="plato-card-nombre">{plato.nombre}</h3>
              {plato.descripcion && <p className="plato-card-desc">{plato.descripcion}</p>}
              <p className="plato-card-precio">${plato.precio}</p>
              <button className="btn-agregar" onClick={() => add(plato, 1)}>
                Añadir al carrito
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}