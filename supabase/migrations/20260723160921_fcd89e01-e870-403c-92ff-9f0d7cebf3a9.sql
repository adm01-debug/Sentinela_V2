
-- 1) Função de limpeza de itens antigos da DLQ (>30 dias)
CREATE OR REPLACE FUNCTION public.cleanup_slack_dlq_old_items()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.slack_notification_dlq
  WHERE created_at < now() - INTERVAL '30 days';
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- 2) Agenda no pg_cron (idempotente)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid)
    FROM cron.job
    WHERE jobname = 'cleanup-slack-dlq-daily';

    PERFORM cron.schedule(
      'cleanup-slack-dlq-daily',
      '0 3 * * *',
      $cron$ SELECT public.cleanup_slack_dlq_old_items(); $cron$
    );
  END IF;
END $$;

-- 3) View de MTTR (Mean Time To Recovery) por webhook Slack
-- Calcula, para cada auto-pausa da integração, quanto tempo levou até
-- o primeiro item da DLQ ser reenviado com sucesso (proxy para MTTR).
CREATE OR REPLACE VIEW public.slack_webhook_mttr
WITH (security_invoker = true)
AS
WITH recoveries AS (
  SELECT
    d.integration_id,
    i.name AS integration_name,
    d.created_at AS pause_time,
    (
      SELECT MIN(r.replayed_at)
      FROM public.slack_notification_dlq r
      WHERE r.integration_id = d.integration_id
        AND r.replay_success = true
        AND r.replayed_at > d.created_at
    ) AS recovered_at
  FROM public.slack_notification_dlq d
  JOIN public.slack_integrations i ON i.id = d.integration_id
  WHERE d.permanent = true
),
durations AS (
  SELECT
    integration_id,
    integration_name,
    EXTRACT(EPOCH FROM (recovered_at - pause_time)) AS seconds_to_recover
  FROM recoveries
  WHERE recovered_at IS NOT NULL
)
SELECT
  integration_id,
  integration_name,
  COUNT(*)::int AS recovery_events,
  ROUND(AVG(seconds_to_recover))::int AS mttr_avg_seconds,
  ROUND(percentile_cont(0.5) WITHIN GROUP (ORDER BY seconds_to_recover))::int AS mttr_p50_seconds,
  ROUND(percentile_cont(0.95) WITHIN GROUP (ORDER BY seconds_to_recover))::int AS mttr_p95_seconds,
  MAX(seconds_to_recover)::int AS mttr_max_seconds
FROM durations
GROUP BY integration_id, integration_name;

GRANT SELECT ON public.slack_webhook_mttr TO authenticated;
GRANT SELECT ON public.slack_webhook_mttr TO service_role;
