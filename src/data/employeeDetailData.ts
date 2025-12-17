export interface ApplicationUsage {
  id: string;
  name: string;
  icon: string;
  category: 'productive' | 'neutral' | 'unproductive';
  duration: number; // minutes
  lastUsed: string;
}

export interface ActivityEntry {
  id: string;
  type: 'login' | 'logout' | 'app_open' | 'app_close' | 'idle_start' | 'idle_end' | 'alert';
  description: string;
  timestamp: string;
  details?: string;
}

export const employeeApplications: Record<string, ApplicationUsage[]> = {
  '1': [
    { id: '1', name: 'VS Code', icon: '💻', category: 'productive', duration: 245, lastUsed: '10:30' },
    { id: '2', name: 'Chrome', icon: '🌐', category: 'neutral', duration: 120, lastUsed: '10:28' },
    { id: '3', name: 'Slack', icon: '💬', category: 'productive', duration: 85, lastUsed: '10:25' },
    { id: '4', name: 'Terminal', icon: '⌨️', category: 'productive', duration: 60, lastUsed: '10:15' },
    { id: '5', name: 'Spotify', icon: '🎵', category: 'neutral', duration: 180, lastUsed: '10:30' },
    { id: '6', name: 'YouTube', icon: '📺', category: 'unproductive', duration: 15, lastUsed: '09:30' },
  ],
  '2': [
    { id: '1', name: 'Figma', icon: '🎨', category: 'productive', duration: 180, lastUsed: '10:32' },
    { id: '2', name: 'Chrome', icon: '🌐', category: 'neutral', duration: 90, lastUsed: '10:30' },
    { id: '3', name: 'Slack', icon: '💬', category: 'productive', duration: 45, lastUsed: '10:15' },
    { id: '4', name: 'Photoshop', icon: '🖼️', category: 'productive', duration: 120, lastUsed: '09:45' },
    { id: '5', name: 'Instagram', icon: '📸', category: 'unproductive', duration: 30, lastUsed: '10:00' },
  ],
  '3': [
    { id: '1', name: 'Excel', icon: '📊', category: 'productive', duration: 200, lastUsed: '10:15' },
    { id: '2', name: 'SAP', icon: '🏢', category: 'productive', duration: 150, lastUsed: '10:10' },
    { id: '3', name: 'Outlook', icon: '📧', category: 'productive', duration: 80, lastUsed: '10:00' },
    { id: '4', name: 'Chrome', icon: '🌐', category: 'neutral', duration: 60, lastUsed: '09:55' },
  ],
};

export const employeeActivities: Record<string, ActivityEntry[]> = {
  '1': [
    { id: '1', type: 'alert', description: 'HD externo bloqueado', timestamp: '09:15', details: 'Tentativa de conexão de dispositivo não autorizado' },
    { id: '2', type: 'app_open', description: 'VS Code iniciado', timestamp: '08:35', details: 'Projeto: securewatch-api' },
    { id: '3', type: 'login', description: 'Login realizado', timestamp: '08:30', details: 'Desktop-DEV-001' },
    { id: '4', type: 'idle_end', description: 'Retorno de inatividade', timestamp: '08:32' },
  ],
  '2': [
    { id: '1', type: 'app_open', description: 'Figma iniciado', timestamp: '10:00', details: 'Dashboard Redesign' },
    { id: '2', type: 'login', description: 'Login realizado', timestamp: '09:00', details: 'Desktop-MKT-001' },
  ],
  '3': [
    { id: '1', type: 'alert', description: 'Print Screen bloqueado', timestamp: '10:32', details: 'Tentativa em documento financeiro' },
    { id: '2', type: 'idle_start', description: 'Inatividade detectada', timestamp: '10:00' },
    { id: '3', type: 'app_open', description: 'Excel iniciado', timestamp: '09:00', details: 'Relatório Q4' },
    { id: '4', type: 'login', description: 'Login realizado', timestamp: '08:45', details: 'Desktop-FIN-003' },
  ],
};

// Default data for employees without specific data
export const defaultApplications: ApplicationUsage[] = [
  { id: '1', name: 'Chrome', icon: '🌐', category: 'neutral', duration: 120, lastUsed: '10:00' },
  { id: '2', name: 'Outlook', icon: '📧', category: 'productive', duration: 60, lastUsed: '09:45' },
  { id: '3', name: 'Slack', icon: '💬', category: 'productive', duration: 45, lastUsed: '09:30' },
];

export const defaultActivities: ActivityEntry[] = [
  { id: '1', type: 'login', description: 'Login realizado', timestamp: '08:30' },
];
