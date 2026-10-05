import { api } from './api';

const USUARIO_ID_KEY = 'usuarioId';

export async function getPerfil() {
  const usuarioId = localStorage.getItem(USUARIO_ID_KEY);
  if (!usuarioId) {
    throw new Error('No hay usuario identificado');
  }
  const res = await api.get(`/usuarios/${usuarioId}`);
  return res.data;
}