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
};

export type CrearPedidoRequest = {
  lineas: LineaPedido[];
  direccionEntrega: string;
};
