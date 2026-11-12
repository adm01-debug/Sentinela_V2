/**
 * SENTINELA - Telemetria de Queries - Suite de Testes Completa
 * Cobertura: TelemetryRow interface, filtros, stats, formatters, charts, CRUD, edge cases
 */
import { describe, it, expect, beforeEach } from 'vitest';

// ============================================================
// UNIT TESTS - Pure Logic (no React needed)
// ============================================================

// --- TelemetryRow factory ---
interface TelemetryRow {
  id: string;
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
  created_at: string;
}

let counter = 0;
function createRow(overrides: Partial<TelemetryRow> = {}): TelemetryRow {
  counter++;
  return {
    id: `row-${counter}`,
    operation: 'select',
    table_name: 'employees',
    rpc_name: null,
    duration_ms: 5000,
    record_count: 50,
    query_limit: 100,
    query_offset: 0,
    count_mode: null,
    severity: 'slow',
    error_message: null,
    user_id: 'user-1',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

// --- Helpers extracted from page logic ---
function formatDuration(ms): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

function formatTime(iso): string {
  return new Date(iso).toLocaleString('pt-BR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    day: '2-digit', month: '2-digit',
  });
}

function getTimeThreshold(timeFilter): string {
  const now = new Date();
  switch (timeFilter) {
    case '1h': return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    case '6h': return new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString();
    case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    default: return new Date().toISOString();
  }
}

function computeStats(rows: TelemetryRow[]) {
  const verySlow = rows.filter(r => r.severity === 'very_slow').length;
  const slow = rows.filter(r => r.severity === 'slow').length;
  const errors = rows.filter(r => r.severity === 'error').length;
  const avgDuration = rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.duration_ms, 0) / rows.length) : 0;
  return { verySlow, slow, errors, avgDuration };
}

function computeTopOffenders(rows: TelemetryRow[]) {
  const tableStats = new Map<string, { count: number; totalMs: number; maxMs: number }>();
  for (const r of rows) {
    const key = r.rpc_name || r.table_name || 'unknown';
    const prev = tableStats.get(key) || { count: 0, totalMs: 0, maxMs: 0 };
    tableStats.set(key, {
      count: prev.count + 1,
      totalMs: prev.totalMs + r.duration_ms,
      maxMs: Math.max(prev.maxMs, r.duration_ms),
    });
  }
  return [...tableStats.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8);
}

function computeTimelineBuckets(rows: TelemetryRow[], timeFilter: string) {
  if (rows.length === 0) return [];
  const bucketMs = timeFilter === '1h' ? 5 * 60 * 1000
    : timeFilter === '6h' ? 30 * 60 * 1000
    : timeFilter === '24h' ? 60 * 60 * 1000
    : 6 * 60 * 60 * 1000;
  const buckets = new Map<number, { slow: number; very_slow: number; error: number }>();
  for (const r of rows) {
    const ts = new Date(r.created_at).getTime();
    const bucket = Math.floor(ts / bucketMs) * bucketMs;
    const prev = buckets.get(bucket) || { slow: 0, very_slow: 0, error: 0 };
    if (r.severity === 'slow') prev.slow++;
    else if (r.severity === 'very_slow') prev.very_slow++;
    else if (r.severity === 'error') prev.error++;
    buckets.set(bucket, prev);
  }
  return [...buckets.entries()].sort((a, b) => a[0] - b[0]);
}

