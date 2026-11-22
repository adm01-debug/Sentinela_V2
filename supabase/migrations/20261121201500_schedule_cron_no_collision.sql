-- Escalona os crons para evitar colisao de slot e sobe o timeout do pg_net.
-- Diagnostico: em todo :15 tres jobs disparavam juntos; expire-recordings oracle
-- o timeout default de 5000ms do pg_net (status_code NULL) e 2 chamadas
-- voltavam 401 UNAUTHORIZED_NO_AUTH_HEADER. Isolados, todos respondiam 200.
do $blk$
declare v_cmd text;
begin
  if exists (select 1 from cron.job where jobname = 'expire-recordings-hourly') then
    select regexp_replace(command, 'timeout_milliseconds\s*:=\s*\d+', 'timeout_milliseconds:=30000') into v_cmd
      from cron.job where jobname='expire-recordings-hourly';
    if v_cmd not like '%timeout_milliseconds%' then
      v_cmd := replace(v_cmd, 'body:=', 'timeout_milliseconds:=30000, body:=');
    end if;
    perform cron.unschedule('expire-recordings-hourly');
    perform cron.schedule('expire-recordings-hourly', '5,35 * * * *', v_cmd);
  end if;
  if exists (select 1 from cron.job where jobname = 'slack-mttr-monitor-hourly') then
    select regexp_replace(command, 'timeout_milliseconds\s*:=\s*\d+', 'timeout_milliseconds:=30000') into v_cmd
      from cron.job where jobname='slack-mttr-monitor-hourly';
    if v_cmd not like '%timeout_milliseconds%' then
      v_cmd := replace(v_cmd, 'body:=', 'timeout_milliseconds:=30000, body:=');
    end if;
    perform cron.unschedule('slack-mttr-monitor-hourly');
    perform cron.schedule('slack-mttr-monitor-hourly', '20 * * * *', v_cmd);
  end if;
  if exists (select 1 from cron.job where jobname = 'escalate-dispute-sla-every-15min') then
    select regexp_replace(command, 'timeout_milliseconds\s*:=\s*\d+', 'timeout_milliseconds:=30000') into v_cmd
      from cron.job where jobname='escalate-dispute-sla-every-15min';
    if v_cmd not like '%timeout_milliseconds%' then
      v_cmd := replace(v_cmd, 'body:=', 'timeout_milliseconds:=30000, body:=');
    end if;
    perform cron.unschedule('escalate-dispute-sla-every-15min');
    perform cron.schedule('escalate-dispute-sla-every-15min', '*/15 * * * *', v_cmd);
  end if;
  -- cleanup-slack-dlq-daily dividia as 03:00 com cleanup-edge-function-logs-daily
  if exists (select 1 from cron.job where jobname = 'cleanup-slack-dlq-daily') then
    select command into v_cmd from cron.job where jobname='cleanup-slack-dlq-daily';
    perform cron.unschedule('cleanup-slack-dlq-daily');
    perform cron.schedule('cleanup-slack-dlq-daily', '10 3 * * *', v_cmd);
  end if;
end $blk$;