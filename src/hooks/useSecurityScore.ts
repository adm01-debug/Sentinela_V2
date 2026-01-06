import { useState, useEffect, useCallback, useMemo } from "react";

interface SecurityCheck {
  id: string;
  name: string;
  weight: number;
  check: () => boolean | Promise<boolean>;
}

interface SecurityScoreResult {
  score: number;
  maxScore: number;
  percentage: number;
  level: "critical" | "low" | "medium" | "high" | "excellent";
  passedChecks: string[];
  failedChecks: string[];
}

const defaultChecks: SecurityCheck[] = [
  { id: "https", name: "HTTPS", weight: 20, check: () => location.protocol === "https:" },
  { id: "2fa", name: "2FA Ativado", weight: 25, check: () => localStorage.getItem("2fa_enabled") === "true" },
  { id: "strongPassword", name: "Senha Forte", weight: 15, check: () => localStorage.getItem("password_strength") === "strong" },
  { id: "recentLogin", name: "Login Recente", weight: 10, check: () => { const last = localStorage.getItem("last_login"); return last ? Date.now() - Number(last) < 7 * 24 * 60 * 60 * 1000 : false; } },
  { id: "noSuspiciousActivity", name: "Sem Atividade Suspeita", weight: 30, check: () => localStorage.getItem("suspicious_activity") !== "true" },
];

export function useSecurityScore(customChecks?: SecurityCheck[]) {
  const checks = customChecks || defaultChecks;
  const [result, setResult] = useState<SecurityScoreResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const maxScore = useMemo(() => checks.reduce((sum, c) => sum + c.weight, 0), [checks]);

  const calculate = useCallback(async () => {
    setIsCalculating(true);
    const passed: string[] = [];
    const failed: string[] = [];
    let score = 0;

    for (const check of checks) {
      try {
        const result = await check.check();
        if (result) { passed.push(check.id); score += check.weight; }
        else failed.push(check.id);
      } catch { failed.push(check.id); }
    }

    const percentage = Math.round((score / maxScore) * 100);
    const level = percentage >= 90 ? "excellent" : percentage >= 70 ? "high" : percentage >= 50 ? "medium" : percentage >= 30 ? "low" : "critical";

    setResult({ score, maxScore, percentage, level, passedChecks: passed, failedChecks: failed });
    setIsCalculating(false);
  }, [checks, maxScore]);

  useEffect(() => { calculate(); }, [calculate]);

  return { ...result, isCalculating, recalculate: calculate };
}

export default useSecurityScore;
