import api from './api';

export const register = async (email, password, confirmPassword) => {
  const response = await api.post('/auth/register', { email, password, confirmPassword });
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const logout = async () => {
  await api.post('/auth/logout');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};