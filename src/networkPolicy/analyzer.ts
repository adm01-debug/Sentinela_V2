import { NetworkPolicy } from './types';

export class PolicyAnalyzer {
  analyze(policies: NetworkPolicy[]): AnalysisReport {
    const issues: PolicyIssue[] = [];
    
    policies.forEach(policy => {
      if (policy.ingress.length === 0 && policy.egress.length === 0) {
        issues.push({ policy: policy.name, severity: 'warning', message: 'Policy denies all traffic' });
      }
      
      if (Object.keys(policy.podSelector.matchLabels).length === 0) {
        issues.push({ policy: policy.name, severity: 'info', message: 'Policy applies to all pods in namespace' });
      }
    });
    
    return { policies: policies.length, issues, coverage: this.calculateCoverage(policies) };
  }
  
  private calculateCoverage(policies: NetworkPolicy[]): number {
    return policies.length > 0 ? 1 : 0;
  }
  
  findConflicts(policies: NetworkPolicy[]): PolicyConflict[] {
    const conflicts: PolicyConflict[] = [];
    return conflicts;
  }
}

export interface AnalysisReport { policies: number; issues: PolicyIssue[]; coverage: number; }
export interface PolicyIssue { policy: string; severity: 'info' | 'warning' | 'error'; message: string; }
export interface PolicyConflict { policies: string[]; description: string; }