import api from './api';

export const shortenUrl = async (originalUrl) => {
  const response = await api.post('/urls/shorten', { originalUrl });
  return response.data;
};

export const getHistory = async () => {
  const response = await api.get('/urls/history');
  return response.data;
};

export const getStats = async (shortCode) => {
  const response = await api.get(`/urls/${shortCode}/stats`);
  return response.data;
};

export const getQRCode = async (shortCode, format = 'png') => {
  const response = await api.get(`/urls/${shortCode}/qr-code?format=${format}`);
  return response.data.data;
};

export const downloadQRCode = async (shortCode, format = 'png', size = 300) => {
  const response = await api.get(`/urls/${shortCode}/qr-code/download?format=${format}&size=${size}`, {
    responseType: 'blob',
  });
  return response.data;
};

export const deleteLink = async (id) => {
  const response = await api.delete(`/urls/links/${id}`);
  return response.data;
};