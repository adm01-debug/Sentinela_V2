import * as os from 'os';

export function getNetworkInterfaces() {
  return os.networkInterfaces();
}

export function getNetworkStats() {
  const interfaces = os.networkInterfaces();
  return Object.keys(interfaces).map(name => ({ name, addresses: interfaces[name] }));
}