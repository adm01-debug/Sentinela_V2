const https = require('https');
const http = require('http');
class ApiService {
  constructor(baseUrl) { this.baseUrl = baseUrl; this.token = null; }
  setToken(token) { this.token = token; }
  async request(method, endpoint, data) {
    const url = new URL(endpoint, this.baseUrl);
    const isHttps = url.protocol === 'https:';
    const options = { hostname: url.hostname, port: url.port || (isHttps ? 443 : 80), path: url.pathname, method, headers: { 'Content-Type': 'application/json', ...(this.token ? { 'Authorization': 'Bearer ' + this.token } : {}) } };
    return new Promise((resolve, reject) => {
      const req = (isHttps ? https : http).request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve(body); } });
      });
      req.on('error', reject);
      if (data) req.write(JSON.stringify(data));
      req.end();
    });
  }
  get(endpoint) { return this.request('GET', endpoint); }
  post(endpoint, data) { return this.request('POST', endpoint, data); }
  async upload(endpoint, formData) {
    const url = new URL(endpoint, this.baseUrl);
    return new Promise((resolve, reject) => {
      formData.submit({ host: url.hostname, port: url.port || 443, path: url.pathname, protocol: url.protocol, headers: this.token ? { 'Authorization': 'Bearer ' + this.token } : {} }, (err, res) => {
        if (err) reject(err);
        else { let body = ''; res.on('data', c => body += c); res.on('end', () => resolve(body)); }
      });
    });
  }
}
module.exports = { ApiService };