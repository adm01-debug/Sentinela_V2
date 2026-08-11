# PROMPT PARA CLAUDE WEB — ANÁLISE DE MIGRAÇÃO SENTINELA V2

## Contexto

Migramos o projeto Sentinela V2 do Lovable para nosso Supabase próprio. Já configuramos:
- SUPABASE_URL: https://jgnmwvzephsozsqmcpzb.supabase.co
- MCP disponível para executar queries

## Objetivo

Analisar o banco de dados atual via MCP, identificar gaps de migração e gerar os SQLs completos para corrigir tudo.

---

## PASSO 1 — Verificações Iniciais

Execute via MCP as seguintes queries:

### 1.1 — Tabelas Faltantes
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' 
AND table_name IN ('geofence_states', 'geofence_events', 'activities');
```
**Esperado:** `geofence_states` e `geofence_events` devem existir (estão sendo usadas pelas edge functions)

### 1.2 — Policies de audit_logs
```sql
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'audit_logs';
```
**Problema reportado:** Tem RLS habilitado mas zero policies → acesso completamente bloqueado

### 1.3 — Policies de click_logs_partitioned_2026_12
```sql
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'click_logs_partitioned_2026_12';
```
**Problema reportado:** Partição de dez/2026 sem policy

### 1.4 — Storage Buckets
```sql
SELECT id, name, public FROM storage.buckets;
```
**Esperado:** Deve existir bucket `violation-screenshots` (usado pelo agent-collector)

### 1.5 — INSERT Policies Faltantes
```sql
-- file_transfers
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'file_transfers' AND cmd = 'INSERT';

-- dlp_redaction_log
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'dlp_redaction_log' AND cmd = 'INSERT';

-- siem_delivery_log
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'siem_delivery_log' AND cmd = 'INSERT';

-- siem_event_outbox
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'siem_event_outbox' AND cmd = 'INSERT';
```

### 1.6 — Tabela activity_logs
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activity_logs';
```
**Nota:** A edge function `generate-insights` usa `activities` mas deveria usar `activity_logs`

---

## PASSO 2 — Gerar SQLs de Correção

Com base nos resultados acima, gere um ÚNICO arquivo SQL de migration com:

### 2.1 — Criar geofence_states (se não existir)
```sql
-- Tabela para tracking contínuo de posição do employee em cada geofence
CREATE TABLE IF NOT EXISTS public.geofence_states (
  employee_id UUID NOT NULL,
  device_id TEXT NOT NULL,
  geofence_id UUID NOT NULL,
  is_inside BOOLEAN NOT NULL DEFAULT false,
  last_checked TIMESTAMPTZ,
  PRIMARY KEY (employee_id, device_id, geofence_id)
);
ALTER TABLE public.geofence_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on geofence_states" ON public.geofence_states FOR ALL TO service_role USING (true);
CREATE POLICY "Edge functions access geofence_states" ON public.geofence_states FOR ALL TO authenticated USING (true);
```

### 2.2 — Criar geofence_events (se não existir)
```sql
-- Tabela para logs de transição (enter/exit/stay)
CREATE TABLE IF NOT EXISTS public.geofence_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  device_id TEXT NOT NULL,
  geofence_id UUID NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('enter', 'exit', 'stay')),
  location JSONB,
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.geofence_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on geofence_events" ON public.geofence_events FOR ALL TO service_role USING (true);
CREATE POLICY "Edge functions insert geofence_events" ON public.geofence_events FOR INSERT TO authenticated WITH CHECK (true);
```

### 2.3 — Policies de audit_logs
```sql
-- Verificar se já existe antes de criar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'System can insert audit logs'
  ) THEN
    CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Admins can view audit logs'
  ) THEN
    CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated
      USING (EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin')
      ));
  END IF;
END $$;
```

### 2.4 — Policies de click_logs_partitioned_2026_12
```sql
-- Para cada partição existente
DO $$
DECLARE
  partition_name TEXT;
BEGIN
  FOR partition_name IN 
    SELECT tablename FROM pg_tables WHERE tablename LIKE 'click_logs_partitioned%'
  LOOP
    EXECUTE format(
      'CREATE POLICY IF NOT EXISTS "Service role access on %I" ON public.%I FOR ALL TO service_role USING (true)',
      partition_name, partition_name
    );
    EXECUTE format(
      'CREATE POLICY IF NOT EXISTS "Edge functions insert on %I" ON public.%I FOR INSERT TO authenticated WITH CHECK (true)',
      partition_name, partition_name
    );
  END LOOP;
END $$;
```

### 2.5 — INSERT Policies Faltantes
```sql
-- file_transfers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'file_transfers' AND cmd = 'INSERT') THEN
    CREATE POLICY "Edge functions can insert file_transfers" ON public.file_transfers 
      FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END $$;

-- dlp_redaction_log
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dlp_redaction_log' AND cmd = 'INSERT') THEN
    CREATE POLICY "Edge functions can insert dlp_redaction_log" ON public.dlp_redaction_log 
      FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END $$;

-- siem_delivery_log
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'siem_delivery_log' AND cmd = 'INSERT') THEN
    CREATE POLICY "Service role can insert siem_delivery_log" ON public.siem_delivery_log 
      FOR INSERT TO service_role WITH CHECK (true);
  END IF;
END $$;

-- siem_event_outbox
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'siem_event_outbox' AND cmd = 'INSERT') THEN
    CREATE POLICY "Service role can insert siem_event_outbox" ON public.siem_event_outbox 
      FOR INSERT TO service_role WITH CHECK (true);
  END IF;
END $$;
```

### 2.6 — Storage Bucket violation-screenshots
```sql
-- Criar bucket se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'violation-screenshots') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'violation-screenshots', 
      'violation-screenshots', 
      false, 
      10485760, 
      ARRAY['image/jpeg', 'image/png']
    );
  END IF;
END $$;

-- Policies de storage
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Service role upload violation-screenshots') THEN
    CREATE POLICY "Service role upload violation-screenshots" ON storage.objects 
      FOR INSERT TO service_role 
      WITH CHECK (bucket_id = 'violation-screenshots');
    
    CREATE POLICY "Service role read violation-screenshots" ON storage.objects 
      FOR SELECT TO service_role 
      USING (bucket_id = 'violation-screenshots');
    
    CREATE POLICY "Service role delete violation-screenshots" ON storage.objects 
      FOR DELETE TO service_role 
      USING (bucket_id = 'violation-screenshots');
  END IF;
END $$;
```

---

## PASSO 3 — Verificar Edge Functions

Liste as edge functions deployadas:
```sql
SELECT function_name, created_at FROM pg_functions WHERE function_name IN (
  'agent-collector', 'validate-agent-key', 'check-geofence', 
  'analyze-activity', 'generate-insights'
);
```

**Status esperado:** As 5 functions devem estar deployadas e retornar 200.

---

## PASSO 4 — Gerar Relatório Final

Após executar tudo, gere:
1. ✅ Sumário do que foi criado/corrigido
2. ❌ Problemas que não puderam ser resolvidos
3. ⚠️ Warnings de segurança (migrate-helper com verify_jwt=false)
4. 📋 Próximos passos manuais (deploy de functions via CLI, etc)

---

## SQL FINAL — Para Executar de Uma Vez

Gere um único arquivo SQL combinando todos os itens acima, com IF NOT EXISTS para ser idempotente.
