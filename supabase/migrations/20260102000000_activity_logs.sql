-- ============================================================
-- ACTIVITY LOGS MIGRATION
-- Tabela para auditoria e histórico de atividades
-- ============================================================

-- ============================================================
-- 1. ACTIVITY LOGS - Histórico de atividades
-- ============================================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  activity_type TEXT NOT NULL CHECK (
    activity_type IN (
      'create', 'update', 'delete', 'restore', 'archive',
      'view', 'export', 'import', 'share', 'comment',
      'assign', 'status_change', 'custom'
    )
  ),
  description TEXT NOT NULL,
  changes JSONB,
  metadata JSONB,
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_activity_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_date ON activity_logs(created_at DESC);

-- Índice composto para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_activity_entity_date 
ON activity_logs(entity_type, entity_id, created_at DESC);

-- RLS - Row Level Security
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Política: todos usuários autenticados podem ver logs
CREATE POLICY "Authenticated users can view activity logs"
ON activity_logs FOR SELECT
USING (auth.role() = 'authenticated');

-- Política: apenas inserir logs do próprio usuário
CREATE POLICY "Users can create activity logs"
ON activity_logs FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ============================================================
-- 2. FUNÇÃO PARA REGISTRAR ATIVIDADE
-- ============================================================

CREATE OR REPLACE FUNCTION log_activity(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_activity_type TEXT,
  p_description TEXT,
  p_changes JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO activity_logs (
    entity_type,
    entity_id,
    activity_type,
    description,
    changes,
    metadata,
    user_id
  ) VALUES (
    p_entity_type,
    p_entity_id,
    p_activity_type,
    p_description,
    p_changes,
    p_metadata,
    auth.uid()
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 3. TRIGGER PARA LOG AUTOMÁTICO
-- ============================================================

CREATE OR REPLACE FUNCTION auto_log_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_activity(
      TG_TABLE_NAME,
      NEW.id,
      'create',
      'Registro criado',
      NULL,
      jsonb_build_object('trigger', true)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Verificar se houve mudanças reais
    IF NEW IS DISTINCT FROM OLD THEN
      PERFORM log_activity(
        TG_TABLE_NAME,
        NEW.id,
        'update',
        'Registro atualizado',
        jsonb_build_object(
          'before', row_to_json(OLD)::jsonb,
          'after', row_to_json(NEW)::jsonb
        ),
        jsonb_build_object('trigger', true)
      );
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_activity(
      TG_TABLE_NAME,
      OLD.id,
      'delete',
      'Registro excluído',
      row_to_json(OLD)::jsonb,
      jsonb_build_object('trigger', true)
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 4. VIEW PARA ATIVIDADES RECENTES
-- ============================================================

CREATE OR REPLACE VIEW recent_activities AS
SELECT 
  al.*,
  u.email as user_email,
  u.raw_user_meta_data->>'full_name' as user_name
FROM activity_logs al
LEFT JOIN auth.users u ON al.user_id = u.id
ORDER BY al.created_at DESC
LIMIT 100;

-- ============================================================
-- 5. FUNÇÃO PARA LIMPAR LOGS ANTIGOS
-- ============================================================

CREATE OR REPLACE FUNCTION cleanup_old_activity_logs(
  p_days_to_keep INT DEFAULT 90
)
RETURNS INT AS $$
DECLARE
  v_deleted_count INT;
BEGIN
  DELETE FROM activity_logs
  WHERE created_at < NOW() - (p_days_to_keep || ' days')::INTERVAL;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 6. GRANTS
-- ============================================================

GRANT SELECT, INSERT ON activity_logs TO authenticated;
GRANT SELECT ON recent_activities TO authenticated;
GRANT EXECUTE ON FUNCTION log_activity TO authenticated;

-- ============================================================
-- COMENTÁRIOS
-- ============================================================

COMMENT ON TABLE activity_logs IS 'Armazena histórico de atividades para auditoria';
COMMENT ON FUNCTION log_activity IS 'Registra uma atividade manualmente';
COMMENT ON FUNCTION auto_log_activity IS 'Trigger function para log automático de operações CRUD';
COMMENT ON FUNCTION cleanup_old_activity_logs IS 'Remove logs mais antigos que X dias';
