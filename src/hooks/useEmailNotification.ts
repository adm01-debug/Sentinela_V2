import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EmailConfig {
  from?: string;
  replyTo?: string;
}

export function useEmailNotification(config: EmailConfig = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendEmail = useCallback(
    async (to: string | string[], subject: string, body: string, html?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          "send-email-notification",
          {
            body: {
              to: Array.isArray(to) ? to : [to],
              subject,
              text: body,
              html: html || body,
              from: config.from,
              replyTo: config.replyTo,
            },
          }
        );
        if (fnError) throw fnError;
        return data;
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Email failed"));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [config]
  );

  const sendTemplate = useCallback(
    async (to: string | string[], templateId: string, variables: Record<string, string>) => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          "send-email-notification",
          {
            body: { to: Array.isArray(to) ? to : [to], templateId, variables, from: config.from },
          }
        );
        if (fnError) throw fnError;
        return data;
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Email template failed"));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [config]
  );

  return { sendEmail, sendTemplate, isLoading, error };
}

export default useEmailNotification;
