import type { Pedido } from '../types/pedido';

/**
 * No existe endpoint de listado de pedidos en el backend (GET /pedidos y
 * mc-pedidos no lo implementan), asi que el historial de "Mis pedidos" se
 * guarda en localStorage con clave por usuario. Al abrir la pantalla, cada
 * pedido se refresca con GET /pedidos/{id} (que el backend valida 403 si no
 * es del usuario), de modo que el estado mostrado siempre es el real.
 */
const PREFIJO = 'pedidos:';

function claveDelUsuario(): string | null {
  const usuarioId = localStorage.getItem('usuarioId');
  return usuarioId ? `${PREFIJO}${usuarioId}` : null;
}

/** Registra el id de un pedido creado por el usuario actual (al frente). */
export function registrarPedidoPropio(pedido: Pedido): void {
  if (pedido.id === undefined || pedido.id === null) return;
  const clave = claveDelUsuario();
  if (!clave) return;
  const id = String(pedido.id);
  const sinDuplicados = leerIdsPropios().filter((x) => x !== id);
  localStorage.setItem(clave, JSON.stringify([id, ...sinDuplicados]));
}

/** Ids de los pedidos del usuario actual, mas recientes primero. */
export function leerIdsPropios(): string[] {
  const clave = claveDelUsuario();
  if (!clave) return [];
  try {
    const crudo = JSON.parse(localStorage.getItem(clave) ?? '[]');
    return Array.isArray(crudo) ? crudo.map(String) : [];
  } catch {
    return [];
  }
}