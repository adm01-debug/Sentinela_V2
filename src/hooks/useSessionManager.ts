import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface Session {
  id: string;
  userId: string;
  device: string;
  browser: string;
  ip: string;
  location?: string;
  createdAt: Date;
  lastActivity: Date;
  current: boolean;
}

export const SESSIONS_QUERY_KEY = ["user-sessions"];

const UNKNOWN_DEVICE = "Dispositivo desconhecido";
const UNKNOWN_BROWSER = "Navegador desconhecido";

// user_sessions guarda uma linha por dispositivo/navegador. Sem isto, o
// "dispositivo atual" era um uuid do localStorage que nunca casava com
// user_sessions.id, e "encerrar todas as outras" apagava tambem a atual.
export function describeDevice(userAgent: string): { device: string; browser: string } {
  const ua = userAgent ?? "";

  let browser = UNKNOWN_BROWSER;
  if (/Edg\//.test(ua)) browser = "Microsoft Edge";
  else if (/OPR\/|Opera/.test(ua)) browser = "Opera";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua)) browser = "Safari";

  let device = UNKNOWN_DEVICE;
  if (/iPhone/.test(ua)) device = "iPhone";
  else if (/iPad/.test(ua)) device = "iPad";
  else if (/Android/.test(ua)) device = "Android";
  else if (/Windows/.test(ua)) device = "Windows";
  else if (/Macintosh|Mac OS X/.test(ua)) device = "Mac";
  else if (/Linux/.test(ua)) device = "Linux";

  return { device, browser };
}

function currentDevice(): { device: string; browser: string } {
  if (typeof navigator === "undefined") {
    return { device: UNKNOWN_DEVICE, browser: UNKNOWN_BROWSER };
  }
  return describeDevice(navigator.userAgent);
}

function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Falha ao falar com o servidor";
}

export function useSessionManager() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const sessionsQuery = useQuery({
    queryKey: SESSIONS_QUERY_KEY,
    queryFn: async (): Promise<{ sessions: Session[]; currentSessionId: string | null }> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return { sessions: [], currentSessionId: null };

      const userId = session.user.id;
      const { device, browser } = currentDevice();

      const { data: existing, error: lookupError } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("user_id", userId)
        .eq("device", device)
        .eq("browser", browser)
        .order("last_activity", { ascending: false });
      if (lookupError) throw lookupError;

      const rows = (existing ?? []) as Record<string, string>[];
      const lastSeen = new Date().toISOString();
      let currentSessionId: string | null = rows[0]?.id ?? null;

      if (currentSessionId) {
        const { error: touchError } = await supabase
          .from("user_sessions")
          .update({ last_activity: lastSeen })
          .eq("id", currentSessionId);
        if (touchError) throw touchError;
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("user_sessions")
          .insert({ user_id: userId, device, browser, last_activity: lastSeen })
          .select("id")
          .single();
        if (insertError) throw insertError;
        currentSessionId = (inserted as { id: string } | null)?.id ?? null;
      }

      const { data: list, error: listError } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("last_activity", { ascending: false });
      if (listError) throw listError;

      const sessions: Session[] = ((list ?? []) as Record<string, string>[]).map((row) => ({
        id: row.id,
        userId: row.user_id,
        device: row.device || UNKNOWN_DEVICE,
        browser: row.browser || UNKNOWN_BROWSER,
        ip: row.ip_address || "Nao registrado",
        location: row.location,
        createdAt: new Date(row.created_at),
        lastActivity: new Date(row.last_activity),
        current: row.id === currentSessionId || (row.device === device && row.browser === browser),
      }));

      return { sessions, currentSessionId };
    },
  });

  const sessions = sessionsQuery.data?.sessions ?? [];
  const currentSessionId = sessionsQuery.data?.currentSessionId ?? null;

  const revokeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      if (sessionId === currentSessionId) {
        throw new Error("O dispositivo atual nao pode ser encerrado");
      }
      const { error: deleteError } = await supabase
        .from("user_sessions")
        .delete()
        .eq("id", sessionId);
      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      setError(null);
      void queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
    },
    onError: (mutationError: unknown) => {
      setError(messageOf(mutationError));
      logger.error("Failed to revoke session:", mutationError);
    },
  });

  const revokeAllOthersMutation = useMutation({
    mutationFn: async () => {
      if (!currentSessionId) {
        throw new Error("Nao foi possivel identificar o dispositivo atual");
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessao expirada");
      const { error: deleteError } = await supabase
        .from("user_sessions")
        .delete()
        .eq("user_id", session.user.id)
        .neq("id", currentSessionId);
      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      setError(null);
      void queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
    },
    onError: (mutationError: unknown) => {
      setError(messageOf(mutationError));
      logger.error("Failed to revoke other sessions:", mutationError);
    },
  });

  return {
    sessions,
    currentSessionId,
    isLoading: sessionsQuery.isLoading,
    isRefreshing: sessionsQuery.isFetching && !sessionsQuery.isLoading,
    isError: sessionsQuery.isError,
    loadError: sessionsQuery.error ? messageOf(sessionsQuery.error) : null,
    error,
    clearError: () => setError(null),
    refresh: () => sessionsQuery.refetch(),
    revokeSession: (sessionId: string) => revokeSessionMutation.mutateAsync(sessionId),
    revokeAllOtherSessions: () => revokeAllOthersMutation.mutateAsync(),
    isRevoking: revokeSessionMutation.isPending || revokeAllOthersMutation.isPending,
    activeSessions: sessions.length,
  };
}

export default useSessionManager;
