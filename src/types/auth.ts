export type AuthResponse = {
  token: string;
  rol: 'cliente' | 'cocinero' | 'cajero' | 'administrador';
  usuarioId: string | number;
};

export type AuthState = {
  token: string | null;
  rol: string | null;
  usuarioId: string | number | null;
  isAuthenticated: boolean;
};
