// ============================================================
// MFA SIMULATOR — Suite de cenários (centenas)
// Cobre enroll, verify, unenroll, expiração, lockout, cooldown
// de SMS, limites de pendências e regressões conhecidas.
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
  MFASimulator,
  MFAError,
  DEFAULT_CONFIG,
  type FactorType,
} from '@/lib/mfa/mfaSimulator';

function makeSim(overrides: Partial<typeof DEFAULT_CONFIG> = {}) {
  return new MFASimulator({ ...DEFAULT_CONFIG, ...overrides });
}

// ------------------------------------------------------------
// 1. Enroll — casos base
// ------------------------------------------------------------
describe('MFA enroll', () => {
  it.each<FactorType>(['totp', 'phone'])(
    'cria fator %s pendente com TTL',
    (type) => {
      const sim = makeSim();
      const r = sim.enroll(type, 'principal');
      expect(r.factorId).toBeTruthy();
      expect(r.expectedCode).toMatch(/^\d{6}$/);
      const f = sim.get(r.factorId)!;
      expect(f.status).toBe('unverified');
      expect(f.type).toBe(type);
      expect(f.expiresAt).toBe(DEFAULT_CONFIG.enrollTtlMs);
    },
  );

  it('gera secret apenas para TOTP', () => {
    const sim = makeSim();
    expect(sim.enroll('totp').secret).toMatch(/^SECRET_/);
    expect(sim.enroll('phone').secret).toBe('');
  });

  it('rejeita friendlyName vazio', () => {
    const sim = makeSim();
    expect(() => sim.enroll('totp', '  ')).toThrow(MFAError);
  });

  it('bloqueia mais de N pendências simultâneas', () => {
    const sim = makeSim({ maxPendingFactors: 2 });
    sim.enroll('totp', 'a');
    sim.enroll('phone', 'b');
    expect(() => sim.enroll('totp', 'c')).toThrowError(/too_many_pending/);
  });

  it('libera slot após expiração + gc', () => {
    const sim = makeSim({ maxPendingFactors: 1 });
    sim.enroll('totp');
    sim.advance(DEFAULT_CONFIG.enrollTtlMs + 1);
    sim.gcExpired();
    expect(() => sim.enroll('totp')).not.toThrow();
  });
});

// ------------------------------------------------------------
// 2. Verify — happy path e falhas
// ------------------------------------------------------------
describe('MFA verify', () => {
  let sim: MFASimulator;
  beforeEach(() => { sim = makeSim(); });

  it('verifica com código correto', () => {
    const { factorId, expectedCode } = sim.enroll('totp');
    const r = sim.verify(factorId, expectedCode, expectedCode);
    expect(r.verifiedAt).toBe(0);
    expect(sim.get(factorId)!.status).toBe('verified');
    expect(sim.isEnrolled()).toBe(true);
  });

  it('rejeita códigos com shape inválido', () => {
    const { factorId, expectedCode } = sim.enroll('totp');
    for (const bad of ['', '12345', '1234567', 'abcdef', '12 456', '-12345']) {
      expect(() => sim.verify(factorId, bad, expectedCode)).toThrowError(/invalid_input/);
    }
  });

  it('rejeita código incorreto e incrementa falhas', () => {
    const { factorId, expectedCode } = sim.enroll('totp');
    expect(() => sim.verify(factorId, '000000', expectedCode)).toThrowError(/invalid_code/);
    expect(sim.get(factorId)!.failedAttempts).toBe(1);
  });

  it('bloqueia após maxFailedAttempts', () => {
    sim = makeSim({ maxFailedAttempts: 3 });
    const { factorId, expectedCode } = sim.enroll('totp');
    for (let i = 0; i < 3; i++) {
      expect(() => sim.verify(factorId, '999999', expectedCode)).toThrowError(/invalid_code/);
    }
    expect(() => sim.verify(factorId, expectedCode, expectedCode)).toThrowError(/locked/);
  });

  it('libera após lockoutMs', () => {
    sim = makeSim({ maxFailedAttempts: 2, lockoutMs: 1000 });
    const { factorId, expectedCode } = sim.enroll('totp');
    for (let i = 0; i < 2; i++) {
      try { sim.verify(factorId, '999999', expectedCode); } catch { /* ignore */ }
    }
    expect(() => sim.verify(factorId, expectedCode, expectedCode)).toThrowError(/locked/);
    sim.advance(1001);
    expect(() => sim.verify(factorId, expectedCode, expectedCode)).not.toThrow();
  });

  it('rejeita verify em fator expirado', () => {
    const { factorId, expectedCode } = sim.enroll('phone');
    sim.advance(DEFAULT_CONFIG.enrollTtlMs);
    expect(() => sim.verify(factorId, expectedCode, expectedCode)).toThrowError(/expired/);
  });

  it('rejeita verify em fator já verificado', () => {
    const { factorId, expectedCode } = sim.enroll('totp');
    sim.verify(factorId, expectedCode, expectedCode);
    expect(() => sim.verify(factorId, expectedCode, expectedCode)).toThrowError(/already_verified/);
  });

  it('rejeita verify em fator inexistente', () => {
    expect(() => sim.verify('missing', '000000', '000000')).toThrowError(/not_found/);
  });
});

