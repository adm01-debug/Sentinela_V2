-- =============================================
-- SISTEMA DE GAMIFICAÇÃO
-- =============================================

-- Tabela de badges disponíveis
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Identificação
    code TEXT NOT NULL UNIQUE, -- 'first_week', 'productivity_master', etc.
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Visual
    icon TEXT NOT NULL, -- Nome do ícone (lucide ou emoji)
    color TEXT NOT NULL DEFAULT '#6366f1', -- Cor do badge
    
    -- Requisitos
    category TEXT NOT NULL, -- 'productivity', 'attendance', 'security', 'milestone'
    requirement_type TEXT NOT NULL, -- 'count', 'streak', 'threshold', 'special'
    requirement_value INTEGER, -- Valor necessário para conquistar
    requirement_field TEXT, -- Campo a ser verificado
    
    -- Raridade
    rarity TEXT NOT NULL DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    points INTEGER NOT NULL DEFAULT 10, -- Pontos concedidos ao conquistar
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_secret BOOLEAN NOT NULL DEFAULT false, -- Badges secretos não aparecem até serem conquistados
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de badges conquistados pelos funcionários
CREATE TABLE IF NOT EXISTS public.employee_badges (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    
    -- Quando foi conquistado
    earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Contexto da conquista
    context JSONB, -- Dados adicionais sobre como foi conquistado
    
    -- Notificação
    notified BOOLEAN NOT NULL DEFAULT false,
    
    UNIQUE(employee_id, badge_id)
);

