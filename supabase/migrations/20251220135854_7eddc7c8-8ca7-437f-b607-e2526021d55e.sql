-- ============================================================
-- GAMIFICATION SYSTEM TABLES
-- ============================================================

-- Badges table - defines available badges
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT NOT NULL DEFAULT 'achievement',
  points_required INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Employee points table - tracks employee gamification progress
CREATE TABLE IF NOT EXISTS public.employee_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  experience INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id)
);

-- Employee badges table - tracks earned badges
CREATE TABLE IF NOT EXISTS public.employee_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, badge_id)
);

-- Points history table - tracks points transactions
CREATE TABLE IF NOT EXISTS public.points_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for badges
CREATE POLICY "Admins can manage badges" ON public.badges
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view badges" ON public.badges
  FOR SELECT USING (true);

-- RLS Policies for employee_points
CREATE POLICY "Admins can manage employee points" ON public.employee_points
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view employee points" ON public.employee_points
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for employee_badges
CREATE POLICY "Admins can manage employee badges" ON public.employee_badges
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view employee badges" ON public.employee_badges
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for points_history
CREATE POLICY "Admins can view points history" ON public.points_history
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert points history" ON public.points_history
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_employee_points_employee ON public.employee_points(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_badges_employee ON public.employee_badges(employee_id);
CREATE INDEX IF NOT EXISTS idx_points_history_employee ON public.points_history(employee_id);
CREATE INDEX IF NOT EXISTS idx_points_history_created ON public.points_history(created_at DESC);

-- Create updated_at triggers
CREATE TRIGGER update_badges_updated_at
  BEFORE UPDATE ON public.badges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_points_updated_at
  BEFORE UPDATE ON public.employee_points
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default badges
INSERT INTO public.badges (name, description, icon, category, points_required) VALUES
  ('Primeiro Login', 'Completou o primeiro acesso ao sistema', '🎯', 'onboarding', 0),
  ('Semana Perfeita', '7 dias sem violações', '⭐', 'compliance', 100),
  ('Mês Produtivo', 'Produtividade acima de 80% por 30 dias', '🏆', 'productivity', 500),
  ('Guardião da Segurança', 'Zero violações em 90 dias', '🛡️', 'security', 1000),
  ('Líder de Equipe', 'Melhor desempenho da equipe', '👑', 'leadership', 750),
  ('Madrugador', 'Login antes das 8h por 5 dias', '🌅', 'attendance', 200),
  ('Dedicado', '100 horas de trabalho produtivo', '💪', 'productivity', 300),
  ('Mentor', 'Ajudou novos funcionários', '🎓', 'social', 400)
ON CONFLICT DO NOTHING;