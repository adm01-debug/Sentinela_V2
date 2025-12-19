# 🛡️ Sentinela

<div align="center">

![Sentinela Logo](public/logo.svg)

**Sistema de Monitoramento de Funcionários com Gamificação**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](#licença)

[Demo](https://sentinela.app) · [Documentação](#documentação) · [Instalação](#instalação) · [API](#api)

</div>

---

## 📋 Índice

- [Sobre](#sobre)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [API](#api)
- [Contribuição](#contribuição)
- [Licença](#licença)

---

## 📖 Sobre

**Sentinela** é uma plataforma completa de monitoramento de produtividade empresarial que combina:

- 🖥️ **Monitoramento Desktop** - Captura de atividade, screenshots, aplicações
- 📱 **Monitoramento Mobile** - Localização GPS, geofencing, app usage
- 🎮 **Gamificação** - Sistema de pontos, badges, leaderboards
- 🚨 **Alertas Inteligentes** - Detecção de violações, notificações WhatsApp
- 📊 **Analytics Avançado** - Dashboards, relatórios, IA

### Por que Sentinela?

| Característica | Benefício |
|----------------|-----------|
| **Privacidade** | Dados criptografados, RLS no banco |
| **Gamificação** | Engajamento positivo vs. vigilância |
| **Real-time** | Updates via Supabase Realtime |
| **Escalável** | Edge Functions serverless |
| **PWA** | Funciona offline, instalável |

---

## ✨ Funcionalidades

### 🖥️ Monitoramento Desktop

```
├── Captura de tela (intervalos configuráveis)
├── Tracking de aplicações e janelas
├── Contagem de teclas e cliques
├── Detecção de tempo ocioso
├── OCR em screenshots (Tesseract)
└── Auto-update do agente
```

### 📱 Monitoramento Mobile

```
├── Rastreamento GPS em background
├── Geofencing (cercas virtuais)
├── Histórico de localização
├── Status de bateria
└── Conectividade (WiFi/4G)
```

### 🎮 Sistema de Gamificação

```
├── Pontos por produtividade
├── 25+ badges desbloqueáveis
├── Níveis e experiência (XP)
├── Streaks diários
├── Leaderboard semanal/mensal
└── Achievements especiais
```

### 🚨 Sistema de Alertas

```
├── Violações de segurança
├── Acesso a sites bloqueados
├── Palavras-chave sensíveis
├── Horários não autorizados
├── Notificações WhatsApp (WAHA)
└── Webhooks personalizados
```

### 📊 Relatórios e Analytics

```
├── Dashboard em tempo real
├── Relatórios agendados
├── Exportação CSV/PDF
├── Análise de produtividade
├── Comparativo entre equipes
└── Insights com IA
```

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      SENTINELA STACK                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Web App   │  │Desktop Agent│  │ Mobile App  │         │
│  │   (React)   │  │  (Electron) │  │(React Native)│        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         └────────────────┼────────────────┘                 │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  SUPABASE                            │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│  │  │   Auth  │ │Database │ │ Storage │ │Realtime │   │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │            Edge Functions (16)              │   │   │
│  │  │  • agent-collector    • send-whatsapp      │   │   │
│  │  │  • mobile-collector   • process-violation  │   │   │
│  │  │  • ocr-screenshot     • generate-report    │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Stack Tecnológico

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, shadcn/ui |
| **State** | TanStack Query, Zustand |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| **Edge** | Deno Edge Functions |
| **Desktop** | Electron, Node.js |
| **Mobile** | React Native, Expo |
| **Infra** | Vite, PWA, GitHub Actions |

---

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Supabase
- Git

### 1. Clone o repositório

```bash
git clone https://github.com/adm01-debug/sentinela.git
cd sentinela
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` com suas credenciais:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

### 4. Execute as migrations

```bash
npx supabase db push
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:8080](http://localhost:8080)

---

## ⚙️ Configuração

### Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima do Supabase | ✅ |
| `WAHA_API_URL` | URL da API WAHA (WhatsApp) | ❌ |
| `WAHA_API_KEY` | Chave da API WAHA | ❌ |
| `MAPBOX_TOKEN` | Token do Mapbox (mapas) | ❌ |

### Configuração do Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute as migrations em `supabase/migrations/`
3. Configure RLS policies
4. Habilite Realtime nas tabelas necessárias

### Configuração do Desktop Agent

Veja [desktop-agent/README.md](desktop-agent/README.md)

### Configuração do Mobile App

Veja [mobile-app/README.md](mobile-app/README.md)

---

## 📚 Uso

### Primeiro Acesso

1. Acesse a aplicação e crie uma conta
2. Verifique seu email
3. Complete o setup inicial da empresa
4. Adicione funcionários
5. Distribua os agentes de monitoramento

### Fluxo de Trabalho

```
1. Admin configura regras de monitoramento
2. Funcionários instalam o Desktop Agent
3. Dados são enviados em tempo real
4. Violações geram alertas automáticos
5. Gamificação engaja funcionários
6. Relatórios são gerados automaticamente
```

### Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor dev
npm run build        # Build de produção
npm run preview      # Preview do build

# Testes
npm run test         # Executa testes
npm run test:watch   # Testes em watch mode
npm run test:coverage # Cobertura de testes

# Linting
npm run lint         # Verifica código
npm run lint:fix     # Corrige automaticamente

# Supabase
npm run db:push      # Aplica migrations
npm run db:reset     # Reset do banco
npm run functions:serve # Edge Functions local
```

---

## 🔌 API

### Edge Functions

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/agent-collector` | POST | Recebe dados do Desktop Agent |
| `/mobile-collector` | POST | Recebe dados do Mobile App |
| `/send-whatsapp` | POST | Envia mensagem WhatsApp |
| `/process-violation-alert` | POST | Processa alerta de violação |
| `/generate-report` | POST | Gera relatório |
| `/ocr-screenshot` | POST | Extrai texto de imagem |

### Exemplo: Enviar dados do Agent

```bash
curl -X POST \
  https://seu-projeto.supabase.co/functions/v1/agent-collector \
  -H "Authorization: Bearer $AGENT_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "device-123",
    "data_type": "activity",
    "timestamp": "2024-01-15T10:30:00Z",
    "active_window": "Visual Studio Code",
    "active_application": "Code.exe"
  }'
```

### Webhooks

Configure webhooks para receber eventos:

```json
{
  "event": "violation_created",
  "payload": {
    "violation_id": "uuid",
    "employee_id": "uuid",
    "type": "blocked_website",
    "severity": "high"
  }
}
```

---

## 🤝 Contribuição

Veja [CONTRIBUTING.md](CONTRIBUTING.md) para guia completo.

### Quick Start

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Commit: `git commit -m 'feat: minha feature'`
4. Push: `git push origin feature/minha-feature`
5. Abra um Pull Request

### Padrões de Commit

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

---

## 📄 Licença

Este projeto é **proprietário** e de uso exclusivo.

© 2024 Promo Brindes. Todos os direitos reservados.

---

## 📞 Suporte

- 📧 Email: suporte@promobrindes.com.br
- 💬 WhatsApp: +55 62 99999-9999
- 📚 Docs: [docs.sentinela.app](https://docs.sentinela.app)

---

<div align="center">

**Feito com ❤️ por [Promo Brindes](https://promobrindes.com.br)**

</div>
