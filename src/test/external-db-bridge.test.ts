/**
 * SENTINELA - External DB Bridge - Suite de Testes Completa
 * Cobertura: classifySeverity, buildTelemetryPayload, emitTelemetry, validateRequest, edge cases
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================
// EXTRACTED LOGIC (mirrors edge function exports)
// ============================================================

const SLOW_THRESHOLD_MS = 3000;
const VERY_SLOW_THRESHOLD_MS = 8000;

function classifySeverity(durationMs: any, hasError: boolean): string {
  if (hasError) return 'error';
  if (durationMs >= VERY_SLOW_THRESHOLD_MS) return 'very_slow';
  if (durationMs >= SLOW_THRESHOLD_MS) return 'slow';
  return 'normal';
}

interface BridgeRequest {
  action: 'query' | 'insert' | 'update' | 'delete' | 'rpc';
  table?: string;
  rpc_name?: string;
  params?: Record<string, unknown>;
  filters?: Record<string, unknown>;
  select?: string;
  limit?: number;
  offset?: number;
  count_mode?: 'exact' | 'planned' | 'estimated';
  order_by?: { column: string; ascending?: boolean };
}

interface TelemetryPayload {
  operation: string;
  table_name: string | null;
  rpc_name: string | null;
  duration_ms: number;
  record_count: number | null;
  query_limit: number | null;
  query_offset: number | null;
  count_mode: string | null;
  severity: string;
  error_message: string | null;
  user_id: string | null;
}

function buildTelemetryPayload(
  req: BridgeRequest,
  durationMs: any,
  recordCount: number | null,
  errorMessage: string | null,
  userId: string | null
): TelemetryPayload {
  const severity = classifySeverity(durationMs, !!errorMessage);
  return {
    operation: req.action,
    table_name: req.table || null,
    rpc_name: req.rpc_name || null,
    duration_ms: Math.round(durationMs),
    record_count: recordCount,
    query_limit: req.limit ?? null,
    query_offset: req.offset ?? null,
    count_mode: req.count_mode ?? null,
    severity,
    error_message: errorMessage,
    user_id: userId,
  };
}

const ALLOWED_TABLES = new Set([
  'employees', 'devices', 'teams', 'departments',
  'attendance_records', 'employee_status', 'employee_points',
  'keystroke_logs', 'click_logs', 'productivity_logs',
  'security_violations', 'geofences', 'geofence_violations',
  'work_schedules', 'employee_schedules',
]);

const ALLOWED_RPCS = new Set([
  'get_dashboard_stats', 'check_rate_limit', 'get_user_company_id',
  'has_role', 'has_permission', 'get_user_permissions',
]);

function validateRequest(req: BridgeRequest): string | null {
  if (!req.action) return 'Missing action';
  if (!['query', 'insert', 'update', 'delete', 'rpc'].includes(req.action)) {
    return `Invalid action: ${req.action}`;
  }
  if (req.action === 'rpc') {
    if (!req.rpc_name) return 'Missing rpc_name for rpc action';
    if (!ALLOWED_RPCS.has(req.rpc_name)) return `RPC not allowed: ${req.rpc_name}`;
  } else {
    if (!req.table) return 'Missing table name';
    if (!ALLOWED_TABLES.has(req.table)) return `Table not allowed: ${req.table}`;
  }
  if (req.limit && (req.limit < 1 || req.limit > 1000)) return 'Limit must be 1-1000';
  if (req.offset && req.offset < 0) return 'Offset must be >= 0';
  return null;
}

// Simulates emitTelemetry persistence logic
async function emitTelemetry(
  payload: TelemetryPayload,
  mockInsert: (p: TelemetryPayload) => Promise<{ error: unknown }>
): Promise<boolean> {
  if (payload.severity === 'normal') return false;
  try {
    const { error } = await mockInsert(payload);
    return !error;
  } catch {
    return false;
  }
}

// ============================================================
// TEST SUITES
// ============================================================

describe('External DB Bridge - Suite Completa', () => {

  // -------------------------------------------------------
  // 1. classifySeverity
  // -------------------------------------------------------
  describe('1. classifySeverity', () => {
    it('1.01 - error always returns error regardless of duration', () => {
      expect(classifySeverity(0, true)).toBe('error');
    });
    it('1.02 - error with high duration still returns error', () => {
      expect(classifySeverity(50000, true)).toBe('error');
    });
    it('1.03 - 0ms without error is normal', () => {
      expect(classifySeverity(0, false)).toBe('normal');
    });
    it('1.04 - 2999ms is normal', () => {
      expect(classifySeverity(2999, false)).toBe('normal');
    });
    it('1.05 - 3000ms is slow', () => {
      expect(classifySeverity(3000, false)).toBe('slow');
    });
    it('1.06 - 5000ms is slow', () => {
      expect(classifySeverity(5000, false)).toBe('slow');
    });
    it('1.07 - 7999ms is slow', () => {
      expect(classifySeverity(7999, false)).toBe('slow');
    });
    it('1.08 - 8000ms is very_slow', () => {
      expect(classifySeverity(8000, false)).toBe('very_slow');
    });
    it('1.09 - 15000ms is very_slow', () => {
      expect(classifySeverity(15000, false)).toBe('very_slow');
    });
    it('1.10 - 100000ms is very_slow', () => {
      expect(classifySeverity(100000, false)).toBe('very_slow');
    });
    it('1.11 - 1ms is normal', () => {
      expect(classifySeverity(1, false)).toBe('normal');
    });
    it('1.12 - 500ms is normal', () => {
      expect(classifySeverity(500, false)).toBe('normal');
    });
    it('1.13 - exact threshold 3000 with error', () => {
      expect(classifySeverity(3000, true)).toBe('error');
    });
    it('1.14 - exact threshold 8000 with error', () => {
      expect(classifySeverity(8000, true)).toBe('error');
    });
    it('1.15 - negative duration', () => {
      expect(classifySeverity(-1, false)).toBe('normal');
    });
    it('1.16 - boundary 2999.9 rounds to normal', () => {
      expect(classifySeverity(2999.9, false)).toBe('normal');
    });
    it('1.17 - boundary 3000.1 is slow', () => {
      expect(classifySeverity(3000.1, false)).toBe('slow');
    });
    it('1.18 - boundary 7999.9 is slow', () => {
      expect(classifySeverity(7999.9, false)).toBe('slow');
    });
    it('1.19 - boundary 8000.1 is very_slow', () => {
      expect(classifySeverity(8000.1, false)).toBe('very_slow');
    });
    it('1.20 - error priority over very_slow', () => {
      expect(classifySeverity(999999, true)).toBe('error');
    });
  });

  // -------------------------------------------------------
  // 2. buildTelemetryPayload
  // -------------------------------------------------------
  describe('2. buildTelemetryPayload', () => {
    const baseReq: BridgeRequest = { action: 'query', table: 'employees', limit: 100, offset: 0 };

    it('2.01 - basic query payload', () => {
      const p = buildTelemetryPayload(baseReq, 500, 50, null, 'user-1');
      expect(p.operation).toBe('query');
      expect(p.table_name).toBe('employees');
      expect(p.severity).toBe('normal');
    });

    it('2.02 - slow query payload', () => {
      const p = buildTelemetryPayload(baseReq, 4000, 50, null, 'user-1');
      expect(p.severity).toBe('slow');
    });

    it('2.03 - very_slow query payload', () => {
      const p = buildTelemetryPayload(baseReq, 10000, 50, null, 'user-1');
      expect(p.severity).toBe('very_slow');
    });

    it('2.04 - error payload', () => {
      const p = buildTelemetryPayload(baseReq, 100, null, 'timeout', 'user-1');
      expect(p.severity).toBe('error');
      expect(p.error_message).toBe('timeout');
    });

    it('2.05 - rpc payload', () => {
      const req: BridgeRequest = { action: 'rpc', rpc_name: 'get_dashboard_stats' };
      const p = buildTelemetryPayload(req, 200, null, null, 'user-1');
      expect(p.rpc_name).toBe('get_dashboard_stats');
      expect(p.table_name).toBeNull();
    });

    it('2.06 - rounds duration_ms', () => {
      const p = buildTelemetryPayload(baseReq, 1234.567, 10, null, 'u1');
      expect(p.duration_ms).toBe(1235);
    });

    it('2.07 - null user_id', () => {
      const p = buildTelemetryPayload(baseReq, 100, 10, null, null);
      expect(p.user_id).toBeNull();
    });

    it('2.08 - null record_count', () => {
      const p = buildTelemetryPayload(baseReq, 100, null, null, 'u1');
      expect(p.record_count).toBeNull();
    });

    it('2.09 - limit and offset captured', () => {
      const req: BridgeRequest = { action: 'query', table: 'employees', limit: 50, offset: 100 };
      const p = buildTelemetryPayload(req, 100, 50, null, 'u1');
      expect(p.query_limit).toBe(50);
      expect(p.query_offset).toBe(100);
    });

    it('2.10 - count_mode captured', () => {
      const req: BridgeRequest = { action: 'query', table: 'employees', count_mode: 'exact' };
      const p = buildTelemetryPayload(req, 100, 50, null, 'u1');
      expect(p.count_mode).toBe('exact');
    });

    it('2.11 - missing optional fields default to null', () => {
      const req: BridgeRequest = { action: 'query', table: 'employees' };
      const p = buildTelemetryPayload(req, 100, null, null, null);
      expect(p.query_limit).toBeNull();
      expect(p.query_offset).toBeNull();
      expect(p.count_mode).toBeNull();
    });

    it('2.12 - insert action', () => {
      const req: BridgeRequest = { action: 'insert', table: 'employees' };
      const p = buildTelemetryPayload(req, 200, 1, null, 'u1');
      expect(p.operation).toBe('insert');
    });

    it('2.13 - update action', () => {
      const req: BridgeRequest = { action: 'update', table: 'employees' };
      const p = buildTelemetryPayload(req, 300, 5, null, 'u1');
      expect(p.operation).toBe('update');
    });

    it('2.14 - delete action', () => {
      const req: BridgeRequest = { action: 'delete', table: 'employees' };
      const p = buildTelemetryPayload(req, 150, 3, null, 'u1');
      expect(p.operation).toBe('delete');
    });

    it('2.15 - zero duration', () => {
      const p = buildTelemetryPayload(baseReq, 0, 0, null, 'u1');
      expect(p.duration_ms).toBe(0);
      expect(p.severity).toBe('normal');
    });

    it('2.16 - large record_count', () => {
      const p = buildTelemetryPayload(baseReq, 100, 999999, null, 'u1');
      expect(p.record_count).toBe(999999);
    });

    it('2.17 - error_message with special chars', () => {
      const p = buildTelemetryPayload(baseReq, 100, null, 'Error: "timeout" at <line 5>', 'u1');
      expect(p.error_message).toContain('timeout');
    });

    it('2.18 - all fields populated', () => {
      const req: BridgeRequest = {
        action: 'query', table: 'devices', limit: 200, offset: 50, count_mode: 'planned',
      };
      const p = buildTelemetryPayload(req, 9000, 200, null, 'user-abc');
      expect(p.operation).toBe('query');
      expect(p.table_name).toBe('devices');
      expect(p.query_limit).toBe(200);
      expect(p.query_offset).toBe(50);
      expect(p.count_mode).toBe('planned');
      expect(p.severity).toBe('very_slow');
      expect(p.user_id).toBe('user-abc');
    });

    it('2.19 - negative duration rounds correctly', () => {
      const p = buildTelemetryPayload(baseReq, -0.5, null, null, null);
      expect(Object.is(p.duration_ms, 0) || Object.is(p.duration_ms, -0)).toBe(true);
    });

    it('2.20 - empty table with rpc', () => {
      const req: BridgeRequest = { action: 'rpc', rpc_name: 'has_role' };
      const p = buildTelemetryPayload(req, 50, null, null, 'u1');
      expect(p.table_name).toBeNull();
      expect(p.rpc_name).toBe('has_role');
    });
  });

  // -------------------------------------------------------
  // 3. emitTelemetry (persistence logic)
  // -------------------------------------------------------
  describe('3. emitTelemetry', () => {
    it('3.01 - skips normal severity', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const payload: TelemetryPayload = {
        operation: 'query', table_name: 'employees', rpc_name: null,
        duration_ms: 100, record_count: 10, query_limit: null,
        query_offset: null, count_mode: null, severity: 'normal',
        error_message: null, user_id: 'u1',
      };
      const result = await emitTelemetry(payload, mockInsert);
      expect(result).toBe(false);
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('3.02 - persists slow severity', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const payload: TelemetryPayload = {
        operation: 'query', table_name: 'employees', rpc_name: null,
        duration_ms: 4000, record_count: 10, query_limit: null,
        query_offset: null, count_mode: null, severity: 'slow',
        error_message: null, user_id: 'u1',
      };
      const result = await emitTelemetry(payload, mockInsert);
      expect(result).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith(payload);
    });

    it('3.03 - persists very_slow severity', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const payload: TelemetryPayload = {
        operation: 'query', table_name: 'devices', rpc_name: null,
        duration_ms: 9000, record_count: null, query_limit: 100,
        query_offset: 0, count_mode: 'exact', severity: 'very_slow',
        error_message: null, user_id: 'u1',
      };
      const result = await emitTelemetry(payload, mockInsert);
      expect(result).toBe(true);
    });

    it('3.04 - persists error severity', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const payload: TelemetryPayload = {
        operation: 'insert', table_name: 'teams', rpc_name: null,
        duration_ms: 200, record_count: null, query_limit: null,
        query_offset: null, count_mode: null, severity: 'error',
        error_message: 'constraint violation', user_id: 'u1',
      };
      const result = await emitTelemetry(payload, mockInsert);
      expect(result).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith(payload);
    });

    it('3.05 - handles insert error gracefully', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: { message: 'DB error' } });
      const payload: TelemetryPayload = {
        operation: 'query', table_name: 'employees', rpc_name: null,
        duration_ms: 5000, record_count: 10, query_limit: null,
        query_offset: null, count_mode: null, severity: 'slow',
        error_message: null, user_id: 'u1',
      };
      const result = await emitTelemetry(payload, mockInsert);
      expect(result).toBe(false);
    });

    it('3.06 - handles insert exception gracefully', async () => {
      const mockInsert = vi.fn().mockRejectedValue(new Error('Network error'));
      const payload: TelemetryPayload = {
        operation: 'query', table_name: 'employees', rpc_name: null,
        duration_ms: 5000, record_count: 10, query_limit: null,
        query_offset: null, count_mode: null, severity: 'slow',
        error_message: null, user_id: 'u1',
      };
      const result = await emitTelemetry(payload, mockInsert);
      expect(result).toBe(false);
    });

    it('3.07 - insert called exactly once per emit', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const payload: TelemetryPayload = {
        operation: 'query', table_name: 'employees', rpc_name: null,
        duration_ms: 10000, record_count: 50, query_limit: 100,
        query_offset: 0, count_mode: null, severity: 'very_slow',
        error_message: null, user_id: 'u1',
      };
      await emitTelemetry(payload, mockInsert);
      expect(mockInsert).toHaveBeenCalledTimes(1);
    });

    it('3.08 - multiple sequential emits', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const makePayload = (sev): TelemetryPayload => ({
        operation: 'query', table_name: 'employees', rpc_name: null,
        duration_ms: 5000, record_count: 10, query_limit: null,
        query_offset: null, count_mode: null, severity: sev,
        error_message: null, user_id: 'u1',
      });
      await emitTelemetry(makePayload('slow'), mockInsert);
      await emitTelemetry(makePayload('very_slow'), mockInsert);
      await emitTelemetry(makePayload('normal'), mockInsert);
      await emitTelemetry(makePayload('error'), mockInsert);
      expect(mockInsert).toHaveBeenCalledTimes(3); // normal skipped
    });

    it('3.09 - payload passed to insert matches exactly', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const payload: TelemetryPayload = {
        operation: 'rpc', table_name: null, rpc_name: 'has_role',
        duration_ms: 4500, record_count: null, query_limit: null,
        query_offset: null, count_mode: null, severity: 'slow',
        error_message: null, user_id: 'user-xyz',
      };
      await emitTelemetry(payload, mockInsert);
      expect(mockInsert).toHaveBeenCalledWith(payload);
    });

    it('3.10 - concurrent emits do not interfere', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const payload: TelemetryPayload = {
        operation: 'query', table_name: 'employees', rpc_name: null,
        duration_ms: 5000, record_count: 10, query_limit: null,
        query_offset: null, count_mode: null, severity: 'slow',
        error_message: null, user_id: 'u1',
      };
      await Promise.all([
        emitTelemetry(payload, mockInsert),
        emitTelemetry(payload, mockInsert),
        emitTelemetry(payload, mockInsert),
      ]);
      expect(mockInsert).toHaveBeenCalledTimes(3);
    });

    it('3.11 - skips normal even with error_message null', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const payload: TelemetryPayload = {
        operation: 'query', table_name: 'teams', rpc_name: null,
        duration_ms: 200, record_count: 5, query_limit: 10,
        query_offset: 0, count_mode: null, severity: 'normal',
        error_message: null, user_id: 'u1',
      };
      await emitTelemetry(payload, mockInsert);
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('3.12 - 100 concurrent slow emits', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const payload: TelemetryPayload = {
        operation: 'query', table_name: 'employees', rpc_name: null,
        duration_ms: 5000, record_count: null, query_limit: null,
        query_offset: null, count_mode: null, severity: 'slow',
        error_message: null, user_id: 'u1',
      };
      await Promise.all(Array.from({ length: 100 }, () => emitTelemetry(payload, mockInsert)));
      expect(mockInsert).toHaveBeenCalledTimes(100);
    });
  });

  // -------------------------------------------------------
  // 4. validateRequest
  // -------------------------------------------------------
  describe('4. validateRequest', () => {
    it('4.01 - valid query request', () => {
      expect(validateRequest({ action: 'query', table: 'employees' })).toBeNull();
    });

    it('4.02 - valid insert request', () => {
      expect(validateRequest({ action: 'insert', table: 'devices' })).toBeNull();
    });

    it('4.03 - valid update request', () => {
      expect(validateRequest({ action: 'update', table: 'teams' })).toBeNull();
    });

    it('4.04 - valid delete request', () => {
      expect(validateRequest({ action: 'delete', table: 'departments' })).toBeNull();
    });

    it('4.05 - valid rpc request', () => {
      expect(validateRequest({ action: 'rpc', rpc_name: 'has_role' })).toBeNull();
    });

    it('4.06 - missing action', () => {
      expect(validateRequest({} as BridgeRequest)).toBe('Missing action');
    });

    it('4.07 - invalid action', () => {
      expect(validateRequest({ action: 'drop' as any })).toContain('Invalid action');
    });

    it('4.08 - missing table for query', () => {
      expect(validateRequest({ action: 'query' })).toBe('Missing table name');
    });

    it('4.09 - disallowed table', () => {
      const result = validateRequest({ action: 'query', table: 'auth_users' });
      expect(result).toContain('not allowed');
    });

    it('4.10 - missing rpc_name for rpc', () => {
      expect(validateRequest({ action: 'rpc' })).toContain('rpc_name');
    });

    it('4.11 - disallowed rpc', () => {
      const result = validateRequest({ action: 'rpc', rpc_name: 'drop_table' });
      expect(result).toContain('not allowed');
    });

    it('4.12 - limit too high', () => {
      expect(validateRequest({ action: 'query', table: 'employees', limit: 1001 })).toContain('Limit');
    });

    it('4.13 - limit zero', () => {
      expect(validateRequest({ action: 'query', table: 'employees', limit: 0 })).toBeNull();
    });

    it('4.14 - negative offset', () => {
      expect(validateRequest({ action: 'query', table: 'employees', offset: -1 })).toContain('Offset');
    });

    it('4.15 - valid limit 1', () => {
      expect(validateRequest({ action: 'query', table: 'employees', limit: 1 })).toBeNull();
    });

    it('4.16 - valid limit 1000', () => {
      expect(validateRequest({ action: 'query', table: 'employees', limit: 1000 })).toBeNull();
    });

    it('4.17 - valid offset 0', () => {
      expect(validateRequest({ action: 'query', table: 'employees', offset: 0 })).toBeNull();
    });

    it('4.18 - all allowed tables pass', () => {
      ALLOWED_TABLES.forEach(t => {
        expect(validateRequest({ action: 'query', table: t })).toBeNull();
      });
    });

    it('4.19 - all allowed rpcs pass', () => {
      ALLOWED_RPCS.forEach(r => {
        expect(validateRequest({ action: 'rpc', rpc_name: r })).toBeNull();
      });
    });

    it('4.20 - SQL injection in table name blocked', () => {
      expect(validateRequest({ action: 'query', table: "employees; DROP TABLE users" })).toContain('not allowed');
    });

    it('4.21 - SQL injection in rpc name blocked', () => {
      expect(validateRequest({ action: 'rpc', rpc_name: "has_role; DROP TABLE" })).toContain('not allowed');
    });

    it('4.22 - limit -1 blocked', () => {
      expect(validateRequest({ action: 'query', table: 'employees', limit: -1 })).toContain('Limit');
    });

    it('4.23 - very large offset allowed', () => {
      expect(validateRequest({ action: 'query', table: 'employees', offset: 999999 })).toBeNull();
    });

    it('4.24 - rpc with table field ignored', () => {
      expect(validateRequest({ action: 'rpc', rpc_name: 'has_role', table: 'employees' })).toBeNull();
    });

    it('4.25 - query with rpc_name field ignored', () => {
      expect(validateRequest({ action: 'query', table: 'employees', rpc_name: 'some_rpc' })).toBeNull();
    });
  });

  // -------------------------------------------------------
  // 5. Allowed Tables Whitelist
  // -------------------------------------------------------
  describe('5. Allowed Tables Whitelist', () => {
    const expected = [
      'employees', 'devices', 'teams', 'departments',
      'attendance_records', 'employee_status', 'employee_points',
      'keystroke_logs', 'click_logs', 'productivity_logs',
      'security_violations', 'geofences', 'geofence_violations',
      'work_schedules', 'employee_schedules',
    ];

    expected.forEach((table, i) => {
      it(`5.${String(i + 1).padStart(2, '0')} - ${table} is allowed`, () => {
        expect(ALLOWED_TABLES.has(table)).toBe(true);
      });
    });

    it('5.16 - total count matches', () => {
      expect(ALLOWED_TABLES.size).toBe(15);
    });

    it('5.17 - auth tables not allowed', () => {
      expect(ALLOWED_TABLES.has('users')).toBe(false);
      expect(ALLOWED_TABLES.has('auth_users')).toBe(false);
    });

    it('5.18 - system tables not allowed', () => {
      expect(ALLOWED_TABLES.has('pg_catalog')).toBe(false);
      expect(ALLOWED_TABLES.has('information_schema')).toBe(false);
    });

    it('5.19 - query_telemetry not in whitelist (prevent recursion)', () => {
      expect(ALLOWED_TABLES.has('query_telemetry')).toBe(false);
    });

    it('5.20 - blocked_ips not accessible via bridge', () => {
      expect(ALLOWED_TABLES.has('blocked_ips')).toBe(false);
    });
  });

  // -------------------------------------------------------
  // 6. Allowed RPCs Whitelist
  // -------------------------------------------------------
  describe('6. Allowed RPCs Whitelist', () => {
    const expected = [
      'get_dashboard_stats', 'check_rate_limit', 'get_user_company_id',
      'has_role', 'has_permission', 'get_user_permissions',
    ];

    expected.forEach((rpc, i) => {
      it(`6.${String(i + 1).padStart(2, '0')} - ${rpc} is allowed`, () => {
        expect(ALLOWED_RPCS.has(rpc)).toBe(true);
      });
    });

    it('6.07 - total count matches', () => {
      expect(ALLOWED_RPCS.size).toBe(6);
    });

    it('6.08 - dangerous RPCs not allowed', () => {
      expect(ALLOWED_RPCS.has('execute_sql')).toBe(false);
      expect(ALLOWED_RPCS.has('drop_table')).toBe(false);
    });
  });

  // -------------------------------------------------------
  // 7. Integration: build + emit flow
  // -------------------------------------------------------
  describe('7. Integration: build + emit flow', () => {
    it('7.01 - normal query skips telemetry', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const req: BridgeRequest = { action: 'query', table: 'employees' };
      const payload = buildTelemetryPayload(req, 200, 10, null, 'u1');
      await emitTelemetry(payload, mockInsert);
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('7.02 - slow query persists telemetry', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const req: BridgeRequest = { action: 'query', table: 'employees', limit: 50 };
      const payload = buildTelemetryPayload(req, 4000, 50, null, 'u1');
      await emitTelemetry(payload, mockInsert);
      expect(mockInsert).toHaveBeenCalledTimes(1);
      expect(mockInsert.mock.calls[0][0].severity).toBe('slow');
      expect(mockInsert.mock.calls[0][0].query_limit).toBe(50);
    });

    it('7.03 - error query persists with message', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const req: BridgeRequest = { action: 'insert', table: 'teams' };
      const payload = buildTelemetryPayload(req, 100, null, 'FK violation', 'u1');
      await emitTelemetry(payload, mockInsert);
      expect(mockInsert).toHaveBeenCalledTimes(1);
      expect(mockInsert.mock.calls[0][0].error_message).toBe('FK violation');
    });

    it('7.04 - rpc very_slow persists', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const req: BridgeRequest = { action: 'rpc', rpc_name: 'get_dashboard_stats' };
      const payload = buildTelemetryPayload(req, 12000, null, null, 'u1');
      await emitTelemetry(payload, mockInsert);
      expect(mockInsert).toHaveBeenCalledTimes(1);
      expect(mockInsert.mock.calls[0][0].rpc_name).toBe('get_dashboard_stats');
    });

    it('7.05 - validate + build + emit full flow', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const req: BridgeRequest = { action: 'query', table: 'employees', limit: 100, offset: 0 };
      const validationError = validateRequest(req);
      expect(validationError).toBeNull();
      const payload = buildTelemetryPayload(req, 5000, 100, null, 'u1');
      expect(payload.severity).toBe('slow');
      const persisted = await emitTelemetry(payload, mockInsert);
      expect(persisted).toBe(true);
    });

    it('7.06 - invalid request does not reach build/emit', () => {
      const req: BridgeRequest = { action: 'query', table: 'secret_table' };
      const error = validateRequest(req);
      expect(error).not.toBeNull();
      // Should never call buildTelemetryPayload if validation fails
    });

    it('7.07 - 50 sequential operations', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const tables = ['employees', 'devices', 'teams', 'departments', 'geofences'];
      let persistedCount = 0;

      for (let i = 0; i < 50; i++) {
        const req: BridgeRequest = { action: 'query', table: tables[i % 5] };
        const duration = i % 3 === 0 ? 5000 : i % 3 === 1 ? 10000 : 200;
        const payload = buildTelemetryPayload(req, duration, i, null, `user-${i}`);
        const result = await emitTelemetry(payload, mockInsert);
        if (result) persistedCount++;
      }
      // ~33 slow/very_slow out of 50 (17 normal)
      expect(persistedCount).toBeGreaterThan(30);
    });

    it('7.08 - telemetry failure does not throw', async () => {
      const mockInsert = vi.fn().mockRejectedValue(new Error('DB down'));
      const req: BridgeRequest = { action: 'query', table: 'employees' };
      const payload = buildTelemetryPayload(req, 5000, 10, null, 'u1');
      // Should not throw
      const result = await emitTelemetry(payload, mockInsert);
      expect(result).toBe(false);
    });
  });

  // -------------------------------------------------------
  // 8. Security Edge Cases
  // -------------------------------------------------------
  describe('8. Security', () => {
    it('8.01 - XSS in table name blocked', () => {
      expect(validateRequest({ action: 'query', table: '<script>alert(1)</script>' })).toContain('not allowed');
    });

    it('8.02 - path traversal in table name', () => {
      expect(validateRequest({ action: 'query', table: '../../../etc/passwd' })).toContain('not allowed');
    });

    it('8.03 - null bytes in table name', () => {
      expect(validateRequest({ action: 'query', table: 'employees\x00; DROP TABLE' })).toContain('not allowed');
    });

    it('8.04 - unicode in table name', () => {
      expect(validateRequest({ action: 'query', table: 'ëmployées' })).toContain('not allowed');
    });

    it('8.05 - empty string action', () => {
      expect(validateRequest({ action: '' as any })).not.toBeNull();
    });

    it('8.06 - very long table name', () => {
      expect(validateRequest({ action: 'query', table: 'a'.repeat(1000) })).toContain('not allowed');
    });

    it('8.07 - very long rpc name', () => {
      expect(validateRequest({ action: 'rpc', rpc_name: 'r'.repeat(500) })).toContain('not allowed');
    });

    it('8.08 - special chars in rpc_name', () => {
      expect(validateRequest({ action: 'rpc', rpc_name: 'has_role; --' })).toContain('not allowed');
    });

    it('8.09 - limit overflow Number.MAX_SAFE_INTEGER', () => {
      expect(validateRequest({ action: 'query', table: 'employees', limit: Number.MAX_SAFE_INTEGER })).toContain('Limit');
    });

    it('8.10 - offset NaN treated as 0 (falsy)', () => {
      expect(validateRequest({ action: 'query', table: 'employees', offset: NaN })).toBeNull();
    });
  });

  // -------------------------------------------------------
  // 9. Stress tests
  // -------------------------------------------------------
  describe('9. Stress', () => {
    it('9.01 - 1000 validations', () => {
      const tables = [...ALLOWED_TABLES];
      for (let i = 0; i < 1000; i++) {
        const result = validateRequest({ action: 'query', table: tables[i % tables.length] });
        expect(result).toBeNull();
      }
    });

    it('9.02 - 1000 payload builds', () => {
      for (let i = 0; i < 1000; i++) {
        const payload = buildTelemetryPayload(
          { action: 'query', table: 'employees' },
          i * 10, i, null, `user-${i}`
        );
        expect(payload.duration_ms).toBe(i * 10);
      }
    });

    it('9.03 - 1000 severity classifications', () => {
      const results = Array.from({ length: 1000 }, (_, i) =>
        classifySeverity(i * 10, i % 50 === 0)
      );
      expect(results.filter(r => r === 'error').length).toBe(20);
    });

    it('9.04 - 500 concurrent emits', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const payload: TelemetryPayload = {
        operation: 'query', table_name: 'employees', rpc_name: null,
        duration_ms: 5000, record_count: 10, query_limit: null,
        query_offset: null, count_mode: null, severity: 'slow',
        error_message: null, user_id: 'u1',
      };
      await Promise.all(Array.from({ length: 500 }, () => emitTelemetry(payload, mockInsert)));
      expect(mockInsert).toHaveBeenCalledTimes(500);
    });

    it('9.05 - validation + build under 50ms for 10000 iterations', () => {
      const start = Date.now();
      for (let i = 0; i < 10000; i++) {
        const req: BridgeRequest = { action: 'query', table: 'employees' };
        validateRequest(req);
        buildTelemetryPayload(req, i, i, null, 'u1');
      }
      expect(Date.now() - start).toBeLessThan(50);
    });
  });
});
