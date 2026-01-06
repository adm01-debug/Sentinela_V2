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
  onScoreChange?: (score: number) => void;
}

export function useSecurityScore(options: UseSecurityScoreOptions) {
  const { checks, onScoreChange } = options;

  const { score, passedChecks, failedChecks, level } = useMemo(() => {
    const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
    const passedWeight = checks.filter(c => c.passed).reduce((sum, c) => sum + c.weight, 0);
    const score = totalWeight > 0 ? Math.round((passedWeight / totalWeight) * 100) : 0;
    const passedChecks = checks.filter(c => c.passed);
    const failedChecks = checks.filter(c => !c.passed);
    const level = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'critical';
    return { score, passedChecks, failedChecks, level };
  }, [checks]);

  useEffect(() => { onScoreChange?.(score); }, [score, onScoreChange]);

  const getRecommendations = useCallback(() => {
    return failedChecks.sort((a, b) => b.weight - a.weight).map(c => ({ check: c, priority: c.weight >= 20 ? 'high' : c.weight >= 10 ? 'medium' : 'low' }));
  }, [failedChecks]);

  return { score, level, passedChecks, failedChecks, totalChecks: checks.length, getRecommendations };
}

export default useSecurityScore;
