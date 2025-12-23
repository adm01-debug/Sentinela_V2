export enum ReportType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  PRODUCTIVITY = 'productivity',
  ATTENDANCE = 'attendance',
  VIOLATIONS = 'violations',
  CUSTOM = 'custom',
}

export const ReportTypeLabels: Record<ReportType, string> = {
  [ReportType.DAILY]: 'Diário',
  [ReportType.WEEKLY]: 'Semanal',
  [ReportType.MONTHLY]: 'Mensal',
  [ReportType.PRODUCTIVITY]: 'Produtividade',
  [ReportType.ATTENDANCE]: 'Presença',
  [ReportType.VIOLATIONS]: 'Violações',
  [ReportType.CUSTOM]: 'Personalizado',
};
