# Data Flow Architecture

## Overview

This document describes how data flows through Sentinela.

## Data Sources

### Desktop Agent
```
Agent → Supabase Edge Functions → Database
     ↓
Activity data, screenshots, keystrokes
```

### Mobile App
```
App → Supabase Edge Functions → Database
   ↓
Location, device info, status
```

### Web Dashboard
```
Dashboard ↔ Supabase Realtime → Database
         ↓
User interactions, configurations
```

## Data Pipeline

### 1. Collection
- Agents collect activity data
- Data is batched (every 30 seconds)
- Encrypted before transmission

### 2. Processing
- Edge functions validate data
- Apply business rules
- Generate violations if needed

### 3. Storage
- PostgreSQL for structured data
- Supabase Storage for files
- Partitioned tables for performance

### 4. Analysis
- Real-time dashboards
- Scheduled reports
- AI-powered insights

## State Management

### Client State
- React Query for server state
- Zustand for UI state
- LocalStorage for persistence

### Server State
- Supabase Realtime subscriptions
- Optimistic updates
- Background sync

## Data Security

- TLS 1.3 in transit
- AES-256 at rest
- Row-level security (RLS)
- Data masking for sensitive fields
