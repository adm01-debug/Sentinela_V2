import { supabase } from '@/lib/supabase';

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export async function createSession(userId: string, metadata?: { ip?: string; userAgent?: string }): Promise<Session> {
  const session = {
    user_id: userId,
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    ip_address: metadata?.ip,
    user_agent: metadata?.userAgent,
  };
  const { data } = await supabase.from('sessions').insert(session).select().single();
  return data;
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await supabase.from('sessions').delete().eq('id', sessionId);
}

export async function invalidateAllUserSessions(userId: string): Promise<void> {
  await supabase.from('sessions').delete().eq('user_id', userId);
}
