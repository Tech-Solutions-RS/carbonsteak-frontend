import { api } from './api';
import type { CrearPagoRequest, MetodoPago, Pago, ResultadoIntento } from '../types/pago';

/**
 * mc-pagos NO recibe monto: CrearPagoRequest solo tiene pedidoId y metodoPago.
 * El monto se resuelve en el backend desde el pedido.
 */
export async function crearPago(pedidoId: number | string, metodoPago: MetodoPago) {
  const body: CrearPagoRequest = { pedidoId, metodoPago };
  const res = await api.post<Pago>('/pagos', body);
  return res.data;
}

/**
 * El id es el de PagoResponse.id (no "pagoId").
 * RegistrarIntentoRequest exige body { resultado }.
 */
export async function registrarIntentoPago(pagoId: number | string, resultado: ResultadoIntento = 'EXITOSO') {
  const res = await api.post<Pago>(`/pagos/${pagoId}/intentos`, { resultado });
  return res.data;
}