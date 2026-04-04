import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface Session { id: string; userId: string; device: string; browser: string; ip: string; location?: string; createdAt: Date; lastActivity: Date; current: boolean; }

export function useSessionManager() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data } = await supabase.from('user_sessions').select('*').eq('user_id', session.user.id).order('last_activity', { ascending: false });
      
      const mapped: Session[] = (data || []).map(s => ({
        id: s.id, userId: s.user_id, device: s.device || 'Unknown', browser: s.browser || 'Unknown',
        ip: s.ip_address || 'Unknown', location: s.location, createdAt: new Date(s.created_at),
        lastActivity: new Date(s.last_activity), current: s.id === currentSessionId
      }));
      setSessions(mapped);
    } catch (e) { logger.error('Failed to fetch sessions:', e); }
    finally { setIsLoading(false); }
  }, [currentSessionId]);

  const revokeSession = useCallback(async (sessionId: string) => {
    try {
      await supabase.from('user_sessions').delete().eq('id', sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      return true;
    } catch { return false; }
  }, []);

  const revokeAllOtherSessions = useCallback(async () => {
    if (!currentSessionId) return false;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;
      await supabase.from('user_sessions').delete().eq('user_id', session.user.id).neq('id', currentSessionId);
      await fetchSessions();
      return true;
    } catch { return false; }
  }, [currentSessionId, fetchSessions]);

  useEffect(() => {
    const id = localStorage.getItem('session_id') || crypto.randomUUID();
    localStorage.setItem('session_id', id);
    setCurrentSessionId(id);
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  return { sessions, currentSessionId, isLoading, fetchSessions, revokeSession, revokeAllOtherSessions, activeSessions: sessions.length };
}

export default useSessionManager;
