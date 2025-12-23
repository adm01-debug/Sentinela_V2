import type { Violation } from '@/types';

export const mockViolations: Violation[] = [
  { id: '1', employeeId: '3', type: 'productivity', severity: 'low', description: 'Tempo ocioso excessivo', status: 'pending', detectedAt: new Date() },
  { id: '2', employeeId: '2', type: 'policy', severity: 'medium', description: 'Acesso a site bloqueado', status: 'acknowledged', detectedAt: new Date() },
  { id: '3', employeeId: '1', type: 'security', severity: 'high', description: 'Tentativa de acesso não autorizado', status: 'resolved', detectedAt: new Date(), resolvedAt: new Date() },
];