// ------------------------------------------------------------
// 3. Unenroll
// ------------------------------------------------------------
describe('MFA unenroll', () => {
  it('remove fator verificado', () => {
    const sim = makeSim();
    const { factorId, expectedCode } = sim.enroll('totp');
    sim.verify(factorId, expectedCode, expectedCode);
    sim.unenroll(factorId, { requireVerified: true });
    expect(sim.get(factorId)).toBeUndefined();
    expect(sim.isEnrolled()).toBe(false);
  });

  it('remove fator pendente sem exigir verificação', () => {
    const sim = makeSim();
    const { factorId } = sim.enroll('phone');
    sim.unenroll(factorId);
    expect(sim.get(factorId)).toBeUndefined();
  });

  it('rejeita unenroll com requireVerified em fator pendente', () => {
    const sim = makeSim();
    const { factorId } = sim.enroll('phone');
    expect(() => sim.unenroll(factorId, { requireVerified: true })).toThrowError(/not_verified/);
  });

  it('rejeita unenroll de id inexistente', () => {
    expect(() => makeSim().unenroll('nope')).toThrowError(/not_found/);
  });
});

// ------------------------------------------------------------
// 4. SMS cooldown / resend
// ------------------------------------------------------------
describe('MFA SMS resend', () => {
  it('bloqueia resend antes do cooldown', () => {
    const sim = makeSim();
    const { factorId } = sim.enroll('phone');
    expect(() => sim.resendSms(factorId)).toThrowError(/sms_cooldown/);
  });

  it('permite resend após cooldown', () => {
    const sim = makeSim();
    const { factorId } = sim.enroll('phone');
    sim.advance(DEFAULT_CONFIG.smsResendCooldownMs);
    expect(() => sim.resendSms(factorId)).not.toThrow();
  });

  it('rejeita resend em TOTP', () => {
    const sim = makeSim();
    const { factorId } = sim.enroll('totp');
    sim.advance(DEFAULT_CONFIG.smsResendCooldownMs);
    expect(() => sim.resendSms(factorId)).toThrowError(/invalid_input/);
  });

  it('rejeita resend em fator expirado', () => {
    const sim = makeSim();
    const { factorId } = sim.enroll('phone');
    sim.advance(DEFAULT_CONFIG.enrollTtlMs + 1);
    expect(() => sim.resendSms(factorId)).toThrowError(/expired/);
  });
});

