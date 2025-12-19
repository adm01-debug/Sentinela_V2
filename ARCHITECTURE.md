# 🏗️ Arquitetura do Sentinela

Este documento descreve a arquitetura técnica do sistema Sentinela.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Componentes](#componentes)
- [Fluxo de Dados](#fluxo-de-dados)
- [Banco de Dados](#banco-de-dados)
- [Segurança](#segurança)
- [Performance](#performance)
- [Decisões de Design](#decisões-de-design)

---

## 🎯 Visão Geral

O Sentinela é uma aplicação distribuída composta por:

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐          │
│   │   Web App   │   │Desktop Agent│   │ Mobile App  │          │
│   │   (React)   │   │  (Electron) │   │(React Native)│         │
│   │   SPA/PWA   │   │   Windows   │   │  iOS/Android │         │
│   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘          │
│          │                 │                 │                  │
└──────────┼─────────────────┼─────────────────┼──────────────────┘
           │                 │                 │
           ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE CLOUD                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                    Edge Functions                        │  │
│   │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐  │  │
│   │  │agent-collector│ │mobile-collector│ │ send-whatsapp │  │  │
│   │  └───────────────┘ └───────────────┘ └───────────────┘  │  │
│   │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐  │  │
│   │  │ocr-screenshot │ │process-alert  │ │generate-report│  │  │
│   │  └───────────────┘ └───────────────┘ └───────────────┘  │  │
│   └─────────────────────────────────────────────────────────┘  │
│                              │                                  │
│   ┌──────────┐  ┌──────────┐ │ ┌──────────┐  ┌──────────┐      │
│   │   Auth   │  │ Realtime │ │ │ Storage  │  │   RPC    │      │
│   │  (JWT)   │  │(WebSocket)│ │ │ (S3-like)│  │(Functions)│     │
│   └──────────┘  └──────────┘ │ └──────────┘  └──────────┘      │
│                              │                                  │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                    PostgreSQL                            │  │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │  │
│   │  │employees│ │violations│ │ devices │ │ activity│        │  │
│   │  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │  │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │  │
│   │  │ badges  │ │ points  │ │  teams  │ │ settings│        │  │
│   │  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │  │
│   │                  + RLS Policies                          │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Componentes

### 1. Web Application (Frontend)

**Tecnologias:** React 18, TypeScript, Vite, TailwindCSS

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # shadcn/ui components
│   └── ...             # Componentes de negócio
├── hooks/              # Custom hooks
│   ├── useAuth.tsx     # Autenticação
│   ├── useEmployees.ts # CRUD funcionários
│   └── ...
├── pages/              # Páginas/rotas
├── lib/                # Utilitários
│   ├── queryClient.ts  # React Query config
│   └── utils.ts        # Funções helper
└── integrations/       # Integrações externas
    └── supabase/       # Cliente Supabase
```

**Patterns utilizados:**
- **Lazy Loading:** Todas as 32 páginas carregam sob demanda
- **Code Splitting:** Chunks separados para vendors
- **Memoization:** React.memo, useMemo, useCallback
- **Centralized State:** React Query + queryKeys

### 2. Desktop Agent (Electron)

**Tecnologias:** Electron, TypeScript, Node.js

```
desktop-agent/
├── src/
│   ├── main.ts          # Main process
│   ├── monitoring.ts    # Captura de dados
│   ├── api.ts           # Envio para backend
│   └── services/
│       ├── crypto.ts    # Criptografia AES-256
│       └── secureStorage.ts
└── ...
```

**Funcionalidades:**
- Captura de screenshots (intervalo configurável)
- Tracking de janelas/aplicações ativas
- Contagem de keystrokes/clicks
- Detecção de idle time
- Auto-update via Electron updater
- **Criptografia AES-256-GCM** para dados sensíveis

### 3. Mobile App (React Native)

**Tecnologias:** React Native, Expo, TypeScript

```
mobile-app/
├── App.tsx              # Entry point
├── src/
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── LocationContext.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   └── LoginScreen.tsx
│   └── lib/
│       └── supabase.ts
└── ...
```

**Funcionalidades:**
- Background location tracking
- Geofencing
- Push notifications
- Secure storage para credenciais

### 4. Edge Functions (Backend)

**Tecnologias:** Deno, TypeScript

```
supabase/functions/
├── agent-collector/     # Recebe dados do Desktop
├── mobile-collector/    # Recebe dados do Mobile
├── send-whatsapp/       # Integração WAHA
├── process-violation-alert/  # Processa alertas
├── ocr-screenshot/      # OCR com Tesseract
├── generate-report/     # Gera relatórios
└── _shared/
    └── validation.ts    # Schemas de validação
```

---

## 🔄 Fluxo de Dados

### 1. Coleta de Dados (Desktop)

```
┌────────────┐      ┌────────────┐      ┌────────────┐
│  Desktop   │      │   Edge     │      │  Database  │
│   Agent    │─────▶│  Function  │─────▶│ PostgreSQL │
└────────────┘      └────────────┘      └────────────┘
     │                    │                    │
     │ 1. Captura         │ 2. Valida          │ 3. Salva
     │    screenshot      │    agent_key       │    com RLS
     │    + metadata      │    + rate limit    │
     │                    │                    │
     ▼                    ▼                    ▼
  Criptografa         Processa            Realtime
  localmente          violações           broadcast
```

### 2. Fluxo de Violação

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Violation  │     │   Process   │     │   Notify    │
│  Detected   │────▶│   Alert     │────▶│  Channels   │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          ├── WhatsApp (WAHA)
                          ├── Email (SMTP)
                          ├── Webhook
                          └── Push Notification
```

### 3. Autenticação

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │     │  Supabase   │     │   Session   │
│   (Login)   │────▶│    Auth     │────▶│   + JWT     │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          │ Auto-refresh
                          │ 5 min antes de expirar
                          ▼
                    ┌─────────────┐
                    │  RLS Check  │
                    │  por tenant │
                    └─────────────┘
```

---

## 🗄️ Banco de Dados

### Schema Principal

```sql
-- Funcionários
employees (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies,
  name TEXT,
  email TEXT UNIQUE,
  status employee_status,
  team_id UUID REFERENCES teams
)

-- Violações de Segurança
security_violations (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employees,
  violation_type TEXT,
  severity violation_severity,
  is_read BOOLEAN DEFAULT false,
  status violation_status
)

-- Gamificação
employee_points (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employees,
  total_points INTEGER,
  level INTEGER,
  experience INTEGER,
  current_streak INTEGER
)

employee_badges (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employees,
  badge_id UUID REFERENCES badges,
  earned_at TIMESTAMPTZ
)
```

### Row Level Security (RLS)

```sql
-- Funcionários só veem dados da sua empresa
CREATE POLICY "employees_company_isolation" ON employees
  USING (company_id = auth.jwt() ->> 'company_id');

-- Violações visíveis por role
CREATE POLICY "violations_by_role" ON security_violations
  USING (
    CASE auth.jwt() ->> 'role'
      WHEN 'admin' THEN true
      WHEN 'manager' THEN employee_id IN (
        SELECT id FROM employees 
        WHERE team_id IN (
          SELECT team_id FROM user_teams 
          WHERE user_id = auth.uid()
        )
      )
      ELSE employee_id = auth.uid()
    END
  );
```

### Índices

```sql
-- Performance crítica
CREATE INDEX idx_violations_employee ON security_violations(employee_id);
CREATE INDEX idx_violations_created ON security_violations(created_at DESC);
CREATE INDEX idx_activity_employee_date ON employee_activity(employee_id, date);
CREATE INDEX idx_devices_status ON devices(status) WHERE status = 'online';
```

---

## 🔒 Segurança

### Camadas de Proteção

| Camada | Mecanismo |
|--------|-----------|
| **Transporte** | HTTPS/TLS 1.3 |
| **Autenticação** | JWT + Refresh Token |
| **Autorização** | RLS + Role-based |
| **Dados** | AES-256-GCM (Desktop Agent) |
| **API** | Rate Limiting + Validation |
| **Storage** | Encryption at rest |

### Validação de Input

```typescript
// Todas as Edge Functions validam input
function validateRequest(data: unknown): ValidatedData {
  const obj = data as Record<string, unknown>;
  
  return {
    device_id: validateString(obj.device_id, 'device_id'),
    agent_key: validateString(obj.agent_key, 'agent_key'),
    data_type: validateEnum(obj.data_type, ALLOWED_TYPES),
    timestamp: validateISO8601(obj.timestamp),
  };
}
```

### Rate Limiting

```typescript
// Por device/IP
const RATE_LIMITS = {
  agent_collector: { requests: 60, window: '1m' },
  send_whatsapp: { requests: 10, window: '1m' },
  generate_report: { requests: 5, window: '1h' },
};
```

---

## ⚡ Performance

### Frontend Optimizations

| Técnica | Impacto |
|---------|---------|
| Lazy Loading | -70% bundle inicial |
| Code Splitting | 7 chunks otimizados |
| Memoization | -80% re-renders |
| Skeleton Loading | UX melhorada |
| gzip + brotli | -60% transfer size |

### Query Optimization

```typescript
// Presets de cache por tipo de dado
const CACHE_TIMES = {
  REALTIME: 10 * 1000,    // 10s - dados live
  FREQUENT: 60 * 1000,    // 1m - listas
  STABLE: 5 * 60 * 1000,  // 5m - configs
  STATIC: 60 * 60 * 1000, // 1h - badges
};
```

### Database

- **Connection Pooling:** PgBouncer
- **Índices:** Em todas as FKs e queries frequentes
- **Partitioning:** Tabela de activity por mês
- **Realtime:** Apenas tabelas necessárias

---

## 🎯 Decisões de Design

### 1. Por que Supabase?

| Alternativa | Desvantagem |
|-------------|-------------|
| Firebase | Lock-in, NoSQL menos flexível |
| AWS | Complexidade, custo |
| Self-hosted | Manutenção, DevOps |

**Supabase oferece:** PostgreSQL, Auth, Storage, Realtime, Edge Functions em um só lugar.

### 2. Por que React Query vs Redux?

- **Cache automático** de queries
- **Sync server state** nativamente
- **Menos boilerplate** que Redux
- **DevTools** excelentes
- **Mutations** com invalidação automática

### 3. Por que Electron para Desktop?

- **Cross-platform** (Windows, Mac, Linux)
- **Web technologies** (TypeScript, Node.js)
- **Auto-update** nativo
- **System tray** support
- **Native APIs** quando necessário

### 4. Por que Gamificação?

Engajamento positivo vs. vigilância:
- Funcionários se sentem **recompensados**, não vigiados
- **Competição saudável** entre equipes
- **Redução de resistência** ao monitoramento

---

## 📚 Referências

- [Supabase Docs](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Electron Docs](https://www.electronjs.org/docs)
- [Expo Docs](https://docs.expo.dev/)

---

*Última atualização: Dezembro 2024*
