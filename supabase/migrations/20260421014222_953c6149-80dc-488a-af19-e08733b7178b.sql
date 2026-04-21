-- ============================================================
-- SIEM Connectors System
-- ============================================================

-- Enums
CREATE TYPE public.siem_connector_type AS ENUM (
  'splunk_hec',
  'microsoft_sentinel',
  'syslog_cef',
  'generic_webhook'
);

CREATE TYPE public.siem_event_type AS ENUM (
  'security_violation',
  'dlp_incident',
  'ueba_anomaly',
  'auth_event',
  'policy_change'
);

CREATE TYPE public.siem_outbox_status AS ENUM (
  'pending',
  'sent',
  'failed',
  'dead_letter'
);

-- ============================================================
-- siem_connectors: configuration per connector
-- ============================================================
CREATE TABLE public.siem_connectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  connector_type public.siem_connector_type NOT NULL,
  endpoint TEXT NOT NULL,
  -- Encrypted credential payload (JSON with iv, ciphertext) — never returned to clients
  encrypted_credentials TEXT,
  -- Non-sensitive config: workspace_id, sourcetype, host, port, protocol, etc.
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  event_filters public.siem_event_type[] NOT NULL DEFAULT ARRAY['security_violation','dlp_incident','ueba_anomaly']::public.siem_event_type[],
  min_severity TEXT NOT NULL DEFAULT 'low',
  is_active BOOLEAN NOT NULL DEFAULT true,
  paused_until TIMESTAMPTZ,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  last_success_at TIMESTAMPTZ,
  last_error TEXT,
  last_error_at TIMESTAMPTZ,
  timeout_ms INTEGER NOT NULL DEFAULT 5000,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_siem_connectors_company ON public.siem_connectors(company_id) WHERE is_active = true;
CREATE INDEX idx_siem_connectors_active ON public.siem_connectors(is_active, connector_type);

ALTER TABLE public.siem_connectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage SIEM connectors in their company"
ON public.siem_connectors
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  AND (company_id IS NULL OR public.user_in_company(auth.uid(), company_id))
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  AND (company_id IS NULL OR public.user_in_company(auth.uid(), company_id))
);

CREATE TRIGGER trg_siem_connectors_updated_at
BEFORE UPDATE ON public.siem_connectors
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- siem_event_outbox: queue with retry
-- ============================================================
CREATE TABLE public.siem_event_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_id UUID NOT NULL REFERENCES public.siem_connectors(id) ON DELETE CASCADE,
  company_id UUID,
  event_type public.siem_event_type NOT NULL,
  source_table TEXT,
  source_id UUID,
  payload JSONB NOT NULL,
  status public.siem_outbox_status NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  next_retry_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  enqueued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX idx_siem_outbox_pending ON public.siem_event_outbox(next_retry_at) WHERE status = 'pending';
CREATE INDEX idx_siem_outbox_connector ON public.siem_event_outbox(connector_id, status);
CREATE INDEX idx_siem_outbox_enqueued ON public.siem_event_outbox(enqueued_at DESC);

ALTER TABLE public.siem_event_outbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view outbox in their company"
ON public.siem_event_outbox
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  AND (company_id IS NULL OR public.user_in_company(auth.uid(), company_id))
);

-- ============================================================
-- siem_delivery_log: immutable delivery history
-- ============================================================
CREATE TABLE public.siem_delivery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_id UUID NOT NULL REFERENCES public.siem_connectors(id) ON DELETE CASCADE,
  company_id UUID,
  outbox_id UUID,
  event_type public.siem_event_type,
  status TEXT NOT NULL, -- 'success' | 'failure'
  http_code INTEGER,
  latency_ms INTEGER,
  error TEXT,
  response_excerpt TEXT,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_siem_delivery_log_connector ON public.siem_delivery_log(connector_id, delivered_at DESC);
CREATE INDEX idx_siem_delivery_log_status ON public.siem_delivery_log(status, delivered_at DESC);

ALTER TABLE public.siem_delivery_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view delivery log in their company"
ON public.siem_delivery_log
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  AND (company_id IS NULL OR public.user_in_company(auth.uid(), company_id))
);

-- ============================================================
-- enqueue_siem_event: trigger function to fan-out events to all
-- active connectors that subscribe to the given event_type.
-- ============================================================
CREATE OR REPLACE FUNCTION public.enqueue_siem_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_type public.siem_event_type;
  v_company_id UUID;
  v_payload JSONB;
  v_severity TEXT;
  v_connector RECORD;
  v_severity_rank INTEGER;
  v_min_rank INTEGER;
BEGIN
  -- Determine event_type from trigger argument
  v_event_type := TG_ARGV[0]::public.siem_event_type;

  -- Build payload + extract company_id/severity per source table
  IF TG_TABLE_NAME = 'security_violations' THEN
    v_company_id := NULL;
    v_severity := COALESCE(NEW.severity, 'medium');
    v_payload := to_jsonb(NEW);
  ELSIF TG_TABLE_NAME = 'dlp_incidents' THEN
    v_company_id := NEW.company_id;
    v_severity := COALESCE(NEW.severity, 'medium');
    v_payload := to_jsonb(NEW);
  ELSIF TG_TABLE_NAME = 'user_risk_scores' THEN
    v_company_id := NULL;
    v_severity := COALESCE(NEW.level, 'medium');
    v_payload := to_jsonb(NEW);
    -- Only forward high/critical risk scores
    IF v_severity NOT IN ('high', 'critical') THEN
      RETURN NEW;
    END IF;
  ELSE
    v_payload := to_jsonb(NEW);
    v_severity := 'medium';
  END IF;

  -- Severity ranks for filter comparison
  v_severity_rank := CASE lower(v_severity)
    WHEN 'low' THEN 1
    WHEN 'medium' THEN 2
    WHEN 'high' THEN 3
    WHEN 'critical' THEN 4
    ELSE 2
  END;

  -- Fan-out to matching active connectors
  FOR v_connector IN
    SELECT id, company_id, min_severity
    FROM public.siem_connectors
    WHERE is_active = true
      AND (paused_until IS NULL OR paused_until <= now())
      AND v_event_type = ANY(event_filters)
      AND (company_id IS NULL OR v_company_id IS NULL OR company_id = v_company_id)
  LOOP
    v_min_rank := CASE lower(v_connector.min_severity)
      WHEN 'low' THEN 1
      WHEN 'medium' THEN 2
      WHEN 'high' THEN 3
      WHEN 'critical' THEN 4
      ELSE 1
    END;

    IF v_severity_rank >= v_min_rank THEN
      INSERT INTO public.siem_event_outbox (
        connector_id, company_id, event_type, source_table, source_id, payload
      ) VALUES (
        v_connector.id,
        v_connector.company_id,
        v_event_type,
        TG_TABLE_NAME,
        NEW.id,
        v_payload
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Triggers on source tables
CREATE TRIGGER trg_siem_dispatch_security_violation
AFTER INSERT ON public.security_violations
FOR EACH ROW EXECUTE FUNCTION public.enqueue_siem_event('security_violation');

CREATE TRIGGER trg_siem_dispatch_dlp_incident
AFTER INSERT ON public.dlp_incidents
FOR EACH ROW EXECUTE FUNCTION public.enqueue_siem_event('dlp_incident');

CREATE TRIGGER trg_siem_dispatch_ueba
AFTER INSERT ON public.user_risk_scores
FOR EACH ROW EXECUTE FUNCTION public.enqueue_siem_event('ueba_anomaly');