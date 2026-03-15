import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SlackBlock {
  type: string;
  text?: { type: string; text: string };
  [key: string]: unknown;
}

export function useSlackNotification() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(async (text: string, channel?: string, blocks?: SlackBlock[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('send-slack-notification', {
        body: { text, channel, blocks },
      });
      if (fnError) throw fnError;
      return data;
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Slack notification failed'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendAlert = useCallback(async (title: string, message: string, severity: 'info' | 'warning' | 'error') => {
    const blocks: SlackBlock[] = [
      { type: 'section', text: { type: 'mrkdwn', text: `*${severity.toUpperCase()}*: ${title}` } },
      { type: 'section', text: { type: 'mrkdwn', text: message } },
    ];
    return sendMessage(`[${severity.toUpperCase()}] ${title}: ${message}`, undefined, blocks);
  }, [sendMessage]);

  return { sendMessage, sendAlert, isLoading, error };
}

export default useSlackNotification;
