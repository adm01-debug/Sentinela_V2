import { SLO } from './sloDefinition';
export interface ErrorBudget { slo: SLO; total: number; consumed: number; remaining: number; percentConsumed: number; }
export class ErrorBudgetCalculator {
  calculate(slo: SLO, totalRequests: number, failures: number): ErrorBudget { const allowedFailureRate = 100 - slo.target; const totalBudget = (allowedFailureRate / 100) * totalRequests; const consumed = failures; const remaining = Math.max(0, totalBudget - consumed); return { slo, total: totalBudget, consumed, remaining, percentConsumed: (consumed / totalBudget) * 100 }; }
  isExhausted(budget: ErrorBudget): boolean { return budget.remaining <= 0; }
  getBurnRate(budget: ErrorBudget, hours: number): number { return budget.consumed / hours; }
}
export const errorBudgetCalculator = new ErrorBudgetCalculator();
