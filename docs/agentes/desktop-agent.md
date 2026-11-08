# Agente desktop (Electron) — referência para agentes

Ler quando mexer em `desktop-agent/`, no workflow `desktop-build.yml` ou na coleta feita na máquina
do funcionário.

| O que | Valor |
|---|---|
| Pacote | `sentinela-agent` 1.0.0 (`desktop-agent/package.json`) — **não é workspace do root**, tem `package.json` e `tsconfig.json` próprios |
| Stack | Electron 28 + `electron-vite` 2 + `electron-builder` 24, TypeScript 5.3 |
| Build | `electron-vite build && electron-builder --win` — **Windows-only** |
| Instalador | NSIS com `requestedExecutionLevel: requireAdministrator` |
| Canal de update | `publish: { provider: generic, url: https://releases.sentinela.app/agent }` — **nenhum pipeline publica aí** |
| Backend que ele chama | `https://rmiznlzpbwqpbzaiyydw.supabase.co/functions/v1` (`desktop-agent/src/config.ts:3`, literal, sem fallback de env) — **projeto Supabase diferente** do front e do CLI (`docs/agentes/banco.md`) |
| Coleta | 20 arquivos TS em `desktop-agent/src/`: `screenRecorder`, `keystroke`, `appTracker`, `idleDetector`, `usbBlocker`, `printScreenBlocker`, `dlp/dlpEngine`, `dlp/clipboardDLP`, `dataSender`, `autoUpdater` |
| Intervalo de screenshot | `SCREENSHOT_INTERVAL_MS: 5 * 60 * 1000` (5 min), qualidade 80 (`src/config.ts`) |

## O que está quebrado

- **`desktop-build.yml` não pode passar:** o job roda `cd desktop-agent && npm ci`, mas
  `desktop-agent/` **não tem lockfile** (`ls desktop-agent/` → `README.md`, `package.json`,
  `tsconfig.json`, `renderer/`, `src/`). `npm ci` exige lockfile.
- A matriz do workflow é `macos-latest, windows-latest, ubuntu-latest`, mas o `build` é
  `electron-builder --win` — dois dos três jobs não fazem sentido.
- `actions/setup-node@v4` no workflow **sem `node-version:`** — usa o Node do runner, enquanto o
  `README.md` do agente e o `.nvmrc` pedem 20.
- `scripts/update-desktop-deps.sh` existe e não é chamado por nada.

## Regras

1. O agente roda na máquina do funcionário, como administrador, e captura tela/teclas. **Mudança no
   que é coletado é decisão de negócio** — chame o dono.
2. O endpoint do agente aponta para um terceiro projeto Supabase. Antes de "corrigir" para o projeto
   de produção, confirme com o dono qual é o certo: trocar isso redireciona telemetria de todas as
   instalações ativas.
3. Build e publicação do instalador são manuais hoje. Não prometa release do agente por merge.
4. O front tem telas de live view (`supabase/functions/live-view-authorize`, `webrtc-ice-config`,
   `docs/agent/live-view.md`) que dependem do agente estar instalado e pareado — não é testável só
   pelo front.
