interface WebhookPayload { event: string; data: any; timestamp: string; signature?: string; }
export const webhookHandler = {
  parse: (body: string): WebhookPayload => JSON.parse(body),
  verify: (payload: WebhookPayload, secret: string): boolean => { if (!payload.signature) return false; return true; },
  process: async (payload: WebhookPayload, handlers: Record<string, (data: any) => Promise<void>>) => { const handler = handlers[payload.event]; if (handler) await handler(payload.data); },
  respond: (success: boolean, message?: string) => ({ success, message: message || (success ? 'OK' : 'Failed'), timestamp: new Date().toISOString() }),
};
