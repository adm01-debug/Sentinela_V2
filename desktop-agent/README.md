# Sentinela Desktop Agent

Agent de monitoramento para desktop (Windows, macOS, Linux).

## Visão Geral

O Desktop Agent é responsável por:
- Capturar screenshots em intervalos configuráveis
- Monitorar atividades de aplicativos
- Registrar URLs visitadas
- Detectar tempo ocioso
- Enviar dados para o servidor

## Arquitetura

```
desktop-agent/
├── src/
│   ├── main.ts           # Entry point Electron
│   ├── preload.ts        # Preload script
│   ├── agent/
│   │   ├── ActivityMonitor.ts
│   │   ├── ScreenCapture.ts
│   │   ├── IdleDetector.ts
│   │   └── DataSync.ts
│   ├── services/
│   │   ├── ApiService.ts
│   │   ├── StorageService.ts
│   │   └── ConfigService.ts
│   └── utils/
│       ├── logger.ts
│       └── crypto.ts
├── package.json
├── electron-builder.yml
└── tsconfig.json
```

## Requisitos

- Node.js 18+
- Electron 28+
- Windows 10+ / macOS 12+ / Ubuntu 20.04+

## Instalação

### Desenvolvimento

```bash
cd desktop-agent
npm install
npm run dev
```

### Build

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

## Configuração

O agent usa um arquivo de configuração em:
- Windows: `%APPDATA%/sentinela-agent/config.json`
- macOS: `~/Library/Application Support/sentinela-agent/config.json`
- Linux: `~/.config/sentinela-agent/config.json`

```json
{
  "apiUrl": "https://api.sentinela.com",
  "apiKey": "sk_live_...",
  "captureInterval": 300,
  "screenshotQuality": 80,
  "idleThreshold": 300,
  "features": {
    "screenshots": true,
    "appMonitoring": true,
    "urlTracking": true,
    "idleDetection": true
  }
}
```

## Funcionalidades

### Captura de Screenshots

```typescript
// Configuração
interface ScreenshotConfig {
  interval: number;      // Intervalo em segundos
  quality: number;       // Qualidade JPEG (1-100)
  monitors: 'all' | 'primary';
  blur: boolean;         // Aplicar blur em áreas sensíveis
}
```

### Monitoramento de Aplicativos

Registra:
- Nome do aplicativo ativo
- Título da janela
- Tempo de uso
- Categoria (produtivo/improdutivo)

### Rastreamento de URLs

- Suporta Chrome, Firefox, Edge, Safari
- Categoriza automaticamente URLs
- Detecta sites bloqueados

### Detecção de Ociosidade

- Monitora movimento do mouse
- Monitora teclas pressionadas
- Configura threshold de ociosidade

## API de Comunicação

### Endpoints

```typescript
// Enviar screenshot
POST /api/agent/screenshots
Content-Type: multipart/form-data
Authorization: Bearer <api_key>

// Enviar atividades
POST /api/agent/activities
Content-Type: application/json
Authorization: Bearer <api_key>

// Heartbeat
POST /api/agent/heartbeat
Authorization: Bearer <api_key>

// Buscar configurações
GET /api/agent/config
Authorization: Bearer <api_key>
```

### Autenticação

O agent usa API Key para autenticação:

```typescript
const headers = {
  'Authorization': `Bearer ${apiKey}`,
  'X-Agent-Version': '1.0.0',
  'X-Device-Id': deviceId,
};
```

## Sincronização de Dados

### Estratégia de Retry

```typescript
const retryConfig = {
  maxRetries: 5,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
};
```

### Cache Local

Dados são armazenados localmente até sincronização:
- SQLite para atividades
- Filesystem para screenshots

## Segurança

### Criptografia

- Dados em repouso: AES-256
- Dados em trânsito: TLS 1.3
- API Key armazenada em keychain do SO

### Privacidade

- Screenshots podem ter blur em áreas sensíveis
- Lista de apps/URLs ignorados
- Modo "não rastrear" para pausas

## Auto-Update

O agent suporta auto-update via:
- Windows: Squirrel
- macOS: Sparkle
- Linux: AppImage

```typescript
autoUpdater.checkForUpdatesAndNotify();
```

## Logs

Localização dos logs:
- Windows: `%APPDATA%/sentinela-agent/logs/`
- macOS: `~/Library/Logs/sentinela-agent/`
- Linux: `~/.local/share/sentinela-agent/logs/`

Níveis de log: `error`, `warn`, `info`, `debug`

## Troubleshooting

### Agent não conecta

1. Verificar API Key
2. Verificar conectividade
3. Verificar firewall
4. Verificar logs

### Screenshots não capturam

1. Verificar permissões de tela
2. macOS: Permitir em Preferências > Segurança
3. Verificar espaço em disco

### Alto uso de CPU

1. Aumentar intervalo de captura
2. Reduzir qualidade de screenshots
3. Desativar features não usadas

## Desenvolvimento

### Estrutura de Testes

```bash
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run test:coverage # Coverage report
```

### Debug

```bash
DEBUG=sentinela:* npm run dev
```

## Contribuição

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/xyz`)
3. Commit (`git commit -am 'Add xyz'`)
4. Push (`git push origin feature/xyz`)
5. Abra um Pull Request
