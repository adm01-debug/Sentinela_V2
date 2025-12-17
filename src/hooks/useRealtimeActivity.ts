import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface KeystrokeDetail {
  id: string;
  employee_name: string;
  key_pressed: string;
  app_name: string | null;
  window_title: string | null;
  device: string | null;
  recorded_at: string;
  is_sensitive: boolean | null;
}

interface ClickLog {
  id: string;
  employee_name: string;
  click_type: string;
  x_position: number | null;
  y_position: number | null;
  app_name: string | null;
  window_title: string | null;
  url: string | null;
  device: string | null;
  recorded_at: string;
}

interface ActivityStats {
  totalKeystrokes: number;
  totalClicks: number;
  activeEmployees: Set<string>;
  keystrokesPerMinute: number;
  clicksPerMinute: number;
}

export const useRealtimeActivity = () => {
  const [keystrokes, setKeystrokes] = useState<KeystrokeDetail[]>([]);
  const [clicks, setClicks] = useState<ClickLog[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    totalKeystrokes: 0,
    totalClicks: 0,
    activeEmployees: new Set(),
    keystrokesPerMinute: 0,
    clicksPerMinute: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchInitialData = async () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const [keystrokesRes, clicksRes] = await Promise.all([
      supabase
        .from('keystroke_details')
        .select('*')
        .gte('recorded_at', oneHourAgo.toISOString())
        .order('recorded_at', { ascending: false })
        .limit(100),
      supabase
        .from('click_logs')
        .select('*')
        .gte('recorded_at', oneHourAgo.toISOString())
        .order('recorded_at', { ascending: false })
        .limit(100),
    ]);

    if (keystrokesRes.data) {
      setKeystrokes(keystrokesRes.data);
    }
    if (clicksRes.data) {
      setClicks(clicksRes.data);
    }

    updateStats(keystrokesRes.data || [], clicksRes.data || []);
    setLoading(false);
  };

  const updateStats = (keystrokeData: KeystrokeDetail[], clickData: ClickLog[]) => {
    const employees = new Set<string>();
    keystrokeData.forEach(k => employees.add(k.employee_name));
    clickData.forEach(c => employees.add(c.employee_name));

    const now = new Date().getTime();
    const oneMinuteAgo = now - 60 * 1000;

    const recentKeystrokes = keystrokeData.filter(
      k => new Date(k.recorded_at).getTime() > oneMinuteAgo
    ).length;
    const recentClicks = clickData.filter(
      c => new Date(c.recorded_at).getTime() > oneMinuteAgo
    ).length;

    setStats({
      totalKeystrokes: keystrokeData.length,
      totalClicks: clickData.length,
      activeEmployees: employees,
      keystrokesPerMinute: recentKeystrokes,
      clicksPerMinute: recentClicks,
    });
  };

  useEffect(() => {
    fetchInitialData();

    // Subscribe to real-time updates
    const keystrokesChannel = supabase
      .channel('keystroke-details-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'keystroke_details',
        },
        (payload) => {
          const newKeystroke = payload.new as KeystrokeDetail;
          setKeystrokes(prev => {
            const updated = [newKeystroke, ...prev].slice(0, 100);
            updateStats(updated, clicks);
            return updated;
          });
        }
      )
      .subscribe();

    const clicksChannel = supabase
      .channel('click-logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'click_logs',
        },
        (payload) => {
          const newClick = payload.new as ClickLog;
          setClicks(prev => {
            const updated = [newClick, ...prev].slice(0, 100);
            updateStats(keystrokes, updated);
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(keystrokesChannel);
      supabase.removeChannel(clicksChannel);
    };
  }, []);

  return { keystrokes, clicks, stats, loading, refetch: fetchInitialData };
};
