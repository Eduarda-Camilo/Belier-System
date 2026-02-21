/**
 * Cliente HTTP para a API.
 * Desenvolvimento: baseURL '/api' (Vite faz proxy para localhost:3001).
 * Produção: use VITE_API_URL (ex.: https://seu-backend.onrender.com/api).
 */
import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL || '/api';
const baseURL = apiBase.endsWith('/api') ? apiBase : apiBase.replace(/\/$/, '') + '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
