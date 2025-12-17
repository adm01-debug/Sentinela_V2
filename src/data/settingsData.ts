export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'device' | 'screen' | 'network';
}

export interface ApplicationRule {
  id: string;
  name: string;
  category: 'productivity' | 'communication' | 'entertainment' | 'development' | 'other';
  status: 'allowed' | 'blocked' | 'monitored';
}

export const defaultPolicies: SecurityPolicy[] = [
  { id: '1', name: 'Bloquear USB', description: 'Impede conexão de dispositivos USB não autorizados', enabled: true, category: 'device' },
  { id: '2', name: 'Bloquear HD Externo', description: 'Impede conexão de HDs externos não autorizados', enabled: true, category: 'device' },
  { id: '3', name: 'Bloquear Print Screen', description: 'Impede capturas de tela em aplicativos sensíveis', enabled: true, category: 'screen' },
  { id: '4', name: 'Bloquear Gravação de Tela', description: 'Impede gravação de tela por softwares', enabled: true, category: 'screen' },
  { id: '5', name: 'Monitorar Clipboard', description: 'Monitora cópias de conteúdo sensível', enabled: false, category: 'screen' },
  { id: '6', name: 'Bloquear Sites Não Autorizados', description: 'Bloqueia acesso a sites da lista negra', enabled: true, category: 'network' },
  { id: '7', name: 'Monitorar Downloads', description: 'Monitora todos os downloads realizados', enabled: true, category: 'network' },
  { id: '8', name: 'Bloquear VPN Não Autorizada', description: 'Impede uso de VPNs não aprovadas', enabled: false, category: 'network' },
];

export const defaultApplicationRules: ApplicationRule[] = [
  { id: '1', name: 'VS Code', category: 'development', status: 'allowed' },
  { id: '2', name: 'Chrome', category: 'productivity', status: 'monitored' },
  { id: '3', name: 'Slack', category: 'communication', status: 'allowed' },
  { id: '4', name: 'Discord', category: 'communication', status: 'blocked' },
  { id: '5', name: 'Spotify', category: 'entertainment', status: 'monitored' },
  { id: '6', name: 'Netflix', category: 'entertainment', status: 'blocked' },
  { id: '7', name: 'WhatsApp', category: 'communication', status: 'monitored' },
  { id: '8', name: 'Telegram', category: 'communication', status: 'blocked' },
  { id: '9', name: 'Excel', category: 'productivity', status: 'allowed' },
  { id: '10', name: 'Word', category: 'productivity', status: 'allowed' },
  { id: '11', name: 'Figma', category: 'development', status: 'allowed' },
  { id: '12', name: 'YouTube', category: 'entertainment', status: 'monitored' },
  { id: '13', name: 'Steam', category: 'entertainment', status: 'blocked' },
  { id: '14', name: 'Zoom', category: 'communication', status: 'allowed' },
  { id: '15', name: 'Teams', category: 'communication', status: 'allowed' },
];

export const categoryLabels: Record<string, string> = {
  device: 'Dispositivos',
  screen: 'Captura de Tela',
  network: 'Rede',
  productivity: 'Produtividade',
  communication: 'Comunicação',
  entertainment: 'Entretenimento',
  development: 'Desenvolvimento',
  other: 'Outros',
};

export const statusLabels: Record<string, string> = {
  allowed: 'Permitido',
  blocked: 'Bloqueado',
  monitored: 'Monitorado',
};
