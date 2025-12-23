export enum ViolationSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export const ViolationSeverityLabels: Record<ViolationSeverity, string> = {
  [ViolationSeverity.LOW]: 'Baixa',
  [ViolationSeverity.MEDIUM]: 'Média',
  [ViolationSeverity.HIGH]: 'Alta',
  [ViolationSeverity.CRITICAL]: 'Crítica',
};

export const ViolationSeverityColors: Record<ViolationSeverity, string> = {
  [ViolationSeverity.LOW]: 'green',
  [ViolationSeverity.MEDIUM]: 'yellow',
  [ViolationSeverity.HIGH]: 'orange',
  [ViolationSeverity.CRITICAL]: 'red',
};
