-- ============================================================
-- CRUD IMPROVEMENTS MIGRATION
-- Tabelas para Filtros Salvos e Versionamento de Entidades
-- ============================================================

-- ============================================================
-- 1. SAVED FILTERS - Filtros salvos por usuário
-- ============================================================

CREATE TABLE IF NOT EXISTS saved_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Garantir nome único por usuário e tipo de entidade
  CONSTRAINT unique_filter_name_per_user UNIQUE (user_id, entity_type, name)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_saved_filters_user ON saved_filters(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_filters_entity ON saved_filters(entity_type);
CREATE INDEX IF NOT EXISTS idx_saved_filters_default ON saved_filters(user_id, entity_type, is_default) WHERE is_default = true;

-- RLS - Row Level Security
ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;

-- Política: usuários só veem e gerenciam seus próprios filtros
CREATE POLICY "Users can manage own filters"
ON saved_filters FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_saved_filters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER saved_filters_updated_at
  BEFORE UPDATE ON saved_filters
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_filters_updated_at();

-- ============================================================
-- 2. ENTITY VERSIONS - Versionamento de entidades
-- ============================================================

CREATE TABLE IF NOT EXISTS entity_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  version_number INT NOT NULL,
  data JSONB NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  change_summary TEXT,
  
  -- Garantir versão única por entidade
  CONSTRAINT unique_version UNIQUE (entity_type, entity_id, version_number)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_versions_entity ON entity_versions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_versions_date ON entity_versions(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_versions_user ON entity_versions(changed_by);

-- RLS - Row Level Security
ALTER TABLE entity_versions ENABLE ROW LEVEL SECURITY;

-- Política: todos usuários autenticados podem ver versões
CREATE POLICY "Authenticated users can view versions"
ON entity_versions FOR SELECT
USING (auth.role() = 'authenticated');

-- Política: apenas criar versões para suas próprias alterações
CREATE POLICY "Users can create versions"
ON entity_versions FOR INSERT
WITH CHECK (auth.uid() = changed_by OR changed_by IS NULL);

-- ============================================================
-- 3. FUNÇÃO PARA CRIAR VERSÃO AUTOMATICAMENTE
-- ============================================================

CREATE OR REPLACE FUNCTION create_entity_version()
RETURNS TRIGGER AS $$
DECLARE
  next_version INT;
BEGIN
  -- Obter próximo número de versão
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
  FROM entity_versions
  WHERE entity_type = TG_TABLE_NAME AND entity_id = OLD.id;

  -- Inserir versão com dados antigos
  INSERT INTO entity_versions (
    entity_type,
    entity_id,
    version_number,
    data,
    changed_by,
    change_summary
  ) VALUES (
    TG_TABLE_NAME,
    OLD.id,
    next_version,
    row_to_json(OLD)::jsonb,
    auth.uid(),
    'Auto-versioned on update'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 4. APLICAR TRIGGERS EM TABELAS CRÍTICAS (exemplo)
-- ============================================================

-- Descomentar e adaptar para suas tabelas críticas:
-- 
-- CREATE TRIGGER version_employees
--   BEFORE UPDATE ON employees
--   FOR EACH ROW
--   EXECUTE FUNCTION create_entity_version();
--
-- CREATE TRIGGER version_alerts
--   BEFORE UPDATE ON alerts
--   FOR EACH ROW
--   EXECUTE FUNCTION create_entity_version();

-- ============================================================
-- 5. VIEWS ÚTEIS
-- ============================================================

-- View para filtros padrão por entidade
CREATE OR REPLACE VIEW default_filters AS
SELECT DISTINCT ON (user_id, entity_type)
  id,
  user_id,
  entity_type,
  name,
  filters
FROM saved_filters
WHERE is_default = true
ORDER BY user_id, entity_type, created_at DESC;

-- View para última versão de cada entidade
CREATE OR REPLACE VIEW latest_versions AS
SELECT DISTINCT ON (entity_type, entity_id)
  id,
  entity_type,
  entity_id,
  version_number,
  data,
  changed_by,
  changed_at,
  change_summary
FROM entity_versions
ORDER BY entity_type, entity_id, version_number DESC;

-- ============================================================
-- 6. GRANTS (permissões)
-- ============================================================

-- Conceder permissões para role autenticado
GRANT SELECT, INSERT, UPDATE, DELETE ON saved_filters TO authenticated;
GRANT SELECT, INSERT ON entity_versions TO authenticated;
GRANT SELECT ON default_filters TO authenticated;
GRANT SELECT ON latest_versions TO authenticated;

-- ============================================================
-- COMENTÁRIOS
-- ============================================================

COMMENT ON TABLE saved_filters IS 'Armazena filtros de busca salvos por usuário para cada tipo de entidade';
COMMENT ON TABLE entity_versions IS 'Armazena versões históricas de entidades para auditoria e rollback';
COMMENT ON FUNCTION create_entity_version() IS 'Trigger function que cria automaticamente uma versão antes de updates';
