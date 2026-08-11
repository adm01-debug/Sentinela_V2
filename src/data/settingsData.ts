// ============================================================
// SECURITY POLICIES DATA
// ============================================================

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  category: 'device' | 'screen' | 'network';
  enabled: boolean;
}

export const defaultPolicies: SecurityPolicy[] = [
  { id: '1', name: 'Bloquear dispositivos USB', description: 'Impede o uso de pen drives e dispositivos USB externos', category: 'device', enabled: true },
  { id: '2', name: 'Bloquear HD externo', description: 'Impede o uso de discos externos', category: 'device', enabled: false },
  { id: '3', name: 'Captura de tela', description: 'Habilita capturas periódicas da tela', category: 'screen', enabled: true },
  { id: '4', name: 'Gravação de vídeo', description: 'Grava sessões de trabalho em vídeo', category: 'screen', enabled: false },
  { id: '5', name: 'Monitorar clipboard', description: 'Monitora atividades de copiar e colar', category: 'screen', enabled: true },
  { id: '6', name: 'Bloquear sites', description: 'Bloqueia acesso a sites não permitidos', category: 'network', enabled: true },
  { id: '7', name: 'Bloquear downloads', description: 'Impede downloads de arquivos', category: 'network', enabled: false },
  { id: '8', name: 'VPN obrigatória', description: 'Exige conexão VPN para acesso', category: 'network', enabled: false },
];

// ============================================================
// APPLICATION RULES DATA
// ============================================================

export interface ApplicationRule {
  id: string;
  name: string;
  category: string;
  status: 'allowed' | 'blocked' | 'monitored';
}

export const defaultAppRules: ApplicationRule[] = [
  { id: '1', name: 'VS Code', category: 'development', status: 'allowed' },
  { id: '2', name: 'Chrome', category: 'productivity', status: 'allowed' },
  { id: '3', name: 'Slack', category: 'communication', status: 'allowed' },
  { id: '4', name: 'Discord', category: 'entertainment', status: 'blocked' },
  { id: '5', name: 'Spotify', category: 'entertainment', status: 'monitored' },
  { id: '6', name: 'Netflix', category: 'entertainment', status: 'blocked' },
  { id: '7', name: 'WhatsApp', category: 'communication', status: 'monitored' },
  { id: '8', name: 'Excel', category: 'productivity', status: 'allowed' },
  { id: '9', name: 'Figma', category: 'development', status: 'allowed' },
  { id: '10', name: 'YouTube', category: 'entertainment', status: 'monitored' },
];

// ============================================================
// LABELS
// ============================================================

export const categoryLabels: Record<string, string> = {
  device: 'Dispositivos',
  screen: 'Captura de Tela',
  network: 'Rede',
  productivity: 'Produtividade',
  communication: 'Comunicação',
  entertainment: 'Entretenimento',
  development: 'Desenvolvimento',
  other: 'Outros',
  all: 'Todas',
};

export const statusLabels: Record<string, string> = {
  allowed: '✓ Permitido',
  blocked: '✗ Bloqueado',
  monitored: '◐ Monitorado',
};
