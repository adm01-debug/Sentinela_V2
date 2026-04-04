# 🚀 Guia de Onboarding — Sentinela

## Pré-requisitos

- Node.js 20+
- Git
- Conta no Lovable

## Setup (< 10 minutos)

```bash
git clone <repo-url>
cd sentinela
npm ci
npm run dev
```

## Estrutura do Projeto

```
src/
├── components/     # Componentes React reutilizáveis
│   ├── ui/         # shadcn/ui base components
│   └── auth/       # Componentes de autenticação
├── hooks/          # Custom hooks (lógica de negócio)
├── pages/          # Páginas/rotas da aplicação
├── stores/         # Zustand stores (state management)
├── lib/            # Utilitários (logger, queryClient, utils)
├── validators/     # Schemas Zod de validação
├── providers/      # Context providers (Theme, Analytics, etc.)
├── routes/         # Configuração de rotas
├── integrations/   # Supabase client + types (AUTO-GERADO)
└── assets/         # Imagens, ícones

supabase/
├── functions/      # Edge Functions (backend serverless)
├── migrations/     # SQL migrations (versionadas)
└── config.toml     # Configuração do projeto
```

## Arquitetura

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions + Storage)
- **State**: Zustand (stores/) + React Query (queryClient)
- **UI**: shadcn/ui + Radix UI + Design tokens HSL em `index.css`

## Padrões de Código

1. **Sem `any`** — usar tipos específicos ou `unknown`
2. **Sem `console.log`** — usar `import { logger } from '@/lib/logger'`
3. **Design tokens** — usar `text-foreground`, `bg-background`, nunca `text-white`
4. **Conventional commits** — `feat:`, `fix:`, `refactor:`, `docs:`
5. **RLS obrigatório** — toda tabela nova precisa de Row Level Security

## Fluxo de Trabalho

1. Criar branch: `feat/nome-da-feature` ou `fix/nome-do-bug`
2. Desenvolver com `npm run dev`
3. Rodar testes: `npm test`
4. Type check: `npx tsc --noEmit`
5. Abrir PR usando o template

## Referências

- [Runbook](./RUNBOOK.md) — operações e incidentes
- [Arquitetura](./ARCHITECTURE.md) — decisões técnicas
- [Autenticação](./AUTHENTICATION.md) — fluxos de auth
- [Código de Conduta](./CODE_REVIEW_GUIDELINES.md) — padrões de review
