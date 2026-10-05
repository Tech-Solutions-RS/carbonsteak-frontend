/**
 * Enums reales de mc-pagos (Java). Los valores viajan en MAYUSCULAS:
 * com.carbonsteak.mcpagos.domain.MetodoPago y EstadoPago.
 */
export type MetodoPago = 'TARJETA' | 'PSE' | 'EFECTIVO' | 'PAGO_EN_LINEA';

export type EstadoPago = 'PENDIENTE' | 'EXITOSO' | 'RECHAZADO' | 'REVISION_PENDIENTE' | 'REQUIERE_REEMBOLSO';

export type ResultadoIntento = 'EXITOSO' | 'FALLIDO';

/** Body de POST /pagos -> CrearPagoRequest */
export interface CrearPagoRequest {
  pedidoId: number | string;
  metodoPago: MetodoPago;
}

/** Body de POST /pagos/{id}/intentos -> RegistrarIntentoRequest */
export interface RegistrarIntentoRequest {
  resultado: ResultadoIntento;
}

/** Respuesta de POST /pagos y POST /pagos/{id}/intentos -> PagoResponse */
export interface Pago {
  id: number;
  pedidoId: number;
  usuarioId: number;
  monto: number;
  metodoPago: MetodoPago;
  estado: EstadoPago;
  fechaCreacion: string;
}