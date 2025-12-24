import { AlertRule, AlertSeverity } from './types';
import { AlertManager } from './manager';

export class RuleEvaluator {
  private rules: AlertRule[] = [];
  
  constructor(private manager: AlertManager) {}
  
  addRule(rule: AlertRule): void { this.rules.push(rule); }
  
  evaluate(): EvaluationResult[] {
    return this.rules.map(rule => {
      const firing = rule.condition();
      if (firing && !this.manager.isSilenced(rule.name)) {
        this.manager.fire(rule.name, rule.severity, rule.annotations['summary'] ?? rule.name, rule.labels);
      }
      return { rule: rule.name, firing };
    });
  }
}

export interface EvaluationResult { rule: string; firing: boolean; }

export class RuleBuilder {
  private rule: Partial<AlertRule> = { labels: {}, annotations: {} };
  
  name(name: string): this { this.rule.name = name; return this; }
  condition(fn: () => boolean): this { this.rule.condition = fn; return this; }
  severity(s: AlertSeverity): this { this.rule.severity = s; return this; }
  label(key: string, value: string): this { this.rule.labels![key] = value; return this; }
  annotate(key: string, value: string): this { this.rule.annotations![key] = value; return this; }
  
  build(): AlertRule { return this.rule as AlertRule; }
}