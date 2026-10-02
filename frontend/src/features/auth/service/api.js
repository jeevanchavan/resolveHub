import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  withCredentials: true,
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
