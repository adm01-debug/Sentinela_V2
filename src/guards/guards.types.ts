export interface GuardProps { children: React.ReactNode; fallback?: React.ReactNode; redirectTo?: string; }
export type GuardResult = { allowed: boolean; reason?: string; };
export type GuardCheck = () => GuardResult | Promise<GuardResult>;
export interface ComposedGuardProps { guards: GuardCheck[]; mode: 'all' | 'any'; children: React.ReactNode; fallback?: React.ReactNode; }
