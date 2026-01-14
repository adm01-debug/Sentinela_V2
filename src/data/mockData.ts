export type EmployeeStatus = 'online' | 'offline' | 'idle';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  device: 'desktop' | 'mobile';
  status: EmployeeStatus;
  lastActivity: string;
  productivityScore: number;
  avatar: string; // emoji for now
}

export type AlertType =
  | 'print_attempt'
  | 'usb_blocked'
  | 'external_hd'
  | 'suspicious_activity'
  | 'unauthorized_app';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Alert {
  id: string;
  employeeId: string;
  employeeName: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  device: string;
  timestamp: string;
}

export const employees: Employee[] = [
  {
    id: '1',
    name: 'Ana Souza',
    email: 'ana@empresa.com',
    department: 'Financeiro',
    device: 'desktop',
    status: 'online',
    lastActivity: 'há 2 min',
    productivityScore: 89,
    avatar: '🧑‍💼',
  },
  {
    id: '2',
    name: 'Bruno Lima',
    email: 'bruno@empresa.com',
    department: 'Vendas',
    device: 'mobile',
    status: 'idle',
    lastActivity: 'há 12 min',
    productivityScore: 74,
    avatar: '🧑‍💻',
  },
];

export const alerts: Alert[] = [
  {
    id: 'a1',
    employeeId: '1',
    employeeName: 'Ana Souza',
    type: 'usb_blocked',
    severity: 'medium',
    message: 'Tentativa de conexão de dispositivo USB bloqueada.',
    device: 'DESKTOP-01',
    timestamp: 'hoje 10:42',
  },
];
