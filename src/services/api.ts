import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL,
});

/**
 * Evento que el interceptor emite cuando una peticion protegida responde 401.
 * AuthContext lo escucha para limpiar la sesion y redirigir a /login.
 * El interceptor vive fuera del Router, asi que no puede navegar por si mismo.
 */
export const EVENTO_SESION_EXPIRADA = 'carbonsteak:sesion-expirada';

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const response = error.response;
    const status = response?.status;
    const url = error.config?.url ?? '';

    /**
     * Un 401 en /usuarios/login o /usuarios/registro es credenciales invalidas,
     * no sesion expirada. Si lo trataramos como logout vaciaramos la pantalla
     * de error del formulario y, con la redireccion, podriamos provocation un
     * bucle. Solo las peticiones al resto de endpoints expirados cierran sesion.
     */
    const esPeticionDeCredenciales =
      url.includes('/usuarios/login') || url.includes('/usuarios/registro');

    if (status === 401 && !esPeticionDeCredenciales) {
      window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
    }

    if (response && response.data) {
      const data = response.data;
      if (data && typeof data === 'object') {
        return Promise.reject({ status, ...data });
      }
      return Promise.reject({ status, error: String(data) });
    }
    return Promise.reject({
      status,
      error: error.message || 'Error desconocido',
      codigo: String(status || 'UNKNOWN'),
      timestamp: new Date().toISOString(),
    });
  }
);