-- Tabela de pontos e níveis
CREATE TABLE IF NOT EXISTS public.employee_points (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE UNIQUE,
    
    -- Pontos
    total_points INTEGER NOT NULL DEFAULT 0,
    current_month_points INTEGER NOT NULL DEFAULT 0,
    current_week_points INTEGER NOT NULL DEFAULT 0,
    
    -- Nível
    level INTEGER NOT NULL DEFAULT 1,
    experience INTEGER NOT NULL DEFAULT 0, -- XP para próximo nível
    
    -- Streaks
    current_streak INTEGER NOT NULL DEFAULT 0, -- Dias consecutivos de boa produtividade
    best_streak INTEGER NOT NULL DEFAULT 0,
    last_activity_date DATE,
    
    -- Estatísticas
    badges_count INTEGER NOT NULL DEFAULT 0,
    ranking_position INTEGER,
    
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de histórico de pontos
CREATE TABLE IF NOT EXISTS public.points_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    
    -- Pontos
    points INTEGER NOT NULL,
    reason TEXT NOT NULL, -- 'productivity_bonus', 'badge_earned', 'streak_bonus', etc.
    description TEXT,
    
    -- Referência
    reference_type TEXT, -- 'badge', 'productivity', 'attendance'
    reference_id UUID,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_employee_badges_employee ON public.employee_badges(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_points_total ON public.employee_points(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_employee_points_month ON public.employee_points(current_month_points DESC);
CREATE INDEX IF NOT EXISTS idx_points_history_employee ON public.points_history(employee_id, created_at DESC);

-- RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura (todos autenticados podem ver)
CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can view employee badges" ON public.employee_badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can view employee points" ON public.employee_points FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can view points history" ON public.points_history FOR SELECT TO authenticated USING (true);

-- Apenas admins podem modificar
CREATE POLICY "Admins can manage badges" ON public.badges FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Sistema pode inserir (via triggers/functions)
CREATE POLICY "System can insert employee badges" ON public.employee_badges FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "System can manage employee points" ON public.employee_points FOR ALL TO authenticated USING (true);
CREATE POLICY "System can insert points history" ON public.points_history FOR INSERT TO authenticated WITH CHECK (true);

-- Inserir badges padrão
INSERT INTO public.badges (code, name, description, icon, color, category, requirement_type, requirement_value, rarity, points) VALUES
-- Produtividade
('productivity_starter', 'Iniciante Produtivo', 'Alcançou 70% de produtividade pela primeira vez', '🌱', '#22c55e', 'productivity', 'threshold', 70, 'common', 10),
('productivity_pro', 'Profissional', 'Manteve 80%+ de produtividade por 5 dias', '⭐', '#eab308', 'productivity', 'streak', 5, 'rare', 50),
('productivity_master', 'Mestre da Produtividade', 'Manteve 90%+ de produtividade por 30 dias', '👑', '#f59e0b', 'productivity', 'streak', 30, 'legendary', 500),
('productivity_perfect', 'Perfeição', 'Alcançou 100% de produtividade em um dia', '💎', '#8b5cf6', 'productivity', 'threshold', 100, 'epic', 100),

-- Assiduidade
('first_week', 'Primeira Semana', 'Completou sua primeira semana de trabalho', '📅', '#3b82f6', 'attendance', 'count', 5, 'common', 20),
('first_month', 'Primeiro Mês', 'Completou seu primeiro mês de trabalho', '📆', '#6366f1', 'attendance', 'count', 22, 'rare', 100),
('early_bird', 'Madrugador', 'Chegou antes do horário 10 vezes', '🌅', '#f97316', 'attendance', 'count', 10, 'rare', 50),
('never_late', 'Sempre Pontual', 'Nunca chegou atrasado em um mês', '⏰', '#14b8a6', 'attendance', 'streak', 22, 'epic', 200),

-- Segurança
('security_conscious', 'Consciente', 'Passou 30 dias sem violações', '🛡️', '#22c55e', 'security', 'streak', 30, 'rare', 100),
('security_champion', 'Campeão da Segurança', 'Passou 90 dias sem violações', '🏆', '#eab308', 'security', 'streak', 90, 'legendary', 500),
('clean_record', 'Ficha Limpa', 'Nunca teve uma violação crítica', '✨', '#06b6d4', 'security', 'special', NULL, 'epic', 300),

-- Marcos
('level_5', 'Nível 5', 'Alcançou o nível 5', '5️⃣', '#8b5cf6', 'milestone', 'threshold', 5, 'common', 50),
('level_10', 'Nível 10', 'Alcançou o nível 10', '🔟', '#6366f1', 'milestone', 'threshold', 10, 'rare', 100),
('level_25', 'Veterano', 'Alcançou o nível 25', '🎖️', '#f59e0b', 'milestone', 'threshold', 25, 'epic', 250),
('level_50', 'Lenda', 'Alcançou o nível 50', '🌟', '#ef4444', 'milestone', 'threshold', 50, 'legendary', 1000),

-- Especiais
('first_badge', 'Colecionador', 'Conquistou seu primeiro badge', '🏅', '#ec4899', 'milestone', 'count', 1, 'common', 5),
('badge_collector', 'Grande Colecionador', 'Conquistou 10 badges', '🎯', '#8b5cf6', 'milestone', 'count', 10, 'epic', 200),
('streak_7', 'Semana de Fogo', 'Manteve um streak de 7 dias', '🔥', '#ef4444', 'milestone', 'streak', 7, 'rare', 70),
('streak_30', 'Mês Imparável', 'Manteve um streak de 30 dias', '💪', '#f59e0b', 'milestone', 'streak', 30, 'legendary', 300)
ON CONFLICT (code) DO NOTHING;

-- Função para adicionar pontos
CREATE OR REPLACE FUNCTION public.add_employee_points(
    p_employee_id UUID,
    p_points INTEGER,
    p_reason TEXT,
    p_description TEXT DEFAULT NULL,
    p_reference_type TEXT DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_total INTEGER;
    v_new_level INTEGER;
BEGIN
    -- Inserir ou atualizar pontos
    INSERT INTO public.employee_points (employee_id, total_points, current_month_points, current_week_points)
    VALUES (p_employee_id, p_points, p_points, p_points)
    ON CONFLICT (employee_id) DO UPDATE SET
        total_points = employee_points.total_points + p_points,
        current_month_points = employee_points.current_month_points + p_points,
        current_week_points = employee_points.current_week_points + p_points,
        updated_at = now()
    RETURNING total_points INTO v_new_total;
    
    -- Calcular novo nível (100 pontos por nível, crescimento exponencial)
    v_new_level := GREATEST(1, FLOOR(SQRT(v_new_total / 50)) + 1);
    
    -- Atualizar nível se necessário
    UPDATE public.employee_points
    SET level = v_new_level,
        experience = v_new_total - (v_new_level - 1) * (v_new_level - 1) * 50
    WHERE employee_id = p_employee_id;
    
    -- Registrar histórico
    INSERT INTO public.points_history (employee_id, points, reason, description, reference_type, reference_id)
    VALUES (p_employee_id, p_points, p_reason, p_description, p_reference_type, p_reference_id);
    
    RETURN v_new_total;
END;
$$;

-- Função para conceder badge
CREATE OR REPLACE FUNCTION public.award_badge(
    p_employee_id UUID,
    p_badge_code TEXT,
    p_context JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_badge_id UUID;
    v_badge_points INTEGER;
    v_already_has BOOLEAN;
BEGIN
    -- Buscar badge
    SELECT id, points INTO v_badge_id, v_badge_points
    FROM public.badges
    WHERE code = p_badge_code AND is_active = true;
    
    IF v_badge_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Verificar se já tem
    SELECT EXISTS(
        SELECT 1 FROM public.employee_badges
        WHERE employee_id = p_employee_id AND badge_id = v_badge_id
    ) INTO v_already_has;
    
    IF v_already_has THEN
        RETURN false;
    END IF;
    
    -- Conceder badge
    INSERT INTO public.employee_badges (employee_id, badge_id, context)
    VALUES (p_employee_id, v_badge_id, p_context);
    
    -- Atualizar contagem de badges
    UPDATE public.employee_points
    SET badges_count = badges_count + 1
    WHERE employee_id = p_employee_id;
    
    -- Adicionar pontos do badge
    PERFORM public.add_employee_points(
        p_employee_id,
        v_badge_points,
        'badge_earned',
        'Badge conquistado: ' || p_badge_code,
        'badge',
        v_badge_id
    );
    
    RETURN true;
END;
$$;
