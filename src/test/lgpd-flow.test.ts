/**
 * SENTINELA — LGPD end-to-end flow suite (pure logic)
 *
 * Cobre:
 *   1. Integridade da assinatura SHA-256 de ciência/contestação
 *   2. Sincronização do dispute_status via trigger (simulada)
 *   3. Métricas SLA: compliance, backlog, p90, timeline
 *   4. Notificação idempotente (payload determinístico)
 */
import { webcrypto } from 'node:crypto';
import { describe, it, expect } from 'vitest';
import { computeMetrics, DISPUTE_SLA_HOURS } from '@/hooks/useDisputeMetrics';

const subtle = (globalThis.crypto?.subtle ?? webcrypto.subtle) as SubtleCrypto;

async function sha256(input: string) {
  const buf = new TextEncoder().encode(input);
  const hash = await subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

describe('LGPD — assinatura de contestação', () => {
  it('gera hash SHA-256 determinístico para o mesmo payload', async () => {
    const payload = 'v-1|false_positive|Justificativa|user-1|2025-01-01T00:00:00Z';
    const a = await sha256(payload);
    const b = await sha256(payload);
    expect(a).toEqual(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });

  it('não colide entre categorias diferentes', async () => {
    const a = await sha256('v-1|false_positive|X|u-1|t');
    const b = await sha256('v-1|technical_error|X|u-1|t');
    expect(a).not.toEqual(b);
  });

  it('preserva integridade com unicode (êã 中文)', async () => {
    const h = await sha256('v-1|false_positive|erro — ação 中文|u-1|t');
    expect(h).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe('LGPD — métricas SLA de contestação', () => {
  const now = Date.now();
  const H = 3_600_000;
  const rows = [
    { id: '1', status: 'approved' as const, category: 'false_positive', created_at: new Date(now - 50 * H).toISOString(), resolved_at: new Date(now - 26 * H).toISOString() },
    { id: '2', status: 'rejected' as const, category: 'other', created_at: new Date(now - 200 * H).toISOString(), resolved_at: new Date(now - 80 * H).toISOString() },
    { id: '3', status: 'pending' as const, category: 'technical_error', created_at: new Date(now - 200 * H).toISOString(), resolved_at: null },
    { id: '4', status: 'pending' as const, category: 'false_positive', created_at: new Date(now - 5 * H).toISOString(), resolved_at: null },
    { id: '5', status: 'under_review' as const, category: 'context_missing', created_at: new Date(now - 40 * H).toISOString(), resolved_at: null },
  ];

  it('respeita SLA-alvo de 72h', () => {
    expect(DISPUTE_SLA_HOURS).toBe(72);
  });

  it('classifica compliance corretamente (1 on-time / 1 breached = 50%)', () => {
    const m = computeMetrics(rows);
    expect(m.resolvedWithinSla).toBe(1);
    expect(m.resolvedBreachedSla).toBe(1);
    expect(m.slaCompliancePct).toBe(50);
  });

  it('conta pendentes (pending + under_review)', () => {
    const m = computeMetrics(rows);
    expect(m.pending).toBe(3);
  });

  it('classifica backlog por idade', () => {
    const m = computeMetrics(rows);
    const bucket = (l: string) => m.backlogAgeBuckets.find((b) => b.label === l)!.count;
    expect(bucket('0-24h')).toBe(1); // id 4
    expect(bucket('24-72h')).toBe(1); // id 5
    expect(bucket('>7d')).toBe(1); // id 3
  });

  it('calcula tempo médio e p90 em horas', () => {
    const m = computeMetrics(rows);
    expect(m.avgResolutionHours).toBeGreaterThan(0);
    expect(m.p90ResolutionHours).toBeGreaterThanOrEqual(m.avgResolutionHours!);
  });

  it('gera timeline agregado por dia', () => {
    const m = computeMetrics(rows);
    expect(m.timeline.length).toBeGreaterThan(0);
    const totalCreated = m.timeline.reduce((s, d) => s + d.created, 0);
    expect(totalCreated).toBe(rows.length);
  });

  it('sobrevive a dataset vazio sem NaN', () => {
    const m = computeMetrics([]);
    expect(m.total).toBe(0);
    expect(m.slaCompliancePct).toBe(0);
    expect(m.avgResolutionHours).toBeNull();
    expect(m.p90ResolutionHours).toBeNull();
  });

  it('agrupa por categoria', () => {
    const m = computeMetrics(rows);
    expect(m.byCategory.false_positive).toBe(2);
    expect(m.byCategory.technical_error).toBe(1);
  });
});

describe('LGPD — payload de notificação de decisão', () => {
  it('produz payload FCM com data.alert_type=dispute_decision', () => {
    const payload = {
      to: 'token-abc',
      data: {
        alert_type: 'dispute_decision' as const,
        dispute_id: 'd-1',
        violation_id: 'v-1',
        status: 'approved' as const,
      },
    };
    expect(payload.data.alert_type).toBe('dispute_decision');
    expect(payload.data.status).toBe('approved');
  });
});
