import * as https from 'https';

export function validateCertificate(hostname: string): Promise<boolean> {
  return new Promise((resolve) => {
    const req = https.request({ hostname, port: 443, method: 'GET' }, (res) => resolve(true));
    req.on('error', () => resolve(false));
    req.end();
  });
}