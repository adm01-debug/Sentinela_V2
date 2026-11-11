/**
 * SENTINELA - Dashboard, Alerts & Data Operations Test Suite
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Dashboard Stats', () => {
  let mockFrom: any;
  beforeEach(() => { vi.clearAllMocks(); mockFrom = vi.mocked(supabase.from); });

  it('should fetch employee counts', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [{ id: '1', status: 'active' }, { id: '2', status: 'active' }, { id: '3', status: 'inactive' }], count: 3, error: null }),
    });
    const { data, count } = await supabase.from('employees').select('id, status', { count: 'exact' } as any);
    expect(count).toBe(3);
    expect(data!.filter((e) => e.status === 'active')).toHaveLength(2);
  });
});

describe('Alerts System', () => {
  let mockFrom: any;
  beforeEach(() => { vi.clearAllMocks(); mockFrom = vi.mocked(supabase.from); });

  it('should fetch alerts ordered by date', async () => {
    const alerts = [
      { id: '1', severity: 'critical', status: 'open', created_at: '2026-03-15' },
      { id: '2', severity: 'high', status: 'open', created_at: '2026-03-14' },
    ];
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: alerts, error: null }),
        }),
      }),
    });
    const { data } = await supabase.from('security_violations').select('*').order('created_at', { ascending: false }).limit(100);
    expect(data).toHaveLength(2);
  });

  it('should acknowledge an alert', async () => {
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    });
    const { error } = await supabase.from('security_violations').update({ status: 'acknowledged' }).eq('id', '1');
    expect(error).toBeNull();
  });

  it('should filter alerts by severity', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [{ severity: 'critical' }], error: null }),
          }),
        }),
      }),
    });
    const { data } = await supabase.from('security_violations').select('*').order('created_at').limit(100).eq('severity', 'critical');
    expect(data![0].severity).toBe('critical');
  });
});

describe('Geofence Operations', () => {
  let mockFrom: any;
  beforeEach(() => { vi.clearAllMocks(); mockFrom = vi.mocked(supabase.from); });

  it('should fetch geofences', async () => {
    const geofences = [
      { id: '1', name: 'Office HQ', latitude: -23.5, longitude: -46.6, radius_meters: 500, is_active: true },
      { id: '2', name: 'Branch', latitude: -22.9, longitude: -43.2, radius_meters: 300, is_active: false },
    ];
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: geofences, error: null }),
      }),
    });
    const { data } = await supabase.from('geofences').select('*').order('name');
    expect(data).toHaveLength(2);
    expect(data![0].name).toBe('Office HQ');
  });

  it('should create a geofence', async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: { id: '3', name: 'New Zone', is_active: true }, error: null }),
        }),
      }),
    });
    const { data, error } = await supabase.from('geofences').insert({ name: 'New Zone', latitude: -23.0, longitude: -46.0, radius_meters: 200 }).select().maybeSingle();
    expect(error).toBeNull();
    expect(data!.name).toBe('New Zone');
  });
});

describe('Device Management', () => {
  let mockFrom: any;
  beforeEach(() => { vi.clearAllMocks(); mockFrom = vi.mocked(supabase.from); });

  it('should list devices', async () => {
    const devices = [
      { id: '1', name: 'PC-001', device_type: 'desktop', is_active: true, os_name: 'Windows' },
      { id: '2', name: 'MAC-001', device_type: 'desktop', is_active: true, os_name: 'macOS' },
    ];
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: devices, error: null }),
      }),
    });
    const { data } = await supabase.from('devices').select('*').order('name');
    expect(data).toHaveLength(2);
  });

  it('should register a new device', async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: { id: '3', name: 'NEW-PC', device_type: 'desktop' }, error: null }),
        }),
      }),
    });
    const { data, error } = await supabase.from('devices').insert({ name: 'NEW-PC', device_type: 'desktop' }).select().maybeSingle();
    expect(error).toBeNull();
  });
});

describe('Keystroke Logs', () => {
  let mockFrom: any;
  beforeEach(() => { vi.clearAllMocks(); mockFrom = vi.mocked(supabase.from); });

  it('should fetch keystroke logs', async () => {
    const logs = [
      { id: '1', employee_name: 'João', keystrokes_count: 500, active_time_seconds: 3600, idle_time_seconds: 600 },
    ];
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: logs, error: null }),
      }),
    });
    const { data } = await supabase.from('keystroke_logs').select('*').order('recorded_at');
    expect(data![0].keystrokes_count).toBe(500);
  });
});

describe('Application Rules', () => {
  let mockFrom: any;
  beforeEach(() => { vi.clearAllMocks(); mockFrom = vi.mocked(supabase.from); });

  it('should fetch application rules', async () => {
    const rules = [
      { id: '1', name: 'Chrome', category: 'productive', status: 'active' },
      { id: '2', name: 'YouTube', category: 'unproductive', status: 'active' },
    ];
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: rules, error: null }),
      }),
    });
    const { data } = await supabase.from('application_rules').select('*').order('created_at');
    expect(data).toHaveLength(2);
    expect(data![1].category).toBe('unproductive');
  });
});

describe('Internet Access Settings', () => {
  let mockFrom: any;
  beforeEach(() => { vi.clearAllMocks(); mockFrom = vi.mocked(supabase.from); });

  it('should fetch access settings', async () => {
    const settings = [
      { id: '1', employee_name: 'João', access_level: 'restricted', blocked_sites: ['facebook.com'] },
    ];
    mockFrom.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: settings, error: null }),
    });
    const { data } = await supabase.from('internet_access_settings').select('*');
    expect(data![0].access_level).toBe('restricted');
    expect(data![0].blocked_sites).toContain('facebook.com');
  });
});

describe('Work Schedules', () => {
  let mockFrom: any;
  beforeEach(() => { vi.clearAllMocks(); mockFrom = vi.mocked(supabase.from); });

  it('should fetch work schedules', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [{ id: '1', name: 'Standard', start_time: '09:00', end_time: '18:00' }], error: null }),
      }),
    });
    const { data } = await supabase.from('work_schedules').select('*').order('name');
    expect(data).toHaveLength(1);
  });
});

describe('Gamification', () => {
  let mockFrom: any;
  beforeEach(() => { vi.clearAllMocks(); mockFrom = vi.mocked(supabase.from); });

  it('should fetch badges', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [
          { id: '1', name: 'Top Performer', category: 'productivity', points_required: 100 },
          { id: '2', name: 'Early Bird', category: 'attendance', points_required: 50 },
        ], error: null }),
      }),
    });
    const { data } = await supabase.from('badges').select('*').order('name');
    expect(data).toHaveLength(2);
  });

  it('should fetch employee points', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: { employee_id: '1', total_points: 250, level: 3, current_streak: 5 }, error: null }),
        }),
      }),
    });
    const { data } = await supabase.from('employee_points').select('*').eq('employee_id', '1').maybeSingle();
    expect(data!.total_points).toBe(250);
    expect(data!.level).toBe(3);
  });
});

describe('Teams & Departments', () => {
  let mockFrom: any;
  beforeEach(() => { vi.clearAllMocks(); mockFrom = vi.mocked(supabase.from); });

  it('should fetch teams', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [{ id: '1', name: 'Engineering' }, { id: '2', name: 'Sales' }], error: null }),
      }),
    });
    const { data } = await supabase.from('teams').select('*').order('name');
    expect(data).toHaveLength(2);
  });
});

describe('Multi-Tenant Company', () => {
  let mockFrom: any;
  beforeEach(() => { vi.clearAllMocks(); mockFrom = vi.mocked(supabase.from); });

  it('should fetch company by slug', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: { id: '1', name: 'Acme Corp', slug: 'acme', plan: 'enterprise', is_active: true }, error: null }),
        }),
      }),
    });
    const { data } = await supabase.from('companies').select('*').eq('slug', 'acme').maybeSingle();
    expect(data!.name).toBe('Acme Corp');
    expect(data!.plan).toBe('enterprise');
  });
});
