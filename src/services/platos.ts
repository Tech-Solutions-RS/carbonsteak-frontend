import { api } from './api';
import type { Categoria, Paginado, Plato } from '../types/plato';

/**
 * GET /platos devuelve un envelope paginado
 * ({ contenido, pagina, tamano, totalElementos, totalPaginas }),
 * no un array plano. Aqui se desenvuelve para que el consumidor
 * trabaje siempre con Plato[].
 */
export async function getPlatos(): Promise<Plato[]> {
  const res = await api.get<Paginado<Plato> | Plato[]>('/platos');
  const data = res.data;

  if (Array.isArray(data)) return data;

  return data?.contenido ?? [];
}

export async function getCategorias(): Promise<Categoria[]> {
  const res = await api.get<Categoria[]>('/categorias');
  return res.data;
}