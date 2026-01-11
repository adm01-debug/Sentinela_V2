import AsyncStorage from '@react-native-async-storage/async-storage';
const BASE_URL = 'https://api.sentinela.com';
class ApiClient {
  token = null;
  setToken(token) { this.token = token; }
  async request(endpoint, options = {}) {
    const url = BASE_URL + endpoint + (options.params ? '?' + new URLSearchParams(options.params).toString() : '');
    const headers = { 'Content-Type': 'application/json', ...(this.token ? { Authorization: 'Bearer ' + this.token } : {}) };
    const response = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
    if (!response.ok) throw new Error('API Error: ' + response.status);
    return response.json();
  }
  get(endpoint, params) { return this.request(endpoint, { method: 'GET', params }); }
  post(endpoint, data) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(data) }); }
  put(endpoint, data) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(data) }); }
  delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); }
}
export const apiClient = new ApiClient();