import { useState, useCallback } from 'react';

interface WebhookConfig { url: string; secret?: string; events: string[]; headers?: Record<string, string>; }

interface WebhookResponse {
  status: number;
  data: unknown;
  timestamp: Date;
}

export function useWebhook(config: WebhookConfig) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<WebhookResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const send = useCallback(async (event: string, payload) => {
    if (!config.events.includes(event) && !config.events.includes('*')) return null;
    setIsLoading(true);
    setError(null);
    try {
      const body = JSON.stringify({ event, timestamp: new Date().toISOString(), payload });
      const headers: Record<string, string> = { 'Content-Type': 'application/json', ...config.headers };
      if (config.secret) {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey('raw', encoder.encode(config.secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
        const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
        headers['X-Webhook-Signature'] = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
      }
      const response = await fetch(config.url, { method: 'POST', headers, body });
      const data = await response.json().catch(() => ({}));
      setLastResponse({ status: response.status, data, timestamp: new Date() });
      return data;
    } catch (e) { setError(e instanceof Error ? e : new Error('Webhook failed')); return null; }
    finally { setIsLoading(false); }
  }, [config]);

  const test = useCallback(() => send('test', { message: 'Test webhook' }), [send]);

  return { send, test, isLoading, lastResponse, error };
}
export default useWebhook;
