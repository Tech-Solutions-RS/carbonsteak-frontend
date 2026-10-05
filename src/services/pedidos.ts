import { api } from './api';
import type { CrearPedidoRequest, Pedido } from '../types/pedido';

export async function crearPedido(data: CrearPedidoRequest) {
  const res = await api.post<Pedido>('/pedidos', data);
  return res.data;
}

export async function getPedido(id: number | string) {
  const res = await api.get<Pedido>(`/pedidos/${id}`);
  return res.data;
}
