import { DLPPolicy, DataPattern, ScanResult, Violation } from './types';

export class DLPScanner {
  private policies: DLPPolicy[] = [];
  
  addPolicy(policy: DLPPolicy): void { this.policies.push(policy); }
  removePolicy(id: string): void { this.policies = this.policies.filter(p => p.id !== id); }
  
  scan(content: string): ScanResult {
    const violations: Violation[] = [];
    const actions = new Set<string>();
    
    for (const policy of this.policies) {
      for (const pattern of policy.patterns) {
        const matches = this.findMatches(content, pattern);
        matches.forEach(match => {
          violations.push({ policy: policy.id, pattern: pattern.value.toString(), location: match.location, matched: match.text });
          policy.actions.forEach(a => actions.add(a));
        });
      }
    }
    
    return { content, violations, actions: Array.from(actions) as ScanResult['actions'] };
  }
  
  private findMatches(content: string, pattern: DataPattern): { text: string; location: { start: number; end: number } }[] {
    const matches: { text: string; location: { start: number; end: number } }[] = [];
    
    if (pattern.type === 'regex') {
      const regex = new RegExp(pattern.value as string, 'gi');
      let match;
      while ((match = regex.exec(content)) !== null) {
        matches.push({ text: match[0], location: { start: match.index, end: match.index + match[0].length } });
      }
    } else if (pattern.type === 'keyword') {
      const keywords = Array.isArray(pattern.value) ? pattern.value : [pattern.value];
      keywords.forEach(kw => {
        let index = content.toLowerCase().indexOf(kw.toLowerCase());
        while (index !== -1) {
          matches.push({ text: content.substr(index, kw.length), location: { start: index, end: index + kw.length } });
          index = content.toLowerCase().indexOf(kw.toLowerCase(), index + 1);
        }
      });
    }
    
    return matches;
  }
}