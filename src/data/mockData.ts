export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  avatar: string;
  status: 'online' | 'offline' | 'idle';
  device: 'desktop' | 'mobile';
  lastActivity: string;
  productivityScore: number;
}

export interface Alert {
  id: string;
  type: 'print_attempt' | 'usb_blocked' | 'external_hd' | 'suspicious_activity' | 'unauthorized_app';
  severity: 'low' | 'medium' | 'high' | 'critical';
  employeeId: string;
  employeeName: string;
  message: string;
  timestamp: string;
  device: string;
}

export interface ActivityLog {
  id: string;
  employeeId: string;
  application: string;
  duration: number;
  category: 'productive' | 'neutral' | 'unproductive';
  timestamp: string;
}

export const employees: Employee[] = [
  { id: '1', name: 'Carlos Silva', email: 'carlos.silva@empresa.com', department: 'Desenvolvimento', avatar: 'CS', status: 'online', device: 'desktop', lastActivity: '2 min atrás', productivityScore: 92 },
  { id: '2', name: 'Ana Rodrigues', email: 'ana.rodrigues@empresa.com', department: 'Marketing', avatar: 'AR', status: 'online', device: 'desktop', lastActivity: 'Agora', productivityScore: 88 },
  { id: '3', name: 'Pedro Santos', email: 'pedro.santos@empresa.com', department: 'Financeiro', avatar: 'PS', status: 'idle', device: 'desktop', lastActivity: '15 min atrás', productivityScore: 75 },
  { id: '4', name: 'Maria Costa', email: 'maria.costa@empresa.com', department: 'RH', avatar: 'MC', status: 'online', device: 'mobile', lastActivity: '5 min atrás', productivityScore: 95 },
  { id: '5', name: 'João Oliveira', email: 'joao.oliveira@empresa.com', department: 'Desenvolvimento', avatar: 'JO', status: 'offline', device: 'desktop', lastActivity: '2 horas atrás', productivityScore: 82 },
  { id: '6', name: 'Fernanda Lima', email: 'fernanda.lima@empresa.com', department: 'Design', avatar: 'FL', status: 'online', device: 'desktop', lastActivity: 'Agora', productivityScore: 90 },
  { id: '7', name: 'Ricardo Mendes', email: 'ricardo.mendes@empresa.com', department: 'Vendas', avatar: 'RM', status: 'online', device: 'mobile', lastActivity: '1 min atrás', productivityScore: 78 },
  { id: '8', name: 'Juliana Ferreira', email: 'juliana.ferreira@empresa.com', department: 'Suporte', avatar: 'JF', status: 'idle', device: 'desktop', lastActivity: '30 min atrás', productivityScore: 85 },
];

export const alerts: Alert[] = [
  { id: '1', type: 'print_attempt', severity: 'high', employeeId: '3', employeeName: 'Pedro Santos', message: 'Tentativa de captura de tela bloqueada', timestamp: '10:32', device: 'Desktop-FIN-003' },
  { id: '2', type: 'usb_blocked', severity: 'critical', employeeId: '5', employeeName: 'João Oliveira', message: 'Pen drive não autorizado detectado e bloqueado', timestamp: '09:45', device: 'Desktop-DEV-002' },
  { id: '3', type: 'external_hd', severity: 'critical', employeeId: '1', employeeName: 'Carlos Silva', message: 'HD externo bloqueado - tentativa de conexão', timestamp: '09:15', device: 'Desktop-DEV-001' },
  { id: '4', type: 'suspicious_activity', severity: 'medium', employeeId: '7', employeeName: 'Ricardo Mendes', message: 'Acesso a site não autorizado detectado', timestamp: '08:55', device: 'Mobile-VEN-001' },
  { id: '5', type: 'unauthorized_app', severity: 'low', employeeId: '2', employeeName: 'Ana Rodrigues', message: 'Aplicativo não autorizado executado', timestamp: '08:30', device: 'Desktop-MKT-001' },
  { id: '6', type: 'print_attempt', severity: 'high', employeeId: '6', employeeName: 'Fernanda Lima', message: 'Print Screen bloqueado em documento confidencial', timestamp: '08:12', device: 'Desktop-DES-001' },
];

export const activityData = [
  { hour: '08:00', productive: 85, neutral: 10, unproductive: 5 },
  { hour: '09:00', productive: 90, neutral: 7, unproductive: 3 },
  { hour: '10:00', productive: 88, neutral: 8, unproductive: 4 },
  { hour: '11:00', productive: 75, neutral: 15, unproductive: 10 },
  { hour: '12:00', productive: 40, neutral: 45, unproductive: 15 },
  { hour: '13:00', productive: 65, neutral: 25, unproductive: 10 },
  { hour: '14:00', productive: 92, neutral: 5, unproductive: 3 },
  { hour: '15:00', productive: 88, neutral: 8, unproductive: 4 },
  { hour: '16:00', productive: 82, neutral: 12, unproductive: 6 },
  { hour: '17:00', productive: 78, neutral: 15, unproductive: 7 },
];

export const deviceStats = {
  totalDevices: 45,
  desktops: 32,
  mobiles: 13,
  online: 38,
  offline: 7,
  blockedAttempts: 23,
  alertsToday: 12,
};

export const securityMetrics = {
  printBlocked: 156,
  usbBlocked: 42,
  hdBlocked: 18,
  suspiciousActivity: 89,
};
