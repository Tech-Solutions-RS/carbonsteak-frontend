/**
 * Formatea un monto en pesos colombianos: formatCOP(45000) === "$45.000".
 *
 * Se evita Intl.NumberFormat con style "currency" porque en es-CO inserta un
 * espacio separador no-visible (NBSP) entre el simbolo y la cifra, y ademas
 * añade decimales. toLocaleString('es-CO') da solo el grupo de miles.
 */
export function formatCOP(valor: number | null | undefined): string {
  const numero = typeof valor === 'number' && Number.isFinite(valor) ? valor : 0;
  return `$${Math.round(numero).toLocaleString('es-CO')}`;
}
