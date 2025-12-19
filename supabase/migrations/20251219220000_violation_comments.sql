-- =============================================
-- SISTEMA DE COMENTÁRIOS EM VIOLAÇÕES
-- =============================================

CREATE TABLE IF NOT EXISTS public.violation_comments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    violation_id UUID NOT NULL REFERENCES public.security_violations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Conteúdo
    content TEXT NOT NULL,
    
    -- Tipo de comentário
    comment_type TEXT NOT NULL DEFAULT 'note', -- 'note', 'action', 'resolution', 'escalation'
    
    -- Metadados
    is_internal BOOLEAN NOT NULL DEFAULT false, -- Comentários internos não visíveis para o funcionário
    is_edited BOOLEAN NOT NULL DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    
    -- Menções
    mentions UUID[], -- IDs de usuários mencionados
    
    -- Anexos (referências a arquivos)
    attachments JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para ações tomadas nas violações
CREATE TABLE IF NOT EXISTS public.violation_actions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    violation_id UUID NOT NULL REFERENCES public.security_violations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Tipo de ação
    action_type TEXT NOT NULL, -- 'acknowledge', 'investigate', 'warn', 'escalate', 'resolve', 'dismiss', 'reopen'
    
    -- Detalhes
    notes TEXT,
    
    -- Status anterior e novo
    previous_status TEXT,
    new_status TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_violation_comments_violation ON public.violation_comments(violation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_violation_comments_user ON public.violation_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_violation_actions_violation ON public.violation_actions(violation_id, created_at);

-- RLS
ALTER TABLE public.violation_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.violation_actions ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can view violation comments" 
ON public.violation_comments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create comments" 
ON public.violation_comments FOR INSERT TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can edit own comments" 
ON public.violation_comments FOR UPDATE TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments" 
ON public.violation_comments FOR DELETE TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can view violation actions" 
ON public.violation_actions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create actions" 
ON public.violation_actions FOR INSERT TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Adicionar campo de status na tabela de violações (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'security_violations' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.security_violations 
        ADD COLUMN status TEXT NOT NULL DEFAULT 'open';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'security_violations' AND column_name = 'assigned_to'
    ) THEN
        ALTER TABLE public.security_violations 
        ADD COLUMN assigned_to UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'security_violations' AND column_name = 'resolved_at'
    ) THEN
        ALTER TABLE public.security_violations 
        ADD COLUMN resolved_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'security_violations' AND column_name = 'resolved_by'
    ) THEN
        ALTER TABLE public.security_violations 
        ADD COLUMN resolved_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Índice para status
CREATE INDEX IF NOT EXISTS idx_violations_status ON public.security_violations(status);

-- Trigger para atualizar updated_at em comentários
CREATE OR REPLACE FUNCTION update_violation_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    NEW.is_edited = true;
    NEW.edited_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_violation_comment_updated ON public.violation_comments;
CREATE TRIGGER trigger_violation_comment_updated
    BEFORE UPDATE ON public.violation_comments
    FOR EACH ROW EXECUTE FUNCTION update_violation_comment_updated_at();

-- Função para registrar ação e atualizar status
CREATE OR REPLACE FUNCTION public.record_violation_action(
    p_violation_id UUID,
    p_action_type TEXT,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_current_status TEXT;
    v_new_status TEXT;
    v_action_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    -- Buscar status atual
    SELECT status INTO v_current_status
    FROM public.security_violations
    WHERE id = p_violation_id;
    
    -- Determinar novo status baseado na ação
    v_new_status := CASE p_action_type
        WHEN 'acknowledge' THEN 'acknowledged'
        WHEN 'investigate' THEN 'investigating'
        WHEN 'resolve' THEN 'resolved'
        WHEN 'dismiss' THEN 'dismissed'
        WHEN 'reopen' THEN 'open'
        WHEN 'escalate' THEN 'escalated'
        ELSE v_current_status
    END;
    
    -- Registrar ação
    INSERT INTO public.violation_actions (violation_id, user_id, action_type, notes, previous_status, new_status)
    VALUES (p_violation_id, v_user_id, p_action_type, p_notes, v_current_status, v_new_status)
    RETURNING id INTO v_action_id;
    
    -- Atualizar violação
    UPDATE public.security_violations
    SET 
        status = v_new_status,
        is_read = true,
        resolved_at = CASE WHEN p_action_type IN ('resolve', 'dismiss') THEN now() ELSE resolved_at END,
        resolved_by = CASE WHEN p_action_type IN ('resolve', 'dismiss') THEN v_user_id ELSE resolved_by END
    WHERE id = p_violation_id;
    
    RETURN v_action_id;
END;
$$;
