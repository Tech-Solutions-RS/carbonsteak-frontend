export type LineaPedido = {
  platoId: number | string;
  cantidad: number;
  precio?: number;
};

export type Pedido = {
  id: number | string;
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO';
  total: number;
  direccionEntrega?: string;
  lineas: LineaPedido[];
  /** El backend (mc-pedidos) devuelve estos campos al consultar GET /pedidos/{id}. */
  fechaCreacion?: string;
  usuarioId?: number | string;
};

export type CrearPedidoRequest = {
  lineas: LineaPedido[];
  direccionEntrega: string;
};
