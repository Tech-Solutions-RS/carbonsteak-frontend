import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL,
});

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
