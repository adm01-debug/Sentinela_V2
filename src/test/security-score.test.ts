// ============================================================
// SECURITY SCORE TESTS
// ============================================================

import { describe, it, expect } from 'vitest';
import { calculateSecurityScore, getScoreColor, getScoreBadge } from '@/components/security/SecurityScoreCard';

describe('calculateSecurityScore', () => {
  it('returns 100 when all conditions are perfect', () => {
    const score = calculateSecurityScore(true, 5, 5, 0);
    expect(score.total).toBe(100);
    expect(score.mfa).toBe(25);
    expect(score.sessions).toBe(25);
    expect(score.devices).toBe(25);
    expect(score.alerts).toBe(25);
  });

  it('returns 0 for mfa when not enrolled', () => {
    const score = calculateSecurityScore(false, 5, 5, 0);
    expect(score.mfa).toBe(0);
    expect(score.total).toBe(75);
  });

  it('calculates device score proportionally', () => {
    const score = calculateSecurityScore(true, 2, 4, 0);
    expect(score.devices).toBe(13); // round(2/4 * 25)
  });

  it('gives full device score when no devices', () => {
    const score = calculateSecurityScore(true, 0, 0, 0);
    expect(score.devices).toBe(25);
  });

  it('reduces alert score by 5 per unresolved alert', () => {
    const score = calculateSecurityScore(true, 5, 5, 3);
    expect(score.alerts).toBe(10); // 25 - 15
  });

  it('alert score never goes below 0', () => {
    const score = calculateSecurityScore(true, 5, 5, 10);
    expect(score.alerts).toBe(0);
  });
});

describe('getScoreColor', () => {
  it('returns green for score >= 80', () => {
    expect(getScoreColor(80)).toContain('text-success');
    expect(getScoreColor(100)).toContain('text-success');
  });

  it('returns yellow for 60-79', () => {
    expect(getScoreColor(60)).toContain('text-warning');
  });

  it('returns orange for 40-59', () => {
    expect(getScoreColor(40)).toContain('text-warning');
  });

  it('returns red for < 40', () => {
    expect(getScoreColor(0)).toContain('text-destructive');
  });
});

describe('getScoreBadge', () => {
  it('returns Excelente for >= 80', () => {
    expect(getScoreBadge(80).label).toBe('Excelente');
  });

  it('returns Crítico for < 40', () => {
    expect(getScoreBadge(20).label).toBe('Crítico');
    expect(getScoreBadge(20).variant).toBe('destructive');
  });
});
