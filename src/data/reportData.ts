export interface ReportData {
  period: {
    start: Date;
    end: Date;
  };
  department: string;
  summary: {
    totalEmployees: number;
    avgProductivity: number;
    totalAlerts: number;
    blockedAttempts: number;
  };
  alertsByType: {
    type: string;
    count: number;
  }[];
  productivityByDepartment: {
    department: string;
    score: number;
    employees: number;
  }[];
  topAlertEmployees: {
    name: string;
    department: string;
    alerts: number;
  }[];
  dailyActivity: {
    date: string;
    productive: number;
    neutral: number;
    unproductive: number;
  }[];
}

export const departments = [
  'Todos',
  'Desenvolvimento',
  'Marketing',
  'Financeiro',
  'RH',
  'Design',
  'Vendas',
  'Suporte',
];

export const generateMockReportData = (
  startDate: Date,
  endDate: Date,
  department: string
): ReportData => {
  const deptFilter = department === 'Todos' ? null : department;
  
  return {
    period: { start: startDate, end: endDate },
    department,
    summary: {
      totalEmployees: deptFilter ? 8 : 45,
      avgProductivity: deptFilter ? 85 : 82,
      totalAlerts: deptFilter ? 12 : 67,
      blockedAttempts: deptFilter ? 8 : 42,
    },
    alertsByType: [
      { type: 'Print Screen Bloqueado', count: 23 },
      { type: 'USB Bloqueado', count: 15 },
      { type: 'HD Externo Bloqueado', count: 8 },
      { type: 'Site Não Autorizado', count: 14 },
      { type: 'App Não Autorizado', count: 7 },
    ],
    productivityByDepartment: [
      { department: 'Desenvolvimento', score: 92, employees: 12 },
      { department: 'Design', score: 90, employees: 6 },
      { department: 'Marketing', score: 88, employees: 8 },
      { department: 'Suporte', score: 85, employees: 5 },
      { department: 'Financeiro', score: 82, employees: 4 },
      { department: 'RH', score: 80, employees: 3 },
      { department: 'Vendas', score: 78, employees: 7 },
    ],
    topAlertEmployees: [
      { name: 'Pedro Santos', department: 'Financeiro', alerts: 8 },
      { name: 'João Oliveira', department: 'Desenvolvimento', alerts: 6 },
      { name: 'Ricardo Mendes', department: 'Vendas', alerts: 5 },
      { name: 'Fernanda Lima', department: 'Design', alerts: 4 },
      { name: 'Carlos Silva', department: 'Desenvolvimento', alerts: 3 },
    ],
    dailyActivity: [
      { date: 'Seg', productive: 85, neutral: 10, unproductive: 5 },
      { date: 'Ter', productive: 88, neutral: 8, unproductive: 4 },
      { date: 'Qua', productive: 82, neutral: 12, unproductive: 6 },
      { date: 'Qui', productive: 90, neutral: 7, unproductive: 3 },
      { date: 'Sex', productive: 78, neutral: 15, unproductive: 7 },
    ],
  };
};
