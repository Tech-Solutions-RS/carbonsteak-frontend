export type Estado =
  | 'PENDIENTE'
  | 'CONFIRMADO'
  | 'CANCELADO'
  | 'EXITOSO'
  | 'RECHAZADO'
  | 'REVISION_PENDIENTE'
  | 'REQUIERE_REEMBOLSO';

const VARIANTE: Record<string, string> = {
  PENDIENTE: 'badge--pendiente',
  CONFIRMADO: 'badge--confirmado',
  EXITOSO: 'badge--exitoso',
  CANCELADO: 'badge--cancelado',
  RECHAZADO: 'badge--rechazado',
  REVISION_PENDIENTE: 'badge--revision',
  REQUIERE_REEMBOLSO: 'badge--reembolso',
};

/**
 * Estado como badge en vez de texto plano.
 * El texto visible es EXACTAMENTE el enum del backend (mayusculas): los tests
 * E2E buscan el literal "PENDIENTE" en document.body.
 */
export default function EstadoBadge({ estado }: { estado: Estado | string }) {
  const variante = VARIANTE[estado] ?? 'badge--pendiente';

  return <span className={`badge ${variante}`}>{estado}</span>;
}
