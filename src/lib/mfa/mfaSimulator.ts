// ============================================================
// MFA SIMULATOR
// Máquina de estados determinística para simular fluxos de MFA
// (enroll → verify → unenroll) com timers, rate-limit e falhas.
//
// Objetivo: dar suporte a testes de centenas de cenários,
// independente da rede/Supabase, com API previsível.
// ============================================================

export type FactorType = 'totp' | 'phone';
export type FactorStatus = 'unverified' | 'verified';

export interface SimFactor {
  id: string;
  type: FactorType;
  friendlyName: string;
  status: FactorStatus;
  createdAt: number;
  verifiedAt: number | null;
  /** Only meaningful while status = 'unverified'. */
  expiresAt: number | null;
  /** Failed verification attempts since enroll/last success. */
  failedAttempts: number;
  /** Sliding lockout timestamp when too many failures happen. */
  lockedUntil: number | null;
}

export interface SimulatorConfig {
  /** Milliseconds a pending enrollment stays valid. Default 5 min. */
  enrollTtlMs: number;
  /** Max failed verify attempts before locking the factor. Default 5. */
  maxFailedAttempts: number;
  /** Lockout duration once maxFailedAttempts is hit. Default 15 min. */
  lockoutMs: number;
  /** Minimum interval between two SMS sends per factor. Default 30s. */
  smsResendCooldownMs: number;
  /** Maximum simultaneous unverified factors per user. Default 3. */
  maxPendingFactors: number;
  /** Length of the OTP code accepted. Default 6. */
  otpLength: number;
}

export const DEFAULT_CONFIG: SimulatorConfig = {
  enrollTtlMs: 5 * 60_000,
  maxFailedAttempts: 5,
  lockoutMs: 15 * 60_000,
  smsResendCooldownMs: 30_000,
  maxPendingFactors: 3,
  otpLength: 6,
};

// ------------------------------------------------------------
// Errors (stable codes for assertions)
// ------------------------------------------------------------

export type MFAErrorCode =
  | 'invalid_code'
  | 'expired'
  | 'locked'
  | 'not_found'
  | 'already_verified'
  | 'not_verified'
  | 'too_many_pending'
  | 'sms_cooldown'
  | 'invalid_input';

export class MFAError extends Error {
  constructor(public code: MFAErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'MFAError';
  }
}

// ------------------------------------------------------------
// Simulator
// ------------------------------------------------------------

export interface EnrollResult {
  factorId: string;
  /** For TOTP; empty for SMS. */
  secret: string;
  /** Deterministic OTP the caller must submit to succeed. */
  expectedCode: string;
  expiresAt: number;
}

export class MFASimulator {
  private factors = new Map<string, SimFactor>();
  private lastSmsSentAt = new Map<string, number>();
  private now: number;
  private idCounter = 0;
  private codeCounter = 0;

  constructor(
    public readonly config: SimulatorConfig = DEFAULT_CONFIG,
    startTime = 0,
  ) {
    this.now = startTime;
  }

  // ---------- Time helpers ----------
  advance(ms: number): void {
    if (ms < 0) throw new MFAError('invalid_input', 'ms must be >= 0');
    this.now += ms;
  }
  currentTime(): number { return this.now; }

  // ---------- Introspection ----------
  list(): SimFactor[] { return [...this.factors.values()].map((f) => ({ ...f })); }
  get(factorId: string): SimFactor | undefined {
    const f = this.factors.get(factorId);
    return f ? { ...f } : undefined;
  }
  isEnrolled(): boolean {
    return [...this.factors.values()].some((f) => f.status === 'verified');
  }

