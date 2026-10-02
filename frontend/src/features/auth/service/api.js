import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  withCredentials: true,
});

// Attach Authorization Bearer token to all outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = async (name, email, password) => {
  const response = await api.post('/register', { name, email, password });
  return response.data;
};

export const login = async (emailOrUsername, password) => {
  const response = await api.post('/login', { emailOrUsername, password });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/get-me');
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/logout');
  return response.data;
};

export default api;
