import { useState, useCallback } from 'react';

interface SlackConfig { webhookUrl: string; channel?: string; username?: string; iconEmoji?: string; }

interface SlackBlock {
  type: string;
  text?: { type: string; text: string };
  [key: string]: unknown;
}

interface SlackPayload {
  text: string;
  channel?: string;
  username?: string;
  icon_emoji?: string;
  blocks?: SlackBlock[];
}

export function useSlackNotification(config: SlackConfig) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(async (text: string, blocks?: SlackBlock[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const payload: SlackPayload = { text, channel: config.channel, username: config.username, icon_emoji: config.iconEmoji };
      if (blocks) payload.blocks = blocks;
      const response = await fetch(config.webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error('Slack notification failed');
      return true;
    } catch (e) { setError(e instanceof Error ? e : new Error('Failed to send')); return false; }
    finally { setIsLoading(false); }
  }, [config]);

  const sendAlert = useCallback(async (title: string, message: string, severity: 'info' | 'warning' | 'error') => {
    const blocks: SlackBlock[] = [{ type: 'section', text: { type: 'mrkdwn', text: `*${severity.toUpperCase()}*: ${title}` } }, { type: 'section', text: { type: 'mrkdwn', text: `*${title}*\n${message}` } }];
    return sendMessage('', blocks);
  }, [sendMessage]);

  return { sendMessage, sendAlert, isLoading, error };
}
export default useSlackNotification;
