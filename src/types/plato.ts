export type Categoria = {
  id: number | string;
  nombre: string;
};

/**
 * El backend devuelve la categoria del plato como objeto anidado,
 * no como string plano.
 */
export type Plato = {
  id: number | string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  categoria: Categoria;
};

/**
 * Envelope de paginacion que devuelve GET /platos.
 * Spring Data devuelve { contenido, pagina, tamano, totalElementos, totalPaginas }.
 */
export type Paginado<T> = {
  contenido: T[];
  pagina: number;
  tamano: number;
  totalElementos: number;
  totalPaginas: number;
};