// ------------------------------------------------------------
// 5. Cenários parametrizados — centenas
// ------------------------------------------------------------
describe('MFA scenarios (parametrizados)', () => {
  const factorTypes: FactorType[] = ['totp', 'phone'];
  const failuresBeforeSuccess = [0, 1, 2, 3, 4];
  const advanceBeforeVerify = [0, 1000, 60_000, DEFAULT_CONFIG.enrollTtlMs - 1];

  const combos = factorTypes.flatMap((t) =>
    failuresBeforeSuccess.flatMap((f) =>
      advanceBeforeVerify.map((adv) => ({ t, f, adv })),
    ),
  );

  it.each(combos)(
    '[$t] $f falhas + adiantar $adv ms deve verificar',
    ({ t, f, adv }) => {
      const sim = makeSim();
      const { factorId, expectedCode } = sim.enroll(t);
      sim.advance(adv);
      for (let i = 0; i < f; i++) {
        try { sim.verify(factorId, '999999', expectedCode); } catch { /* ignore */ }
      }
      const r = sim.verify(factorId, expectedCode, expectedCode);
      expect(r.verifiedAt).toBe(adv);
    },
  );

  // 100+ random-ish deterministic scenarios: alterna operações e valida invariantes.
  it('mantém invariantes em 200 sequências pseudo-aleatórias', () => {
    for (let seed = 0; seed < 200; seed++) {
      const sim = makeSim();
      const ops = seed % 6;
      const type: FactorType = seed % 2 === 0 ? 'totp' : 'phone';
      const enroll = sim.enroll(type);

      if (ops >= 1) sim.advance((seed * 137) % 10_000);
      if (ops >= 2) {
        try { sim.verify(enroll.factorId, '111111', enroll.expectedCode); } catch { /* ignore */ }
      }
      if (ops >= 3 && seed % 3 === 0) {
        sim.advance(DEFAULT_CONFIG.enrollTtlMs);
        sim.gcExpired();
      }

      // Invariantes globais
      for (const f of sim.list()) {
        if (f.status === 'verified') {
          expect(f.verifiedAt).not.toBeNull();
          expect(f.expiresAt).toBeNull();
        } else {
          expect(f.expiresAt).not.toBeNull();
          expect(f.verifiedAt).toBeNull();
        }
        expect(f.failedAttempts).toBeGreaterThanOrEqual(0);
        expect(f.failedAttempts).toBeLessThanOrEqual(DEFAULT_CONFIG.maxFailedAttempts);
      }
    }
  });
});

// ------------------------------------------------------------
// 6. Regressões conhecidas / gap audit
// ------------------------------------------------------------
describe('MFA regressões e gaps', () => {
  it('gc não remove fatores verificados', () => {
    const sim = makeSim();
    const { factorId, expectedCode } = sim.enroll('totp');
    sim.verify(factorId, expectedCode, expectedCode);
    sim.advance(DEFAULT_CONFIG.enrollTtlMs * 10);
    expect(sim.gcExpired()).toBe(0);
    expect(sim.get(factorId)!.status).toBe('verified');
  });

  it('unenroll + reenroll do mesmo tipo funciona', () => {
    const sim = makeSim();
    const a = sim.enroll('totp');
    sim.verify(a.factorId, a.expectedCode, a.expectedCode);
    sim.unenroll(a.factorId);
    const b = sim.enroll('totp');
    expect(b.factorId).not.toBe(a.factorId);
    expect(() => sim.verify(b.factorId, b.expectedCode, b.expectedCode)).not.toThrow();
  });

  it('lockout de um fator não afeta outro', () => {
    const sim = makeSim({ maxFailedAttempts: 2 });
    const a = sim.enroll('totp', 'A');
    const b = sim.enroll('phone', 'B');
    for (let i = 0; i < 2; i++) {
      try { sim.verify(a.factorId, '999999', a.expectedCode); } catch { /* ignore */ }
    }
    expect(() => sim.verify(a.factorId, a.expectedCode, a.expectedCode)).toThrowError(/locked/);
    expect(() => sim.verify(b.factorId, b.expectedCode, b.expectedCode)).not.toThrow();
  });

  it('expiração exatamente no limite conta como expirado', () => {
    const sim = makeSim();
    const { factorId, expectedCode } = sim.enroll('totp');
    sim.advance(DEFAULT_CONFIG.enrollTtlMs);
    expect(() => sim.verify(factorId, expectedCode, expectedCode)).toThrowError(/expired/);
  });

  it('advance negativo é rejeitado', () => {
    expect(() => makeSim().advance(-1)).toThrowError(/invalid_input/);
  });
});
