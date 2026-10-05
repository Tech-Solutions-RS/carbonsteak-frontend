import { api } from './api';

export async function login(correo: string, contrasena: string) {
  const res = await api.post('/usuarios/login', { correo, contrasena });
  return res.data;
}
