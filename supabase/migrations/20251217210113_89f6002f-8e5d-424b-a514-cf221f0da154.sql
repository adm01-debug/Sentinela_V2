-- Create table for security policies
CREATE TABLE public.security_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  category TEXT NOT NULL CHECK (category IN ('device', 'screen', 'network')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for application rules
CREATE TABLE public.application_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('productivity', 'communication', 'entertainment', 'development', 'other')),
  status TEXT NOT NULL CHECK (status IN ('allowed', 'blocked', 'monitored')) DEFAULT 'monitored',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_rules ENABLE ROW LEVEL SECURITY;

-- RLS policies - only admins can manage
CREATE POLICY "Admins can view policies" ON public.security_policies
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update policies" ON public.security_policies
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert policies" ON public.security_policies
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view app rules" ON public.application_rules
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update app rules" ON public.application_rules
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert app rules" ON public.application_rules
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_security_policies_updated_at
  BEFORE UPDATE ON public.security_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_application_rules_updated_at
  BEFORE UPDATE ON public.application_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default policies
INSERT INTO public.security_policies (name, description, enabled, category) VALUES
  ('Bloquear USB', 'Impede conexão de dispositivos USB não autorizados', true, 'device'),
  ('Bloquear HD Externo', 'Impede conexão de HDs externos não autorizados', true, 'device'),
  ('Bloquear Print Screen', 'Impede capturas de tela em aplicativos sensíveis', true, 'screen'),
  ('Bloquear Gravação de Tela', 'Impede gravação de tela por softwares', true, 'screen'),
  ('Monitorar Clipboard', 'Monitora cópias de conteúdo sensível', false, 'screen'),
  ('Bloquear Sites Não Autorizados', 'Bloqueia acesso a sites da lista negra', true, 'network'),
  ('Monitorar Downloads', 'Monitora todos os downloads realizados', true, 'network'),
  ('Bloquear VPN Não Autorizada', 'Impede uso de VPNs não aprovadas', false, 'network');

-- Insert default application rules
INSERT INTO public.application_rules (name, category, status) VALUES
  ('VS Code', 'development', 'allowed'),
  ('Chrome', 'productivity', 'monitored'),
  ('Slack', 'communication', 'allowed'),
  ('Discord', 'communication', 'blocked'),
  ('Spotify', 'entertainment', 'monitored'),
  ('Netflix', 'entertainment', 'blocked'),
  ('WhatsApp', 'communication', 'monitored'),
  ('Telegram', 'communication', 'blocked'),
  ('Excel', 'productivity', 'allowed'),
  ('Word', 'productivity', 'allowed'),
  ('Figma', 'development', 'allowed'),
  ('YouTube', 'entertainment', 'monitored'),
  ('Steam', 'entertainment', 'blocked'),
  ('Zoom', 'communication', 'allowed'),
  ('Teams', 'communication', 'allowed');