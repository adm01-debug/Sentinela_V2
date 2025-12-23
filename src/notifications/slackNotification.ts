interface SlackMessage { channel: string; text: string; blocks?: any[]; }
export async function sendSlackMessage(message: SlackMessage): Promise<boolean> {
  try { const { api } = await import('@/plugins/axios'); await api.post('/notifications/slack', message); return true; } catch { return false; }
}
export function createSlackBlock(type: 'section' | 'header' | 'divider', text?: string) {
  if (type === 'divider') return { type };
  return { type, text: { type: 'mrkdwn', text } };
}
