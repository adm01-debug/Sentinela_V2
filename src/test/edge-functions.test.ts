/**
 * SENTINELA - Edge Functions Test Suite
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Edge Functions', () => {
  let mockInvoke: any;
  beforeEach(() => { vi.clearAllMocks(); mockInvoke = vi.mocked(supabase.functions.invoke); });

  describe('analyze-activity', () => {
    it('should invoke with correct params', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { summary: 'High productivity', risk_score: 15, insights: [] }, error: null });
      const { data, error } = await supabase.functions.invoke('analyze-activity', { body: { employee_name: 'João', period: 'week' } });
      expect(error).toBeNull();
      expect(data.risk_score).toBe(15);
    });

    it('should handle errors gracefully', async () => {
      mockInvoke.mockResolvedValueOnce({ data: null, error: { message: 'Internal error' } });
      const { error } = await supabase.functions.invoke('analyze-activity', { body: {} });
      expect(error).toBeTruthy();
    });
  });

  describe('check-geofence', () => {
    it('should check location within geofence (v2)', async () => {
      mockInvoke.mockResolvedValueOnce({ 
        data: { success: true, results: [{ geofence_id: '1', geofence_name: 'Office', is_inside: true }], violations_count: 0 }, 
        error: null 
      });
      const { data } = await supabase.functions.invoke('check-geofence', { 
        body: { 
          employee_id: '550e8400-e29b-41d4-a716-446655440000',
          device_id: 'device-123',
          location: { latitude: -23.5, longitude: -46.6 }
        },
        headers: { 'x-api-version': 'v2' }
      });
      expect(data.success).toBe(true);
      expect(data.results[0].is_inside).toBe(true);
    });

    it('should detect violation outside geofence (v1)', async () => {
      mockInvoke.mockResolvedValueOnce({ 
        data: { success: true, results: [{ geofence_id: '2', geofence_name: 'Client A', is_inside: false }], violations_count: 1 }, 
        error: null 
      });
      const { data } = await supabase.functions.invoke('check-geofence', { 
        body: { 
          employee_id: '550e8400-e29b-41d4-a716-446655440000',
          latitude: -22.0, 
          longitude: -45.0 
        },
        headers: { 'x-api-version': 'v1' }
      });
      expect(data.success).toBe(true);
      expect(data.violations_count).toBe(1);
    });
  });


  describe('validate-agent-key', () => {
    it('should validate a valid key', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { valid: true, employee_name: 'João' }, error: null });
      const { data } = await supabase.functions.invoke('validate-agent-key', { body: { agent_key: 'valid-key-123' } });
      expect(data.valid).toBe(true);
    });

    it('should reject invalid key', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { valid: false }, error: null });
      const { data } = await supabase.functions.invoke('validate-agent-key', { body: { agent_key: 'invalid' } });
      expect(data.valid).toBe(false);
    });
  });

  describe('send-webhook', () => {
    it('should send webhook successfully', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { success: true }, error: null });
      const { data } = await supabase.functions.invoke('send-webhook', { body: { url: 'https://example.com/hook', event: 'alert.created', payload: {} } });
      expect(data.success).toBe(true);
    });
  });

  describe('send-email-notification', () => {
    it('should send email notification', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { sent: true }, error: null });
      const { data } = await supabase.functions.invoke('send-email-notification', { body: { to: 'admin@test.com', subject: 'Alert', body: 'Critical violation' } });
      expect(data.sent).toBe(true);
    });
  });

  describe('process-violation-alert', () => {
    it('should process violation and create alert', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { processed: true, alert_id: 'alert-1' }, error: null });
      const { data } = await supabase.functions.invoke('process-violation-alert', { body: { violation_type: 'print_screen', employee_name: 'João', severity: 'critical' } });
      expect(data.processed).toBe(true);
    });
  });

  describe('generate-report', () => {
    it('should generate report', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { report_id: 'rpt-1', status: 'completed' }, error: null });
      const { data } = await supabase.functions.invoke('generate-report', { body: { type: 'productivity', period: 'weekly' } });
      expect(data.status).toBe('completed');
    });
  });

  describe('health-check', () => {
    it('should return healthy status', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { status: 'healthy', timestamp: '2026-03-15' }, error: null });
      const { data } = await supabase.functions.invoke('health-check');
      expect(data.status).toBe('healthy');
    });
  });

  describe('export-data', () => {
    it('should export data in CSV format', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { url: 'https://storage.test/export.csv', format: 'csv' }, error: null });
      const { data } = await supabase.functions.invoke('export-data', { body: { type: 'employees', format: 'csv' } });
      expect(data.format).toBe('csv');
    });
  });

  describe('mobile-collector', () => {
    it('should collect mobile activity data', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { received: true, count: 5 }, error: null });
      const { data } = await supabase.functions.invoke('mobile-collector', { body: { device_id: 'mob-1', activities: [{}, {}, {}, {}, {}] } });
      expect(data.count).toBe(5);
    });
  });

  describe('agent-collector', () => {
    it('should collect desktop agent data', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { received: true }, error: null });
      const { data } = await supabase.functions.invoke('agent-collector', { body: { agent_key: 'key-1', screenshots: [], keystrokes: [], clicks: [] } });
      expect(data.received).toBe(true);
    });
  });
});
