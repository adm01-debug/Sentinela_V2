-- Table for keystroke activity data
CREATE TABLE public.keystroke_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_name TEXT NOT NULL,
  device TEXT,
  app_name TEXT,
  keystrokes_count INTEGER NOT NULL DEFAULT 0,
  active_time_seconds INTEGER NOT NULL DEFAULT 0,
  idle_time_seconds INTEGER NOT NULL DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for productivity metrics
CREATE TABLE public.productivity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_name TEXT NOT NULL,
  device TEXT,
  productive_time_seconds INTEGER NOT NULL DEFAULT 0,
  unproductive_time_seconds INTEGER NOT NULL DEFAULT 0,
  neutral_time_seconds INTEGER NOT NULL DEFAULT 0,
  apps_used JSONB DEFAULT '[]'::jsonb,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for screen captures
CREATE TABLE public.screen_captures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_name TEXT NOT NULL,
  device TEXT,
  capture_url TEXT NOT NULL,
  app_name TEXT,
  window_title TEXT,
  captured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for monitoring settings
CREATE TABLE public.monitoring_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.keystroke_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productivity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screen_captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for keystroke_logs
CREATE POLICY "Admins can view keystroke logs" ON public.keystroke_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert keystroke logs" ON public.keystroke_logs
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for productivity_logs
CREATE POLICY "Admins can view productivity logs" ON public.productivity_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert productivity logs" ON public.productivity_logs
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for screen_captures
CREATE POLICY "Admins can view screen captures" ON public.screen_captures
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert screen captures" ON public.screen_captures
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete screen captures" ON public.screen_captures
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for monitoring_settings
CREATE POLICY "Admins can view monitoring settings" ON public.monitoring_settings
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update monitoring settings" ON public.monitoring_settings
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert monitoring settings" ON public.monitoring_settings
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default monitoring settings
INSERT INTO public.monitoring_settings (setting_key, setting_value, description) VALUES
  ('keystroke_monitoring', '{"enabled": true, "interval_seconds": 60}', 'Configurações de monitoramento de teclas'),
  ('productivity_tracking', '{"enabled": true, "work_hours_start": "09:00", "work_hours_end": "18:00"}', 'Configurações de produtividade'),
  ('screen_capture', '{"enabled": true, "interval_minutes": 5, "blur_sensitive": true}', 'Configurações de captura de tela'),
  ('monitoring_notice', '{"show_notice": true, "notice_text": "Este dispositivo está sendo monitorado para fins de segurança corporativa."}', 'Aviso de monitoramento');

-- Trigger for updated_at
CREATE TRIGGER update_monitoring_settings_updated_at
  BEFORE UPDATE ON public.monitoring_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();