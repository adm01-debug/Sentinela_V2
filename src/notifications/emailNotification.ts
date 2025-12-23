interface EmailOptions { to: string; subject: string; body: string; html?: string; attachments?: { name: string; content: string }[]; }
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try { const { api } = await import('@/plugins/axios'); await api.post('/notifications/email', options); return true; } catch { return false; }
}
export function createEmailTemplate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || '');
}
