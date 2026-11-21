-- ============================================================
-- WHATSAPP_CONFIG: provider Evolution na UI (regra do roteador dual)
-- Adiciona colunas aditivas para escolha de provider sem DROP de
-- colunas existentes. Evolution usa a mesma Evolution GO do Zapp:
--   provider = 'evolution' | 'meta' (default 'meta')
--   evolution_api_url          (ex.: https://evolution-go-rxj2.srv1481814.hstgr.cloud)
--   evolution_instance_token   (token da instancia / apikey)
--   evolution_instance_name   (default 'PRINCIPAL')
-- ============================================================

ALTER TABLE public.whatsapp_config
  ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'meta',
  ADD COLUMN IF NOT EXISTS evolution_api_url TEXT,
  ADD COLUMN IF NOT EXISTS evolution_instance_token TEXT,
  ADD COLUMN IF NOT EXISTS evolution_instance_name TEXT NOT NULL DEFAULT 'PRINCIPAL';

-- Garante que apenas valores validos de provider entram
ALTER TABLE public.whatsapp_config
  DROP CONSTRAINT IF EXISTS whatsapp_config_provider_check;

ALTER TABLE public.whatsapp_config
  ADD CONSTRAINT whatsapp_config_provider_check
  CHECK (provider IN ('meta', 'evolution'));