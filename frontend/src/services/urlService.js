import axios from 'axios';
const API_URL = 'http://localhost:3000/api/urls';

export const shortenUrl = async (originalUrl) => {
  const response = await axios.post(`${API_URL}/shorten`, { originalUrl });
  return response.data;
};

export const getHistory = async (userId) => {
  const response = await axios.get(`${API_URL}/history/${userId}`);
  return response.data;
};