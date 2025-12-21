import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.API_URL || 'https://api.sentinela.app',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

export { apiClient };