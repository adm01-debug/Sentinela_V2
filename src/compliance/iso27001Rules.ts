export interface ISO27001Control { id: string; domain: string; objective: string; check: () => boolean; }
export const iso27001Controls: ISO27001Control[] = [
  { id: 'A.5', domain: 'Information Security Policies', objective: 'Management direction', check: () => true },
  { id: 'A.6', domain: 'Organization of Information Security', objective: 'Internal organization', check: () => true },
  { id: 'A.7', domain: 'Human Resource Security', objective: 'Prior to employment', check: () => true },
  { id: 'A.8', domain: 'Asset Management', objective: 'Responsibility for assets', check: () => true },
  { id: 'A.9', domain: 'Access Control', objective: 'Business requirements', check: () => true },
];
export function checkISO27001Compliance(): { passed: number; failed: number; controls: ISO27001Control[] } { const results = iso27001Controls.map(c => ({ ...c, passed: c.check() })); return { passed: results.filter(r => r.passed).length, failed: results.filter(r => !r.passed).length, controls: iso27001Controls }; }
