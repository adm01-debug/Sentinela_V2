export interface AttackPattern { id: string; name: string; patterns: RegExp[]; severity: 'low' | 'medium' | 'high' | 'critical'; }
export const attackPatterns: AttackPattern[] = [
  { id: 'SQL_INJECTION', name: 'SQL Injection', patterns: [/('|"|;|--|\/\*|\*\/|xp_)/i, /union\s+select/i, /insert\s+into/i], severity: 'critical' },
  { id: 'XSS', name: 'Cross-Site Scripting', patterns: [/<script/i, /javascript:/i, /on\w+\s*=/i], severity: 'high' },
  { id: 'PATH_TRAVERSAL', name: 'Path Traversal', patterns: [/\.\.\//, /\.\.\\/], severity: 'high' },
  { id: 'COMMAND_INJECTION', name: 'Command Injection', patterns: [/;\s*(ls|cat|rm|wget|curl)/i, /\|\s*\w+/], severity: 'critical' },
];
export class PatternMatcher {
  match(input: string): AttackPattern | null { for (const pattern of attackPatterns) { if (pattern.patterns.some(p => p.test(input))) return pattern; } return null; }
}
export const patternMatcher = new PatternMatcher();
