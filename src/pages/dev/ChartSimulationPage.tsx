import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ThemeProvider, useTheme } from '@/providers/ThemeProvider';
import { ViolationsByTypeChart } from '@/components/ViolationsByTypeChart';
import { ViolationsBySeverityChart } from '@/components/ViolationsBySeverityChart';
import { ViolationsTrendChart } from '@/components/ViolationsTrendChart';
import type { SecurityViolation } from '@/hooks/useSecurityViolations';

/**
 * Dev-only page for large-scale chart contrast/theme simulation.
 * Generates seeded violations, forces dark theme, renders every chart
 * so a Playwright harness can screenshot & analyze contrast.
 *
 * Usage: /dev/chart-simulation?seed=42&count=350&theme=dark
 */

// Deterministic seeded PRNG (mulberry32)
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const VIOLATION_TYPES = [
  'unauthorized_access',
  'data_exfiltration',
  'policy_breach',
  'malware_detected',
  'suspicious_login',
  'privilege_escalation',
  'geofence_breach',
  'idle_timeout_bypass',
];

function generateViolations(seed: number, count: number): SecurityViolation[] {
  const rnd = mulberry32(seed);
  const now = Date.now();
  const distributionBias = rnd(); // some seeds skew heavy toward critical, others low
  const typeSubset = VIOLATION_TYPES.slice(0, 1 + Math.floor(rnd() * VIOLATION_TYPES.length));

  return Array.from({ length: count }, (_, i) => {
    const sevRoll = rnd() * (1 + distributionBias);
    const severity =
      sevRoll > 1.4 ? 'critical' : sevRoll > 1.0 ? 'high' : sevRoll > 0.5 ? 'medium' : 'low';
    return {
      id: `${seed}-${i}`,
      company_id: 'sim',
      employee_id: `emp-${Math.floor(rnd() * 40)}`,
      violation_type: typeSubset[Math.floor(rnd() * typeSubset.length)],
      severity: severity as SecurityViolation['severity'],
      description: 'simulation',
      status: 'open',
      metadata: {},
      created_at: new Date(now - Math.floor(rnd() * 90 * 24 * 3600 * 1000)).toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as SecurityViolation;
  });
}

function ForceTheme({ theme }: { theme: 'dark' | 'light' }) {
  const { setTheme } = useTheme();
  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);
  return null;
}

function Inner() {
  const [params] = useSearchParams();
  const seed = Number(params.get('seed') ?? '1');
  const count = Math.min(Number(params.get('count') ?? '250'), 5000);
  const theme = (params.get('theme') === 'light' ? 'light' : 'dark') as 'dark' | 'light';

  const violations = useMemo(() => generateViolations(seed, count), [seed, count]);

  return (
    <div className="min-h-screen bg-background p-6 space-y-8" data-sim-ready="true">
      <ForceTheme theme={theme} />
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Chart Contrast Simulation</h1>
        <p className="text-sm text-muted-foreground">
          seed=<span data-testid="seed">{seed}</span> · count=
          <span data-testid="count">{violations.length}</span> · theme=
          <span data-testid="theme">{theme}</span>
        </p>
      </header>

      <section
        data-chart="by-type"
        className="rounded-lg border border-border bg-card p-4"
      >
        <h2 className="mb-3 text-sm font-medium text-foreground">Violações por Tipo</h2>
        <ViolationsByTypeChart violations={violations} />
      </section>

      <section
        data-chart="by-severity"
        className="rounded-lg border border-border bg-card p-4"
      >
        <h2 className="mb-3 text-sm font-medium text-foreground">Violações por Severidade</h2>
        <ViolationsBySeverityChart violations={violations} />
      </section>

      <section
        data-chart="trend"
        className="rounded-lg border border-border bg-card p-4"
      >
        <h2 className="mb-3 text-sm font-medium text-foreground">Tendência de Violações</h2>
        <ViolationsTrendChart violations={violations} />
      </section>
    </div>
  );
}

export default function ChartSimulationPage() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Inner />
    </ThemeProvider>
  );
}
