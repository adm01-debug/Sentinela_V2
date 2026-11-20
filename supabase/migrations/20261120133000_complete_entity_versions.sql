
-- ============================================================
-- COMPLETA entity_versions (finaliza o trabalho parcial)
-- A migration 20260102000001_crud_improvements.sql declarou a
-- feature mas ela nunca foi aplicada ao banco de producao
-- (schema_migrations inexistente; drift §5.3 ESTADO_ATUAL.md).
-- Esta migration e idempotente: cria o que nao existe e corrige
-- a function trigger (search_path fixo + SECURITY DEFINER com
-- definicao de changed_by explicito para nao depender de RLS no
-- INSERT do proprio trigger).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.entity_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  version_number INT NOT NULL,
  data JSONB NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  change_summary TEXT,
  CONSTRAINT unique_version UNIQUE (entity_type, entity_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_versions_entity ON public.entity_versions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_versions_date ON public.entity_versions(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_versions_user ON public.entity_versions(changed_by);

ALTER TABLE public.entity_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view versions" ON public.entity_versions;
CREATE POLICY "Authenticated users can view versions"
  ON public.entity_versions FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can create versions" ON public.entity_versions;
CREATE POLICY "Users can create versions"
  ON public.entity_versions FOR INSERT
  WITH CHECK (auth.uid() = changed_by OR changed_by IS NULL);

-- ============================================================
-- FUNCTION TRIGGER CORRIGIDA
-- Antes: SECURITY DEFINER sem search_path, e dependia de RLS do
-- proprio INSERT (chamava auth.uid() no insert e podia quebrar).
-- Agora: busca o max(version) via SECURITY DEFINER (nao sofre
-- RLS da tabela) e registra changed_by = auth.uid() explicito.
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_entity_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  next_version INT;
BEGIN
  SELECT COALESCE(MAX(v.version_number), 0) + 1
    INTO next_version
  FROM public.entity_versions v
  WHERE v.entity_type = TG_TABLE_NAME
    AND v.entity_id = OLD.id;

  INSERT INTO public.entity_versions (
    entity_type, entity_id, version_number, data, changed_by, change_summary
  ) VALUES (
    TG_TABLE_NAME,
    OLD.id,
    next_version,
    to_jsonb(OLD),
    auth.uid(),
    'Auto-versioned on update'
  );

  RETURN NEW;
END;
$$;

-- ============================================================
-- TRIGGERS EM TABELAS CRITICAS
-- employees: PK id UUID (compatível). Trigger BEFORE UPDATE
-- (evita duplicata do trigger de updated_at).
-- ============================================================
DROP TRIGGER IF EXISTS version_employees ON public.employees;
CREATE TRIGGER version_employees
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION public.create_entity_version();

-- ============================================================
-- VIEW E GRANTS
-- ============================================================
CREATE OR REPLACE VIEW public.latest_versions AS
SELECT DISTINCT ON (entity_type, entity_id)
  id, entity_type, entity_id, version_number, data, changed_by, changed_at, change_summary
FROM public.entity_versions
ORDER BY entity_type, entity_id, version_number DESC;

GRANT SELECT, INSERT ON public.entity_versions TO authenticated;
GRANT SELECT ON public.latest_versions TO authenticated;

