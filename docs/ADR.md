# Architecture Decision Records (ADRs)

## Purpose
This document contains architecture decisions for the Sentinela project.

## ADR-001: Use React Query for Server State
- **Status**: Accepted
- **Context**: Need efficient server state management
- **Decision**: Use TanStack Query (React Query)
- **Consequences**: Automatic caching, background refetching

## ADR-002: Use Supabase for Backend
- **Status**: Accepted
- **Context**: Need scalable backend with auth
- **Decision**: Supabase with Edge Functions
- **Consequences**: Real-time capabilities, PostgreSQL