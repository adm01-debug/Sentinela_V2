import dns from 'dns';
import { promisify } from 'util';

const resolve = promisify(dns.resolve);

export async function resolveDNS(hostname: string) {
  try { return await resolve(hostname); }
  catch { return null; }
}