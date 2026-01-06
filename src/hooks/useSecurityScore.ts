import { useState, useEffect, useCallback, useMemo } from 'react';

export interface SecurityCheck {
  id: string;
  name: string;
  weight: number;
  passed: boolean;
  description?: string;
}

export interface UseSecurityScoreOptions {
  checks: SecurityCheck[];
  refreshInterval?: number;
}

export function useSecurityScore(options: UseSecurityScoreOptions) {
  const { checks, refreshInterval } = options;
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const { score, level, passedChecks, failedChecks } = useMemo(() => {
    const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
    const passedWeight = checks.filter(c => c.passed).reduce((sum, c) => sum + c.weight, 0);
    const score = totalWeight > 0 ? Math.round((passedWeight / totalWeight) * 100) : 0;
    const level = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'critical';
    return { score, level, passedChecks: checks.filter(c => c.passed), failedChecks: checks.filter(c => !c.passed) };
  }, [checks]);

  useEffect(() => {
    if (refreshInterval) {
      const interval = setInterval(() => setLastChecked(new Date()), refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  const refresh = useCallback(() => setLastChecked(new Date()), []);

  return { score, level, passedChecks, failedChecks, totalChecks: checks.length, lastChecked, refresh };
}

export default useSecurityScore;
