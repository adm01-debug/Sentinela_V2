-- Corrige o cron expire-recordings-hourly: o job enviava apenas o header
-- `apikey`, sem `Authorization`, e a edge respondia 401
-- UNAUTHORIZED_NO_AUTH_HEADER a cada hora (12 falhas em 24h observadas
-- em net._http_response).
--
-- O job passa a enviar os dois headers, reaproveitando exatamente a mesma
-- anon key que os outros 5 crons do projeto ja usam inline. Nenhum segredo
-- novo e introduzido; a chave e lida do proprio cron.job em producao.
DO $$
DECLARE
  v_anon TEXT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    RETURN;
  END IF;

  -- Reaproveita a anon key ja usada pelo cron de escalonamento de SLA.
  SELECT substring(command FROM '''apikey'':''([^'']+)''') INTO v_anon
  FROM cron.job
  WHERE jobname <> 'expire-recordings-hourly'
    AND command LIKE '%apikey%'
  LIMIT 1;

  IF v_anon IS NULL THEN
    RAISE NOTICE 'anon key nao encontrada em cron.job; job mantido como esta';
    RETURN;
  END IF;

  PERFORM cron.unschedule(jobid)
  FROM cron.job
  WHERE jobname = 'expire-recordings-hourly';

  PERFORM cron.schedule(
    'expire-recordings-hourly',
    '15 * * * *',
    format(
      $cron$
      SELECT net.http_post(
        url := 'https://jgnmwvzephsozsqmcpzb.supabase.co/functions/v1/expire-recordings',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'apikey', %L,
          'Authorization', %L
        ),
        body := jsonb_build_object('time', now())
      );
      $cron$,
      v_anon,
      'Bearer ' || v_anon
    )
  );
END $$;