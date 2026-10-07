export type AuthResponse = {
  token: string;
  rol: string;
  usuarioId: string | number;
};

export type AuthState = {
  token: string | null;
  rol: string | null;
  usuarioId: string | number | null;
  /**
   * Nombre visible del usuario autenticado. POST /usuarios/login no lo trae,
   * asi que se resuelve con GET /usuarios/{id} y se cachea en localStorage.
   * null = todavia no se resolvio.
   */
  nombre: string | null;
  isAuthenticated: boolean;
};

/** Body exacto de POST /usuarios/login. */
export type Credenciales = {
  correo: string;
  contrasena: string;
};

/** Body exacto de POST /usuarios/registro: los 4 campos son obligatorios. */
export type RegistroRequest = {
  nombre: string;
  correo: string;
  contrasena: string;
  telefono: string;
};