# Sentinela Desktop Agent

Agente nativo de monitoramento para Windows, construído com Electron.

## Funcionalidades

- 📸 **Captura de tela** - Screenshots periódicos do desktop (intervalo configurável)
- ⌨️ **Registro de teclas** - Contagem de keystrokes por aplicativo
- 📱 **Rastreamento de apps** - Monitoramento de aplicativos usados e tempo em cada um
- 🔒 **Bloqueio de USB** - Bloqueia dispositivos de armazenamento USB via registro do Windows
- 🚫 **Bloqueio de Print Screen** - Intercepta atalhos de captura e limpa clipboard
- 💤 **Detecção de idle** - Detecta quando o usuário está inativo
- 🔄 **Auto-update** - Atualização automática via electron-updater
- 👻 **Modo stealth** - Oculta ícone da bandeja e do gerenciador de tarefas

## Requisitos

- Windows 10/11
- Node.js 20+
- Privilégios de administrador (para bloqueio USB e registro)

## Desenvolvimento

```bash
cd desktop-agent
npm install
npm run dev
```

## Build para distribuição

```bash
npm run build
```

Gera instalador `.exe` em `release/`.

## Instalação silenciosa (Enterprise)

```bash
sentinela-agent-setup.exe /S /AGENT_KEY=sua-chave-aqui
```

## Arquitetura

```
src/
├── main.ts              # Processo principal Electron
├── preload.ts           # Bridge segura entre main e renderer
├── config.ts            # Configurações do agente
├── renderer/
│   └── index.html       # Interface de setup/status
└── services/
    ├── auth.ts           # Autenticação via Agent Key
    ├── dataSender.ts     # Fila de envio com retry
    ├── screenshot.ts     # Captura de tela
    ├── keystroke.ts      # Registro de keystrokes
    ├── appTracker.ts     # Rastreamento de aplicativos
    ├── usbBlocker.ts     # Bloqueio de USB storage
    ├── printScreenBlocker.ts # Bloqueio de print screen
    ├── idleDetector.ts   # Detecção de inatividade
    ├── autoUpdater.ts    # Auto-atualização
    └── dlp/
        └── dlpEngine.ts  # Motor de prevenção de perda de dados (DLP)
```

## Comunicação com Backend

O agente se comunica com o backend via duas Edge Functions:

- `validate-agent-key` - Validação inicial da chave
- `agent-collector` - Envio de dados coletados (autenticado via header `x-agent-key`)

## Modo Stealth

Atalho secreto: `Ctrl+Shift+Alt+S`

- Oculta ícone da bandeja do sistema
- Remove do gerenciador de tarefas
- Protegido por senha para desativar
