-- ============================================================
-- CRIA whatsapp_templates + whatsapp_config
-- O front (useWhatsAppIntegrationPage.ts) consulta as duas e nenhuma
-- existe no banco (REST: 404 em ambas). Tabelas aditivas, idempotentes.
-- ============================================================

-- Templates do Meta WhatsApp (sincronizados pela edge function sync-whatsapp-templates)
CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id TEXT NOT NULL,              -- id na Meta Graph API
  name TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'pt_BR',
  status TEXT NOT NULL DEFAULT 'pending', -- approved | pending | rejected
  category TEXT,
  body TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (template_id)
);

ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view whatsapp templates"
  ON public.whatsapp_templates FOR SELECT TO authenticated USING (true);

CREATE POLICY "System can upsert whatsapp templates"
  ON public.whatsapp_templates FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE TRIGGER update_whatsapp_templates_updated_at
  BEFORE UPDATE ON public.whatsapp_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Config da integracao WhatsApp (o hook le de "whatsapp_config")
CREATE TABLE IF NOT EXISTS public.whatsapp_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number_id TEXT,
  business_account_id TEXT,
  access_token TEXT,
  webhook_verify_token TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view whatsapp config"
  ON public.whatsapp_config FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert whatsapp config"
  ON public.whatsapp_config FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update whatsapp config"
  ON public.whatsapp_config FOR UPDATE TO authenticated USING (true);

CREATE TRIGGER update_whatsapp_config_updated_at
  BEFORE UPDATE ON public.whatsapp_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();