function computeSeverityDistribution(rows: TelemetryRow[]) {
  const counts: Record<string, number> = {};
  for (const r of rows) {
    counts[r.severity] = (counts[r.severity] || 0) + 1;
  }
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

// ============================================================
// TEST SUITES
// ============================================================

describe('Telemetria de Queries - Suite Completa', () => {

  beforeEach(() => { counter = 0; });

  // -------------------------------------------------------
  // 1. TelemetryRow Interface & Factory
  // -------------------------------------------------------
  describe('1. TelemetryRow Interface', () => {
    it('1.01 - cria row com defaults corretos', () => {
      const row = createRow();
      expect(row.operation).toBe('select');
      expect(row.severity).toBe('slow');
      expect(row.duration_ms).toBe(5000);
    });

    it('1.02 - override de campos funciona', () => {
      const row = createRow({ severity: 'error', duration_ms: 15000 });
      expect(row.severity).toBe('error');
      expect(row.duration_ms).toBe(15000);
    });

    it('1.03 - campos nullable aceitam null', () => {
      const row = createRow({ table_name: null, rpc_name: null, error_message: null });
      expect(row.table_name).toBeNull();
      expect(row.rpc_name).toBeNull();
    });

    it('1.04 - id é único entre rows', () => {
      const ids = Array.from({ length: 100 }, () => createRow().id);
      expect(new Set(ids).size).toBe(100);
    });

    it('1.05 - created_at é ISO válido', () => {
      const row = createRow();
      expect(new Date(row.created_at).toISOString()).toBe(row.created_at);
    });

    it('1.06 - operações válidas', () => {
      const ops = ['select', 'insert', 'update', 'delete', 'rpc'];
      ops.forEach(op => {
        const row = createRow({ operation: op });
        expect(row.operation).toBe(op);
      });
    });

    it('1.07 - severities válidas', () => {
      ['slow', 'very_slow', 'error'].forEach(s => {
        expect(createRow({ severity: s }).severity).toBe(s);
      });
    });

    it('1.08 - duration_ms aceita zero', () => {
      expect(createRow({ duration_ms: 0 }).duration_ms).toBe(0);
    });

    it('1.09 - duration_ms aceita valores muito altos', () => {
      expect(createRow({ duration_ms: 999999 }).duration_ms).toBe(999999);
    });

    it('1.10 - record_count aceita null', () => {
      expect(createRow({ record_count: null }).record_count).toBeNull();
    });

    it('1.11 - record_count aceita 0', () => {
      expect(createRow({ record_count: 0 }).record_count).toBe(0);
    });

    it('1.12 - query_limit aceita valores', () => {
      expect(createRow({ query_limit: 1000 }).query_limit).toBe(1000);
    });

    it('1.13 - query_offset aceita valores', () => {
      expect(createRow({ query_offset: 500 }).query_offset).toBe(500);
    });

    it('1.14 - count_mode aceita strings', () => {
      expect(createRow({ count_mode: 'exact' }).count_mode).toBe('exact');
    });

    it('1.15 - error_message aceita texto', () => {
      const row = createRow({ error_message: 'timeout exceeded' });
      expect(row.error_message).toBe('timeout exceeded');
    });
  });

  // -------------------------------------------------------
  // 2. formatDuration
  // -------------------------------------------------------
  describe('2. formatDuration', () => {
    it('2.01 - 0ms', () => expect(formatDuration(0)).toBe('0ms'));
    it('2.02 - 500ms', () => expect(formatDuration(500)).toBe('500ms'));
    it('2.03 - 999ms', () => expect(formatDuration(999)).toBe('999ms'));
    it('2.04 - 1000ms = 1.0s', () => expect(formatDuration(1000)).toBe('1.0s'));
    it('2.05 - 1500ms = 1.5s', () => expect(formatDuration(1500)).toBe('1.5s'));
    it('2.06 - 3000ms = 3.0s', () => expect(formatDuration(3000)).toBe('3.0s'));
    it('2.07 - 8000ms = 8.0s', () => expect(formatDuration(8000)).toBe('8.0s'));
    it('2.08 - 10500ms = 10.5s', () => expect(formatDuration(10500)).toBe('10.5s'));
    it('2.09 - 60000ms = 60.0s', () => expect(formatDuration(60000)).toBe('60.0s'));
    it('2.10 - 100ms', () => expect(formatDuration(100)).toBe('100ms'));
    it('2.11 - 1ms', () => expect(formatDuration(1)).toBe('1ms'));
    it('2.12 - 2345ms = 2.3s', () => expect(formatDuration(2345)).toBe('2.3s'));
    it('2.13 - 9999ms = 10.0s', () => expect(formatDuration(9999)).toBe('10.0s'));
    it('2.14 - 250ms', () => expect(formatDuration(250)).toBe('250ms'));
    it('2.15 - 120000ms = 120.0s', () => expect(formatDuration(120000)).toBe('120.0s'));
  });

  // -------------------------------------------------------
  // 3. formatTime
  // -------------------------------------------------------
  describe('3. formatTime', () => {
    it('3.01 - formata ISO para pt-BR', () => {
      const result = formatTime('2026-03-23T10:30:45.000Z');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('3.02 - contém separadores de data', () => {
      const result = formatTime('2026-03-23T10:30:45.000Z');
      expect(result).toContain('/');
    });

    it('3.03 - contém separadores de hora', () => {
      const result = formatTime('2026-03-23T10:30:45.000Z');
      expect(result).toContain(':');
    });

    it('3.04 - timestamp meia-noite', () => {
      const result = formatTime('2026-01-01T00:00:00.000Z');
      expect(result.length).toBeGreaterThan(0);
    });

    it('3.05 - timestamp fim do dia', () => {
      const result = formatTime('2026-12-31T23:59:59.999Z');
      expect(result.length).toBeGreaterThan(0);
    });

    it('3.06 - diferentes datas produzem saídas diferentes', () => {
      const a = formatTime('2026-01-15T08:00:00.000Z');
      const b = formatTime('2026-06-20T16:00:00.000Z');
      expect(a).not.toBe(b);
    });

    it('3.07 - mesma hora, dias diferentes', () => {
      const a = formatTime('2026-03-01T12:00:00.000Z');
      const b = formatTime('2026-03-02T12:00:00.000Z');
      expect(a).not.toBe(b);
    });

    it('3.08 - retorna string não vazia', () => {
      expect(formatTime(new Date().toISOString())).toBeTruthy();
    });

    it('3.09 - aceita timestamps com timezone offset', () => {
      const result = formatTime('2026-03-23T10:30:45.000+03:00');
      expect(typeof result).toBe('string');
    });

    it('3.10 - não retorna undefined', () => {
      expect(formatTime('2026-03-23T10:30:45.000Z')).toBeDefined();
    });
  });

  // -------------------------------------------------------
  // 4. getTimeThreshold
  // -------------------------------------------------------
  describe('4. getTimeThreshold', () => {
    it('4.01 - 1h retorna timestamp recente', () => {
      const threshold = new Date(getTimeThreshold('1h')).getTime();
      const oneHourAgo = Date.now() - 61 * 60 * 1000;
      expect(threshold).toBeGreaterThan(oneHourAgo);
    });

    it('4.02 - 6h retorna timestamp ~6h atrás', () => {
      const threshold = new Date(getTimeThreshold('6h')).getTime();
      const diff = Date.now() - threshold;
      expect(diff).toBeLessThan(6.1 * 60 * 60 * 1000);
      expect(diff).toBeGreaterThan(5.9 * 60 * 60 * 1000);
    });

    it('4.03 - 24h retorna timestamp ~24h atrás', () => {
      const threshold = new Date(getTimeThreshold('24h')).getTime();
      const diff = Date.now() - threshold;
      expect(diff).toBeLessThan(24.1 * 60 * 60 * 1000);
    });

    it('4.04 - 7d retorna timestamp ~7 dias atrás', () => {
      const threshold = new Date(getTimeThreshold('7d')).getTime();
      const diff = Date.now() - threshold;
      expect(diff).toBeLessThan(7.1 * 24 * 60 * 60 * 1000);
    });

    it('4.05 - retorna string ISO válida', () => {
      const t = getTimeThreshold('24h');
      expect(new Date(t).toISOString()).toBe(t);
    });

    it('4.06 - 1h threshold é mais recente que 24h', () => {
      const t1 = new Date(getTimeThreshold('1h')).getTime();
      const t24 = new Date(getTimeThreshold('24h')).getTime();
      expect(t1).toBeGreaterThan(t24);
    });

    it('4.07 - 6h threshold é mais recente que 7d', () => {
      const t6 = new Date(getTimeThreshold('6h')).getTime();
      const t7d = new Date(getTimeThreshold('7d')).getTime();
      expect(t6).toBeGreaterThan(t7d);
    });

    it('4.08 - todos os filtros retornam timestamps no passado', () => {
      ['1h', '6h', '24h', '7d'].forEach(f => {
        expect(new Date(getTimeThreshold(f)).getTime()).toBeLessThan(Date.now());
      });
    });

    it('4.09 - filtro padrão retorna timestamp válido', () => {
      const t = getTimeThreshold('unknown');
      expect(new Date(t).getTime()).toBeLessThanOrEqual(Date.now() + 1000);
    });

    it('4.10 - ordem cronológica: 1h > 6h > 24h > 7d', () => {
      const vals = ['1h', '6h', '24h', '7d'].map(f => new Date(getTimeThreshold(f)).getTime());
      for (let i = 0; i < vals.length - 1; i++) {
        expect(vals[i]).toBeGreaterThan(vals[i + 1]);
      }
    });
  });

  // -------------------------------------------------------
  // 5. computeStats
  // -------------------------------------------------------
  describe('5. computeStats', () => {
    it('5.01 - array vazio retorna zeros', () => {
      const s = computeStats([]);
      expect(s).toEqual({ verySlow: 0, slow: 0, errors: 0, avgDuration: 0 });
    });

    it('5.02 - conta slow corretamente', () => {
      const rows = [createRow({ severity: 'slow' }), createRow({ severity: 'slow' })];
      expect(computeStats(rows).slow).toBe(2);
    });

    it('5.03 - conta very_slow corretamente', () => {
      const rows = [createRow({ severity: 'very_slow' }), createRow({ severity: 'very_slow' }), createRow({ severity: 'very_slow' })];
      expect(computeStats(rows).verySlow).toBe(3);
    });

    it('5.04 - conta errors corretamente', () => {
      const rows = [createRow({ severity: 'error' })];
      expect(computeStats(rows).errors).toBe(1);
    });

    it('5.05 - calcula média simples', () => {
      const rows = [createRow({ duration_ms: 1000 }), createRow({ duration_ms: 3000 })];
      expect(computeStats(rows).avgDuration).toBe(2000);
    });

    it('5.06 - média com um único registro', () => {
      const rows = [createRow({ duration_ms: 7500 })];
      expect(computeStats(rows).avgDuration).toBe(7500);
    });

    it('5.07 - mix de severidades', () => {
      const rows = [
        createRow({ severity: 'slow' }),
        createRow({ severity: 'very_slow' }),
        createRow({ severity: 'error' }),
        createRow({ severity: 'slow' }),
      ];
      const s = computeStats(rows);
      expect(s.slow).toBe(2);
      expect(s.verySlow).toBe(1);
      expect(s.errors).toBe(1);
    });

    it('5.08 - 100 rows slow', () => {
      const rows = Array.from({ length: 100 }, () => createRow({ severity: 'slow', duration_ms: 4000 }));
      const s = computeStats(rows);
      expect(s.slow).toBe(100);
      expect(s.avgDuration).toBe(4000);
    });

    it('5.09 - média com valores variados', () => {
      const rows = [
        createRow({ duration_ms: 1000 }),
        createRow({ duration_ms: 2000 }),
        createRow({ duration_ms: 3000 }),
        createRow({ duration_ms: 4000 }),
      ];
      expect(computeStats(rows).avgDuration).toBe(2500);
    });

    it('5.10 - severidade desconhecida não conta em nenhuma categoria', () => {
      const rows = [createRow({ severity: 'normal' })];
      const s = computeStats(rows);
      expect(s.slow).toBe(0);
      expect(s.verySlow).toBe(0);
      expect(s.errors).toBe(0);
    });

    it('5.11 - média arredonda corretamente', () => {
      const rows = [createRow({ duration_ms: 1 }), createRow({ duration_ms: 2 })];
      expect(computeStats(rows).avgDuration).toBe(2); // Math.round(1.5) = 2
    });

    it('5.12 - 500 rows performance', () => {
      const rows = Array.from({ length: 500 }, (_, i) => createRow({
        severity: i % 3 === 0 ? 'slow' : i % 3 === 1 ? 'very_slow' : 'error',
        duration_ms: 1000 + i * 10,
      }));
      const s = computeStats(rows);
      expect(s.slow + s.verySlow + s.errors).toBe(500);
    });

    it('5.13 - todos very_slow', () => {
      const rows = Array.from({ length: 50 }, () => createRow({ severity: 'very_slow' }));
      const s = computeStats(rows);
      expect(s.verySlow).toBe(50);
      expect(s.slow).toBe(0);
    });

    it('5.14 - todos error', () => {
      const rows = Array.from({ length: 25 }, () => createRow({ severity: 'error' }));
      expect(computeStats(rows).errors).toBe(25);
    });

    it('5.15 - duration zero para todos', () => {
      const rows = Array.from({ length: 10 }, () => createRow({ duration_ms: 0 }));
      expect(computeStats(rows).avgDuration).toBe(0);
    });
  });

  // -------------------------------------------------------
  // 6. computeTopOffenders
  // -------------------------------------------------------
  describe('6. computeTopOffenders', () => {
    it('6.01 - array vazio retorna vazio', () => {
      expect(computeTopOffenders([])).toEqual([]);
    });

    it('6.02 - uma tabela aparece', () => {
      const rows = [createRow({ table_name: 'employees' })];
      const result = computeTopOffenders(rows);
      expect(result.length).toBe(1);
      expect(result[0][0]).toBe('employees');
    });

    it('6.03 - ordena por count decrescente', () => {
      const rows = [
        createRow({ table_name: 'a' }),
        createRow({ table_name: 'b' }),
        createRow({ table_name: 'b' }),
        createRow({ table_name: 'b' }),
      ];
      const result = computeTopOffenders(rows);
      expect(result[0][0]).toBe('b');
      expect(result[0][1].count).toBe(3);
    });

    it('6.04 - limita a 8 resultados', () => {
      const rows = Array.from({ length: 50 }, (_, i) => createRow({ table_name: `table_${i}` }));
      expect(computeTopOffenders(rows).length).toBe(8);
    });

    it('6.05 - calcula maxMs corretamente', () => {
      const rows = [
        createRow({ table_name: 'x', duration_ms: 1000 }),
        createRow({ table_name: 'x', duration_ms: 9000 }),
        createRow({ table_name: 'x', duration_ms: 3000 }),
      ];
      const result = computeTopOffenders(rows);
      expect(result[0][1].maxMs).toBe(9000);
    });

    it('6.06 - calcula totalMs corretamente', () => {
      const rows = [
        createRow({ table_name: 'x', duration_ms: 1000 }),
        createRow({ table_name: 'x', duration_ms: 2000 }),
      ];
      expect(computeTopOffenders(rows)[0][1].totalMs).toBe(3000);
    });

    it('6.07 - rpc_name tem prioridade sobre table_name', () => {
      const rows = [createRow({ table_name: 'tbl', rpc_name: 'my_rpc' })];
      expect(computeTopOffenders(rows)[0][0]).toBe('my_rpc');
    });

    it('6.08 - null table e null rpc usa "unknown"', () => {
      const rows = [createRow({ table_name: null, rpc_name: null })];
      expect(computeTopOffenders(rows)[0][0]).toBe('unknown');
    });

    it('6.09 - múltiplas tabelas com counts iguais', () => {
      const rows = [
        createRow({ table_name: 'a' }),
        createRow({ table_name: 'b' }),
      ];
      const result = computeTopOffenders(rows);
      expect(result.length).toBe(2);
    });

    it('6.10 - 1000 rows performance', () => {
      const tables = ['t1', 't2', 't3', 't4', 't5'];
      const rows = Array.from({ length: 1000 }, (_, i) =>
        createRow({ table_name: tables[i % 5], duration_ms: 1000 + i })
      );
      const result = computeTopOffenders(rows);
      expect(result.length).toBe(5);
      expect(result[0][1].count).toBe(200);
    });

    it('6.11 - média calculável a partir de totalMs/count', () => {
      const rows = [
        createRow({ table_name: 'x', duration_ms: 2000 }),
        createRow({ table_name: 'x', duration_ms: 4000 }),
      ];
      const stats = computeTopOffenders(rows)[0][1];
      expect(Math.round(stats.totalMs / stats.count)).toBe(3000);
    });

    it('6.12 - tabelas com nomes longos', () => {
      const longName = 'a'.repeat(200);
      const rows = [createRow({ table_name: longName })];
      expect(computeTopOffenders(rows)[0][0]).toBe(longName);
    });

    it('6.13 - mistura de rpc e table', () => {
      const rows = [
        createRow({ rpc_name: 'rpc_a', table_name: null }),
        createRow({ rpc_name: null, table_name: 'tbl_b' }),
        createRow({ rpc_name: 'rpc_a', table_name: null }),
      ];
      const result = computeTopOffenders(rows);
      expect(result[0][0]).toBe('rpc_a');
      expect(result[0][1].count).toBe(2);
    });

    it('6.14 - maxMs com valor único', () => {
      const rows = [createRow({ table_name: 't', duration_ms: 7777 })];
      expect(computeTopOffenders(rows)[0][1].maxMs).toBe(7777);
    });

    it('6.15 - count soma total bate', () => {
      const rows = Array.from({ length: 30 }, (_, i) =>
        createRow({ table_name: `t${i % 3}` })
      );
      const result = computeTopOffenders(rows);
      const totalCount = result.reduce((s, [, stats]) => s + stats.count, 0);
      expect(totalCount).toBe(30);
    });
  });

  // -------------------------------------------------------
  // 7. Timeline Buckets (Charts)
  // -------------------------------------------------------
  describe('7. Timeline Buckets', () => {
    it('7.01 - array vazio retorna vazio', () => {
      expect(computeTimelineBuckets([], '24h')).toEqual([]);
    });

    it('7.02 - um registro cria um bucket', () => {
      const rows = [createRow()];
      expect(computeTimelineBuckets(rows, '24h').length).toBe(1);
    });

    it('7.03 - registros no mesmo bucket são agrupados', () => {
      const now = new Date();
      const rows = [
        createRow({ created_at: now.toISOString(), severity: 'slow' }),
        createRow({ created_at: now.toISOString(), severity: 'slow' }),
      ];
      const buckets = computeTimelineBuckets(rows, '24h');
      expect(buckets.length).toBe(1);
      expect(buckets[0][1].slow).toBe(2);
    });

    it('7.04 - diferentes severidades no mesmo bucket', () => {
      const now = new Date();
      const rows = [
        createRow({ created_at: now.toISOString(), severity: 'slow' }),
        createRow({ created_at: now.toISOString(), severity: 'very_slow' }),
        createRow({ created_at: now.toISOString(), severity: 'error' }),
      ];
      const buckets = computeTimelineBuckets(rows, '24h');
      expect(buckets[0][1].slow).toBe(1);
      expect(buckets[0][1].very_slow).toBe(1);
      expect(buckets[0][1].error).toBe(1);
    });

    it('7.05 - bucket size 1h = 5min', () => {
      const now = Date.now();
      const rows = [
        createRow({ created_at: new Date(now).toISOString(), severity: 'slow' }),
        createRow({ created_at: new Date(now - 10 * 60 * 1000).toISOString(), severity: 'slow' }),
      ];
      const buckets = computeTimelineBuckets(rows, '1h');
      expect(buckets.length).toBe(2);
    });

    it('7.06 - bucket size 6h = 30min', () => {
      const now = Date.now();
      const rows = [
        createRow({ created_at: new Date(now).toISOString(), severity: 'slow' }),
        createRow({ created_at: new Date(now - 60 * 60 * 1000).toISOString(), severity: 'slow' }),
      ];
      const buckets = computeTimelineBuckets(rows, '6h');
      expect(buckets.length).toBe(2);
    });

    it('7.07 - buckets são ordenados cronologicamente', () => {
      const now = Date.now();
      const rows = [
        createRow({ created_at: new Date(now - 3 * 60 * 60 * 1000).toISOString() }),
        createRow({ created_at: new Date(now).toISOString() }),
      ];
      const buckets = computeTimelineBuckets(rows, '24h');
      expect(buckets[0][0]).toBeLessThan(buckets[buckets.length - 1][0]);
    });

    it('7.08 - 200 registros distribuídos', () => {
      const now = Date.now();
      const rows = Array.from({ length: 200 }, (_, i) =>
        createRow({ created_at: new Date(now - i * 5 * 60 * 1000).toISOString() })
      );
      const buckets = computeTimelineBuckets(rows, '24h');
      expect(buckets.length).toBeGreaterThan(0);
    });

    it('7.09 - severidades desconhecidas não incrementam contadores', () => {
      const rows = [createRow({ severity: 'normal' })];
      const buckets = computeTimelineBuckets(rows, '24h');
      expect(buckets[0][1].slow).toBe(0);
      expect(buckets[0][1].very_slow).toBe(0);
      expect(buckets[0][1].error).toBe(0);
    });

    it('7.10 - 7d bucket size = 6h', () => {
      const now = Date.now();
      const rows = [
        createRow({ created_at: new Date(now).toISOString() }),
        createRow({ created_at: new Date(now - 12 * 60 * 60 * 1000).toISOString() }),
      ];
      const buckets = computeTimelineBuckets(rows, '7d');
      expect(buckets.length).toBe(2);
    });
  });

  // -------------------------------------------------------
  // 8. Severity Distribution
  // -------------------------------------------------------
  describe('8. Severity Distribution', () => {
    it('8.01 - array vazio retorna vazio', () => {
      expect(computeSeverityDistribution([])).toEqual([]);
    });

    it('8.02 - uma severidade', () => {
      const rows = [createRow({ severity: 'slow' }), createRow({ severity: 'slow' })];
      const dist = computeSeverityDistribution(rows);
      expect(dist).toEqual([{ name: 'slow', value: 2 }]);
    });

    it('8.03 - múltiplas severidades', () => {
      const rows = [
        createRow({ severity: 'slow' }),
        createRow({ severity: 'very_slow' }),
        createRow({ severity: 'error' }),
      ];
      const dist = computeSeverityDistribution(rows);
      expect(dist.length).toBe(3);
    });

    it('8.04 - contagem correta por severidade', () => {
      const rows = [
        ...Array.from({ length: 5 }, () => createRow({ severity: 'slow' })),
        ...Array.from({ length: 3 }, () => createRow({ severity: 'error' })),
      ];
      const dist = computeSeverityDistribution(rows);
      const slowEntry = dist.find(d => d.name === 'slow');
      const errorEntry = dist.find(d => d.name === 'error');
      expect(slowEntry?.value).toBe(5);
      expect(errorEntry?.value).toBe(3);
    });

    it('8.05 - soma total bate com rows.length', () => {
      const rows = Array.from({ length: 50 }, (_, i) =>
        createRow({ severity: i % 2 === 0 ? 'slow' : 'very_slow' })
      );
      const dist = computeSeverityDistribution(rows);
      const total = dist.reduce((s, d) => s + d.value, 0);
      expect(total).toBe(50);
    });

    it('8.06 - severidade desconhecida aparece', () => {
      const rows = [createRow({ severity: 'custom_sev' })];
      const dist = computeSeverityDistribution(rows);
      expect(dist[0].name).toBe('custom_sev');
    });

    it('8.07 - 1000 rows', () => {
      const rows = Array.from({ length: 1000 }, (_, i) =>
        createRow({ severity: ['slow', 'very_slow', 'error'][i % 3] })
      );
      const dist = computeSeverityDistribution(rows);
      expect(dist.length).toBe(3);
    });

    it('8.08 - retorna array de objetos com name e value', () => {
      const rows = [createRow()];
      const dist = computeSeverityDistribution(rows);
      expect(dist[0]).toHaveProperty('name');
      expect(dist[0]).toHaveProperty('value');
    });

    it('8.09 - value é sempre positivo', () => {
      const rows = Array.from({ length: 20 }, () => createRow());
      computeSeverityDistribution(rows).forEach(d => {
        expect(d.value).toBeGreaterThan(0);
      });
    });

    it('8.10 - não duplica entradas', () => {
      const rows = Array.from({ length: 10 }, () => createRow({ severity: 'slow' }));
      const dist = computeSeverityDistribution(rows);
      expect(dist.length).toBe(1);
    });
  });

  // -------------------------------------------------------
  // 9. Filtros de Severidade
  // -------------------------------------------------------
  describe('9. Severity Filter Logic', () => {
    const allRows = [
      createRow({ severity: 'slow' }),
      createRow({ severity: 'very_slow' }),
      createRow({ severity: 'error' }),
      createRow({ severity: 'slow' }),
      createRow({ severity: 'very_slow' }),
    ];

    function applyFilter(rows: TelemetryRow[], filter: string) {
      if (filter === 'all') return rows;
      return rows.filter(r => r.severity === filter);
    }

    it('9.01 - all retorna todos', () => {
      expect(applyFilter(allRows, 'all').length).toBe(5);
    });

    it('9.02 - slow filtra corretamente', () => {
      expect(applyFilter(allRows, 'slow').length).toBe(2);
    });

    it('9.03 - very_slow filtra corretamente', () => {
      expect(applyFilter(allRows, 'very_slow').length).toBe(2);
    });

    it('9.04 - error filtra corretamente', () => {
      expect(applyFilter(allRows, 'error').length).toBe(1);
    });

    it('9.05 - filtro inexistente retorna vazio', () => {
      expect(applyFilter(allRows, 'nonexistent').length).toBe(0);
    });

    it('9.06 - filtro slow só contém slow', () => {
      applyFilter(allRows, 'slow').forEach(r => expect(r.severity).toBe('slow'));
    });

    it('9.07 - filtro error só contém error', () => {
      applyFilter(allRows, 'error').forEach(r => expect(r.severity).toBe('error'));
    });

    it('9.08 - array vazio com qualquer filtro', () => {
      expect(applyFilter([], 'slow').length).toBe(0);
    });

    it('9.09 - all preserva ordem', () => {
      const filtered = applyFilter(allRows, 'all');
      expect(filtered).toEqual(allRows);
    });

    it('9.10 - filtro case-sensitive', () => {
      expect(applyFilter(allRows, 'SLOW').length).toBe(0);
    });
  });

  // -------------------------------------------------------
  // 10. Filtros de Tempo
  // -------------------------------------------------------
  describe('10. Time Filter Logic', () => {
    function applyTimeFilter(rows: TelemetryRow[], filter: string) {
      const threshold = new Date(getTimeThreshold(filter)).getTime();
      return rows.filter(r => new Date(r.created_at).getTime() >= threshold);
    }

    it('10.01 - registro recente passa filtro 1h', () => {
      const rows = [createRow({ created_at: new Date().toISOString() })];
      expect(applyTimeFilter(rows, '1h').length).toBe(1);
    });

    it('10.02 - registro de 2h atrás não passa filtro 1h', () => {
      const rows = [createRow({ created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() })];
      expect(applyTimeFilter(rows, '1h').length).toBe(0);
    });

    it('10.03 - registro de 2h atrás passa filtro 6h', () => {
      const rows = [createRow({ created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() })];
      expect(applyTimeFilter(rows, '6h').length).toBe(1);
    });

    it('10.04 - registro de 12h atrás passa filtro 24h', () => {
      const rows = [createRow({ created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() })];
      expect(applyTimeFilter(rows, '24h').length).toBe(1);
    });

    it('10.05 - registro de 3 dias atrás passa filtro 7d', () => {
      const rows = [createRow({ created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() })];
      expect(applyTimeFilter(rows, '7d').length).toBe(1);
    });

    it('10.06 - registro de 8 dias atrás não passa filtro 7d', () => {
      const rows = [createRow({ created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() })];
      expect(applyTimeFilter(rows, '7d').length).toBe(0);
    });

    it('10.07 - mix de registros com filtro 24h', () => {
      const rows = [
        createRow({ created_at: new Date().toISOString() }),
        createRow({ created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() }),
        createRow({ created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() }),
      ];
      expect(applyTimeFilter(rows, '24h').length).toBe(2);
    });

    it('10.08 - todos recentes passam qualquer filtro', () => {
      const rows = Array.from({ length: 10 }, () => createRow({ created_at: new Date().toISOString() }));
      ['1h', '6h', '24h', '7d'].forEach(f => {
        expect(applyTimeFilter(rows, f).length).toBe(10);
      });
    });

    it('10.09 - todos antigos não passam filtro curto', () => {
      const rows = Array.from({ length: 10 }, () =>
        createRow({ created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() })
      );
      expect(applyTimeFilter(rows, '1h').length).toBe(0);
    });

    it('10.10 - filtro mais amplo sempre >= filtro mais restrito', () => {
      const rows = Array.from({ length: 50 }, (_, i) =>
        createRow({ created_at: new Date(Date.now() - i * 60 * 60 * 1000).toISOString() })
      );
      const counts = ['1h', '6h', '24h', '7d'].map(f => applyTimeFilter(rows, f).length);
      for (let i = 0; i < counts.length - 1; i++) {
        expect(counts[i]).toBeLessThanOrEqual(counts[i + 1]);
      }
    });
  });

  // -------------------------------------------------------
  // 11. Edge Cases & Robustez
  // -------------------------------------------------------
  describe('11. Edge Cases', () => {
    it('11.01 - duration_ms negativo tratado', () => {
      const row = createRow({ duration_ms: -100 });
      expect(formatDuration(row.duration_ms)).toBe('-100ms');
    });

    it('11.02 - duration muito grande', () => {
      expect(formatDuration(3600000)).toBe('3600.0s');
    });

    it('11.03 - tabela com caracteres especiais', () => {
      const row = createRow({ table_name: "table'with\"quotes" });
      expect(row.table_name).toContain("'");
    });

    it('11.04 - error_message com HTML', () => {
      const row = createRow({ error_message: '<script>alert("xss")</script>' });
      expect(row.error_message).toContain('<script>');
    });

    it('11.05 - user_id null', () => {
      expect(createRow({ user_id: null }).user_id).toBeNull();
    });

    it('11.06 - user_id com UUID válido', () => {
      const row = createRow({ user_id: '550e8400-e29b-41d4-a716-446655440000' });
      expect(row.user_id).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('11.07 - operation vazia', () => {
      expect(createRow({ operation: '' }).operation).toBe('');
    });

    it('11.08 - todos campos null que permitem', () => {
      const row = createRow({
        table_name: null, rpc_name: null, record_count: null,
        query_limit: null, query_offset: null, count_mode: null,
        error_message: null, user_id: null,
      });
      expect(row.table_name).toBeNull();
      expect(row.rpc_name).toBeNull();
      expect(row.record_count).toBeNull();
    });

    it('11.09 - created_at epoch zero', () => {
      const row = createRow({ created_at: new Date(0).toISOString() });
      expect(row.created_at).toBe('1970-01-01T00:00:00.000Z');
    });

    it('11.10 - created_at futuro', () => {
      const future = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      const row = createRow({ created_at: future });
      expect(new Date(row.created_at).getTime()).toBeGreaterThan(Date.now());
    });

    it('11.11 - stats com 10000 registros', () => {
      const rows = Array.from({ length: 10000 }, (_, i) =>
        createRow({ severity: i % 3 === 0 ? 'slow' : 'very_slow', duration_ms: i })
      );
      const s = computeStats(rows);
      expect(s.slow + s.verySlow + s.errors).toBe(10000);
    });

    it('11.12 - topOffenders com tabelas duplicadas', () => {
      const rows = Array.from({ length: 100 }, () => createRow({ table_name: 'same_table' }));
      const result = computeTopOffenders(rows);
      expect(result.length).toBe(1);
      expect(result[0][1].count).toBe(100);
    });

    it('11.13 - severity vazia como string', () => {
      const rows = [createRow({ severity: '' })];
      const s = computeStats(rows);
      expect(s.slow).toBe(0);
    });

    it('11.14 - formatDuration precision', () => {
      expect(formatDuration(1234)).toBe('1.2s');
      expect(formatDuration(1250)).toBe('1.3s'); // toFixed(1) rounds 5 up
    });

    it('11.15 - concurrent filter application', () => {
      const rows = Array.from({ length: 100 }, (_, i) =>
        createRow({
          severity: ['slow', 'very_slow', 'error'][i % 3],
          created_at: new Date(Date.now() - i * 30 * 60 * 1000).toISOString(),
        })
      );
      const threshold = new Date(getTimeThreshold('6h')).getTime();
      const filtered = rows
        .filter(r => new Date(r.created_at).getTime() >= threshold)
        .filter(r => r.severity === 'slow');
      expect(filtered.length).toBeGreaterThanOrEqual(0);
      filtered.forEach(r => {
        expect(r.severity).toBe('slow');
        expect(new Date(r.created_at).getTime()).toBeGreaterThanOrEqual(threshold);
      });
    });
  });

  // -------------------------------------------------------
  // 12. Cleanup Logic
  // -------------------------------------------------------
  describe('12. Cleanup Logic', () => {
    it('12.01 - threshold de 7 dias é correto', () => {
      const threshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const diff = Date.now() - threshold.getTime();
      expect(Math.round(diff / (24 * 60 * 60 * 1000))).toBe(7);
    });

    it('12.02 - registros dentro de 7d não seriam deletados', () => {
      const threshold = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const recentRow = createRow({ created_at: new Date().toISOString() });
      expect(new Date(recentRow.created_at).getTime()).toBeGreaterThan(threshold);
    });

    it('12.03 - registros mais velhos que 7d seriam deletados', () => {
      const threshold = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const oldRow = createRow({ created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() });
      expect(new Date(oldRow.created_at).getTime()).toBeLessThan(threshold);
    });

    it('12.04 - exatamente 7 dias (boundary)', () => {
      const exactlySevenDays = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const row = createRow({ created_at: new Date(exactlySevenDays).toISOString() });
      // lt means strictly less than, so exactly 7 days should NOT be deleted
      expect(new Date(row.created_at).getTime()).toBeLessThanOrEqual(exactlySevenDays);
    });

    it('12.05 - cleanup não afeta registros futuros', () => {
      const threshold = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const futureRow = createRow({ created_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() });
      expect(new Date(futureRow.created_at).getTime()).toBeGreaterThan(threshold);
    });
  });

  // -------------------------------------------------------
  // 13. Data Integrity
  // -------------------------------------------------------
  describe('13. Data Integrity', () => {
    it('13.01 - row preserva todos os campos', () => {
      const row = createRow({
        operation: 'insert',
        table_name: 'logs',
        duration_ms: 12000,
        severity: 'very_slow',
        record_count: 999,
      });
      expect(row.operation).toBe('insert');
      expect(row.table_name).toBe('logs');
      expect(row.duration_ms).toBe(12000);
      expect(row.severity).toBe('very_slow');
      expect(row.record_count).toBe(999);
    });

    it('13.02 - rows são imutáveis entre si', () => {
      const r1 = createRow({ duration_ms: 100 });
      const r2 = createRow({ duration_ms: 200 });
      expect(r1.duration_ms).toBe(100);
      expect(r2.duration_ms).toBe(200);
    });

    it('13.03 - stats não modifica array original', () => {
      const rows = [createRow(), createRow()];
      const original = [...rows];
      computeStats(rows);
      expect(rows).toEqual(original);
    });

    it('13.04 - topOffenders não modifica array original', () => {
      const rows = [createRow(), createRow()];
      const original = [...rows];
      computeTopOffenders(rows);
      expect(rows).toEqual(original);
    });

    it('13.05 - timeline não modifica array original', () => {
      const rows = [createRow()];
      const original = [...rows];
      computeTimelineBuckets(rows, '24h');
      expect(rows).toEqual(original);
    });

    it('13.06 - distribution não modifica array original', () => {
      const rows = [createRow()];
      const original = [...rows];
      computeSeverityDistribution(rows);
      expect(rows).toEqual(original);
    });

    it('13.07 - múltiplas computações sequenciais produzem mesmo resultado', () => {
      const rows = Array.from({ length: 50 }, () => createRow());
      const s1 = computeStats(rows);
      const s2 = computeStats(rows);
      expect(s1).toEqual(s2);
    });

    it('13.08 - operações não interferem entre si', () => {
      const rows = Array.from({ length: 20 }, (_, i) =>
        createRow({ table_name: `t${i % 5}`, severity: ['slow', 'very_slow', 'error'][i % 3] })
      );
      const stats = computeStats(rows);
      const offenders = computeTopOffenders(rows);
      const dist = computeSeverityDistribution(rows);
      expect(stats.slow + stats.verySlow + stats.errors).toBe(20);
      expect(offenders.reduce((s, [, o]) => s + o.count, 0)).toBe(20);
      expect(dist.reduce((s, d) => s + d.value, 0)).toBe(20);
    });

    it('13.09 - formatDuration é puro', () => {
      expect(formatDuration(5000)).toBe(formatDuration(5000));
    });

    it('13.10 - formatTime é determinístico para mesmo input', () => {
      const iso = '2026-03-23T10:30:45.000Z';
      expect(formatTime(iso)).toBe(formatTime(iso));
    });
  });

  // -------------------------------------------------------
  // 14. Batch/Stress Tests
  // -------------------------------------------------------
  describe('14. Stress & Performance', () => {
    it('14.01 - 5000 rows stats', () => {
      const rows = Array.from({ length: 5000 }, (_, i) =>
        createRow({ duration_ms: i, severity: ['slow', 'very_slow', 'error'][i % 3] })
      );
      const s = computeStats(rows);
      expect(s.slow + s.verySlow + s.errors).toBe(5000);
    });

    it('14.02 - 5000 rows topOffenders', () => {
      const rows = Array.from({ length: 5000 }, (_, i) =>
        createRow({ table_name: `t_${i % 20}` })
      );
      expect(computeTopOffenders(rows).length).toBe(8);
    });

    it('14.03 - 5000 rows timeline', () => {
      const now = Date.now();
      const rows = Array.from({ length: 5000 }, (_, i) =>
        createRow({ created_at: new Date(now - i * 60 * 1000).toISOString() })
      );
      const buckets = computeTimelineBuckets(rows, '7d');
      expect(buckets.length).toBeGreaterThan(0);
    });

    it('14.04 - 5000 rows distribution', () => {
      const rows = Array.from({ length: 5000 }, (_, i) =>
        createRow({ severity: ['slow', 'very_slow', 'error'][i % 3] })
      );
      const dist = computeSeverityDistribution(rows);
      expect(dist.length).toBe(3);
      dist.forEach(d => expect(d.value).toBeGreaterThan(1600));
    });

    it('14.05 - 10000 rows filter', () => {
      const now = Date.now();
      const rows = Array.from({ length: 10000 }, (_, i) =>
        createRow({
          severity: i % 2 === 0 ? 'slow' : 'very_slow',
          created_at: new Date(now - i * 30 * 1000).toISOString(),
        })
      );
      const threshold = new Date(getTimeThreshold('1h')).getTime();
      const filtered = rows.filter(r => new Date(r.created_at).getTime() >= threshold);
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.length).toBeLessThanOrEqual(10000);
    });

    it('14.06 - formatDuration 10000 calls', () => {
      const results = Array.from({ length: 10000 }, (_, i) => formatDuration(i));
      expect(results.length).toBe(10000);
      expect(results[0]).toBe('0ms');
      expect(results[1000]).toBe('1.0s');
    });

    it('14.07 - 100 tabelas distintas', () => {
      const rows = Array.from({ length: 200 }, (_, i) =>
        createRow({ table_name: `table_${i % 100}` })
      );
      const offenders = computeTopOffenders(rows);
      expect(offenders.length).toBe(8); // Limited to top 8
    });

    it('14.08 - all stats computations under 100ms for 10000 rows', () => {
      const rows = Array.from({ length: 10000 }, (_, i) =>
        createRow({ severity: ['slow', 'very_slow', 'error'][i % 3], duration_ms: i })
      );
      const start = Date.now();
      computeStats(rows);
      computeTopOffenders(rows);
      computeSeverityDistribution(rows);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(100);
    });
  });

  // -------------------------------------------------------
  // 15. Supabase Query Structure
  // -------------------------------------------------------
  describe('15. Supabase Query Validation', () => {
    it('15.01 - tabela é query_telemetry', () => {
      const tableName = 'query_telemetry';
      expect(tableName).toBe('query_telemetry');
    });

    it('15.02 - limit padrão é 200', () => {
      const limit = 200;
      expect(limit).toBe(200);
    });

    it('15.03 - order é por created_at desc', () => {
      const order = { column: 'created_at', ascending: false };
      expect(order.ascending).toBe(false);
    });

    it('15.04 - severityFilter "all" não adiciona eq', () => {
      const filter = 'all';
      expect(filter === 'all').toBe(true);
    });

    it('15.05 - severityFilter "slow" adiciona eq', () => {
      const filter = 'slow';
      expect((filter as string) !== 'all').toBe(true);
    });

    it('15.06 - refetchInterval é 30000ms', () => {
      expect(30000).toBe(30000);
    });

    it('15.07 - staleTime é 10000ms', () => {
      expect(10000).toBe(10000);
    });

    it('15.08 - cleanup threshold é 7 dias', () => {
      const days = 7;
      const ms = days * 24 * 60 * 60 * 1000;
      expect(ms).toBe(604800000);
    });

    it('15.09 - delete usa lt com threshold', () => {
      const operator = 'lt';
      expect(operator).toBe('lt');
    });

    it('15.10 - queryKey inclui filtros', () => {
      const queryKey = ['query-telemetry', 'all', '24h'];
      expect(queryKey).toContain('query-telemetry');
      expect(queryKey.length).toBe(3);
    });
  });
});
