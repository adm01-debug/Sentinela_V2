-- =============================================
-- SISTEMA DE FILTROS SALVOS
-- =============================================

CREATE TABLE IF NOT EXISTS public.saved_filters (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Identificação
    name TEXT NOT NULL,
    description TEXT,
    
    -- Contexto
    module TEXT NOT NULL, -- 'employees', 'violations', 'reports', etc.
    
    -- Filtros salvos (JSON com os valores dos filtros)
    filters JSONB NOT NULL DEFAULT '{}',
    
    -- Ordenação salva
    sort_field TEXT,
    sort_direction TEXT DEFAULT 'asc',
    
    -- Colunas visíveis (para customização de tabelas)
    visible_columns TEXT[],
    
    -- Metadados
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_shared BOOLEAN NOT NULL DEFAULT false, -- Se outros usuários podem ver
    color TEXT, -- Cor do badge do filtro
    icon TEXT, -- Ícone (lucide icon name)
    
    usage_count INTEGER NOT NULL DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_saved_filters_user ON public.saved_filters(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_filters_module ON public.saved_filters(module);
CREATE INDEX IF NOT EXISTS idx_saved_filters_default ON public.saved_filters(user_id, module, is_default) WHERE is_default = true;

-- RLS
ALTER TABLE public.saved_filters ENABLE ROW LEVEL SECURITY;

-- Usuário pode ver seus próprios filtros e filtros compartilhados
CREATE POLICY "Users can view own and shared filters" 
ON public.saved_filters 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid() OR is_shared = true);

-- Usuário pode criar seus próprios filtros
CREATE POLICY "Users can create own filters" 
ON public.saved_filters 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Usuário pode atualizar seus próprios filtros
CREATE POLICY "Users can update own filters" 
ON public.saved_filters 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid());

-- Usuário pode deletar seus próprios filtros
CREATE POLICY "Users can delete own filters" 
ON public.saved_filters 
FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_saved_filters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_saved_filters_updated_at ON public.saved_filters;
CREATE TRIGGER trigger_saved_filters_updated_at
    BEFORE UPDATE ON public.saved_filters
    FOR EACH ROW EXECUTE FUNCTION update_saved_filters_updated_at();

-- Função para garantir apenas um filtro default por módulo
CREATE OR REPLACE FUNCTION ensure_single_default_filter()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE public.saved_filters
        SET is_default = false
        WHERE user_id = NEW.user_id 
        AND module = NEW.module 
        AND id != NEW.id
        AND is_default = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_single_default_filter ON public.saved_filters;
CREATE TRIGGER trigger_single_default_filter
    BEFORE INSERT OR UPDATE ON public.saved_filters
    FOR EACH ROW EXECUTE FUNCTION ensure_single_default_filter();