  // ---------- Enroll ----------
  enroll(type: FactorType, friendlyName = 'default'): EnrollResult {
    if (!friendlyName.trim()) throw new MFAError('invalid_input', 'friendlyName required');

    const pending = [...this.factors.values()].filter((f) => f.status === 'unverified' && !this.isExpired(f));
    if (pending.length >= this.config.maxPendingFactors) {
      throw new MFAError('too_many_pending');
    }

    const id = `f_${++this.idCounter}`;
    const expectedCode = this.mintCode();
    const factor: SimFactor = {
      id,
      type,
      friendlyName,
      status: 'unverified',
      createdAt: this.now,
      verifiedAt: null,
      expiresAt: this.now + this.config.enrollTtlMs,
      failedAttempts: 0,
      lockedUntil: null,
    };
    this.factors.set(id, factor);

    if (type === 'phone') this.lastSmsSentAt.set(id, this.now);

    return {
      factorId: id,
      secret: type === 'totp' ? `SECRET_${id}` : '',
      expectedCode,
      expiresAt: factor.expiresAt as number,
    };
  }

  // ---------- SMS resend ----------
  resendSms(factorId: string): { expectedCode: string } {
    const f = this.mustGet(factorId);
    if (f.type !== 'phone') throw new MFAError('invalid_input', 'not an SMS factor');
    if (f.status === 'verified') throw new MFAError('already_verified');
    if (this.isExpired(f)) throw new MFAError('expired');

    const last = this.lastSmsSentAt.get(factorId) ?? -Infinity;
    if (this.now - last < this.config.smsResendCooldownMs) {
      throw new MFAError('sms_cooldown');
    }
    this.lastSmsSentAt.set(factorId, this.now);
    return { expectedCode: this.mintCode() };
  }

  // ---------- Verify ----------
  verify(factorId: string, code: string, expectedCode: string): { verifiedAt: number } {
    const f = this.mustGet(factorId);

    if (f.lockedUntil && this.now < f.lockedUntil) throw new MFAError('locked');
    if (f.status === 'verified') throw new MFAError('already_verified');
    if (this.isExpired(f)) throw new MFAError('expired');
    if (!this.isValidOtpShape(code)) throw new MFAError('invalid_input');

    if (code !== expectedCode) {
      f.failedAttempts += 1;
      if (f.failedAttempts >= this.config.maxFailedAttempts) {
        f.lockedUntil = this.now + this.config.lockoutMs;
      }
      this.factors.set(factorId, f);
      throw new MFAError('invalid_code');
    }

    f.status = 'verified';
    f.verifiedAt = this.now;
    f.expiresAt = null;
    f.failedAttempts = 0;
    f.lockedUntil = null;
    this.factors.set(factorId, f);
    return { verifiedAt: this.now };
  }

  // ---------- Unenroll ----------
  unenroll(factorId: string, opts: { requireVerified?: boolean } = {}): void {
    const f = this.mustGet(factorId);
    if (opts.requireVerified && f.status !== 'verified') throw new MFAError('not_verified');
    this.factors.delete(factorId);
    this.lastSmsSentAt.delete(factorId);
  }

  /** Purge pending factors past their TTL. Returns number removed. */
  gcExpired(): number {
    let removed = 0;
    for (const [id, f] of this.factors) {
      if (f.status === 'unverified' && this.isExpired(f)) {
        this.factors.delete(id);
        this.lastSmsSentAt.delete(id);
        removed += 1;
      }
    }
    return removed;
  }

  // ---------- Internals ----------
  private mustGet(id: string): SimFactor {
    const f = this.factors.get(id);
    if (!f) throw new MFAError('not_found');
    return f;
  }
  private isExpired(f: SimFactor): boolean {
    return f.status === 'unverified' && f.expiresAt !== null && this.now >= f.expiresAt;
  }
  private isValidOtpShape(code: string): boolean {
    return new RegExp(`^\\d{${this.config.otpLength}}$`).test(code);
  }
  private mintCode(): string {
    // Deterministic 6-digit code sequence for reproducible tests.
    const n = (++this.codeCounter) % 10 ** this.config.otpLength;
    return n.toString().padStart(this.config.otpLength, '0');
  }
}
