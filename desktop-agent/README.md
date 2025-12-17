# SecureWatch Desktop Agent

Agente de monitoramento para Windows, macOS e Linux.

## Recursos

- ✅ Monitoramento de teclas digitadas
- ✅ Capturas de tela periódicas
- ✅ Análise de produtividade por aplicativo
- ✅ Bloqueio de Print Screen
- ✅ Detecção de dispositivos USB
- ✅ Aviso de monitoramento na tela
- ✅ Execução em segundo plano (system tray)

## Instalação

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Passos

1. Entre na pasta do agente:
```bash
cd desktop-agent
```

2. Instale as dependências:
```bash
npm install
```

3. Compile o TypeScript:
```bash
npm run build
```

4. Execute em modo desenvolvimento:
```bash
npm run dev
```

## Build para Produção

### Windows
```bash
npm run build:win
```

### macOS
```bash
npm run build:mac
```

### Linux
```bash
npm run build:linux
```

Os instaladores serão gerados na pasta `release/`.

## Configuração

Na primeira execução, o agente pedirá:

1. **Nome do Colaborador** - Identificação do usuário
2. **Nome do Dispositivo** - Identificação do computador
3. **Chave do Agente** - Token de autenticação (fornecido pelo admin)

## Arquitetura

```
desktop-agent/
├── src/
│   ├── main.ts          # Processo principal do Electron
│   ├── config.ts        # Configurações e tipos
│   └── services/
│       ├── api.ts       # Comunicação com o servidor
│       └── monitoring.ts # Lógica de monitoramento
├── views/
│   ├── config.html      # Tela de configuração
│   └── notice.html      # Aviso de monitoramento
└── assets/              # Ícones do app
```

## Fluxo de Dados

1. Agente coleta dados (teclas, screenshots, apps)
2. Dados são enfileirados localmente
3. API Service envia para o backend a cada 5 segundos
4. Backend (Edge Function) salva no Supabase
5. Dashboard web exibe os dados em tempo real

## Segurança

- Comunicação via HTTPS
- Autenticação por chave do agente
- Dados sensíveis não são logados
- Screenshots são temporários

## Troubleshooting

### O agente não inicia
- Verifique se há outra instância rodando
- Verifique os logs em: `%APPDATA%/securewatch-agent/logs/`

### Screenshots não funcionam
- No macOS, conceda permissão de gravação de tela nas Preferências do Sistema

### USB não é detectado
- No Linux, pode ser necessário executar como root ou configurar udev rules
