# 📐 Architecture Decision Records (ADRs)

## ADR-001: React + TypeScript + Vite como stack frontend

**Data:** 2024-01  
**Status:** Aceito  
**Contexto:** Necessidade de framework moderno, tipado, com build rápido.  
**Decisão:** React 18 com TypeScript strict, Vite como bundler.  
**Consequência:** Ecossistema rico, boa DX, build < 10s.

## ADR-002: Supabase como backend (Lovable Cloud)

**Data:** 2024-01  
**Status:** Aceito  
**Contexto:** Necessidade de auth, DB, storage, functions sem infra própria.  
**Decisão:** Supabase via Lovable Cloud para todas as funcionalidades backend.  
**Consequência:** Zero DevOps para backend, RLS nativo, edge functions serverless.

## ADR-003: Zustand para state management

**Data:** 2024-02  
**Status:** Aceito  
**Contexto:** Redux era excessivo; Context API não escalava bem.  
**Decisão:** Zustand com stores granulares por domínio.  
**Consequência:** 34 stores leves, sem boilerplate, tipagem nativa.

## ADR-004: shadcn/ui + Radix como design system

**Data:** 2024-02  
**Status:** Aceito  
**Contexto:** Necessidade de componentes acessíveis, customizáveis, sem lock-in.  
**Decisão:** shadcn/ui (componentes copiados) + Radix primitives + tokens HSL.  
**Consequência:** Controle total sobre componentes, dark mode nativo, a11y built-in.

## ADR-005: Edge Functions para lógica de backend

**Data:** 2024-03  
**Status:** Aceito  
**Contexto:** Necessidade de lógica server-side (validação, integrações, AI).  
**Decisão:** Deno-based Edge Functions via Supabase.  
**Consequência:** 64 functions, deploy automático, sem servidor para gerenciar.

## ADR-006: Structured Logger sobre console.log

**Data:** 2024-06  
**Status:** Aceito  
**Contexto:** `console.log` em produção vazando dados, sem filtro por nível.  
**Decisão:** Logger centralizado (`src/lib/logger.ts`) com níveis e contexto.  
**Consequência:** Zero `console.log` em produção, logs filtráveis, PII-safe.

## ADR-007: RLS em 100% das tabelas

**Data:** 2024-03  
**Status:** Aceito  
**Contexto:** Multi-tenancy requer isolamento rígido de dados.  
**Decisão:** Row Level Security em todas as 99 tabelas, sem exceção.  
**Consequência:** Segurança por design, impossível acessar dados de outro tenant.

## ADR-008: Partitioning para tabelas de alto volume

**Data:** 2024-09  
**Status:** Aceito  
**Contexto:** keystroke_logs e click_logs crescendo > 10M rows/mês.  
**Decisão:** Range partitioning por mês com `create_monthly_partition()`.  
**Consequência:** Queries rápidas em dados recentes, cleanup automatizado.
