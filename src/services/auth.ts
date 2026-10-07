import { api } from './api';
import type { AuthResponse, Credenciales, RegistroRequest } from '../types/auth';

/**
 * POST /usuarios/login
 * Body exacto: { correo, contrasena }. Responde { token, rol, usuarioId }.
 */
export async function login(correo: string, contrasena: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/usuarios/login', { correo, contrasena });
  return res.data;
}

/**
 * POST /usuarios/registro
 * Body exacto: { nombre, correo, contrasena, telefono }. Los 4 son obligatorios.
 * El backend no devuelve token: la sesion se abre con un login aparte.
 */
export async function registrar(datos: RegistroRequest): Promise<void> {
  await api.post('/usuarios/registro', {
    nombre: datos.nombre,
    correo: datos.correo,
    contrasena: datos.contrasena,
    telefono: datos.telefono,
  });
}

export type { Credenciales };