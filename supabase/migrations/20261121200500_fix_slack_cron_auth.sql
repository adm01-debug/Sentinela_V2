-- Corrige os crons slack-mttr-monitor-hourly (jobid 5) e slack-weekly-digest-monday (jobid 6),
-- que enviavam apenas 'apikey' e recebiam 401 UNAUTHORIZED_NO_AUTH_HEADER da gateway
-- (evidencia: net._http_response com 401 a cada :15 por 24h).
-- A anon key e extraida do proprio cron.job; vault.decrypted_secrets esta vazio neste projeto.

DO $cronfix$
DECLARE
  anon_key text;
BEGIN
  SELECT substring(command from '(eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+)')
    INTO anon_key
  FROM cron.job
  WHERE command ~ 'eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+'
  LIMIT 1;

  IF anon_key IS NULL THEN
    RAISE EXCEPTION 'anon key nao encontrada em cron.job';
  END IF;

  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'slack-mttr-monitor-hourly') THEN
    PERFORM cron.unschedule('slack-mttr-monitor-hourly');
  END IF;

  PERFORM cron.schedule(
    'slack-mttr-monitor-hourly',
    '15 * * * *',
    format(
      'SELECT net.http_post(url:=%L, headers:=jsonb_build_object(''Content-Type'',''application/json'',''apikey'',%L,''Authorization'',%L), body:=%L::jsonb);',
      'https://jgnmwvzephsozsqmcpzb.supabase.co/functions/v1/slack-mttr-monitor',
      anon_key,
      'Bearer ' || anon_key,
      '{"trigger":"cron"}'
    )
  );

  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'slack-weekly-digest-monday') THEN
    PERFORM cron.unschedule('slack-weekly-digest-monday');
  END IF;

  PERFORM cron.schedule(
    'slack-weekly-digest-monday',
    '0 9 * * 1',
    format(
      'SELECT net.http_post(url:=%L, headers:=jsonb_build_object(''Content-Type'',''application/json'',''apikey'',%L,''Authorization'',%L), body:=%L::jsonb);',
      'https://jgnmwvzephsozsqmcpzb.supabase.co/functions/v1/slack-weekly-digest',
      anon_key,
      'Bearer ' || anon_key,
      '{"trigger":"cron"}'
    )
  );
END
$cronfix$;