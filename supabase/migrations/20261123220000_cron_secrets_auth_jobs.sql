-- Re-agenda os jobs que chamam edge functions direto, com credencial propria.
--
-- Os 4 jobs foram criados pelo painel e chamam a funcao com a anon key, o que
-- impede o gate de auth das edges (PR #268) de ficar ativo: ele devolve 401 a
-- cada execucao (foi o que parou o escalonamento de SLA, revertido na PR #269).
-- Aqui o banco gera um segredo POR FUNCAO, guarda em public.cron_secrets (RLS
-- sem policy: so service_role le) e acrescenta o header x-cron-secret ao
-- comando que o job ja usa, preservando apikey/Authorization/timeout. As
-- funcoes aceitam x-cron-secret OU usuario/service_role.

create table if not exists public.cron_secrets (
  name text primary key,
  secret text not null default replace(gen_random_uuid()::text, '-', ''),
  created_at timestamptz not null default now(),
  constraint cron_secrets_secret_len check (length(secret) >= 32)
);

alter table public.cron_secrets enable row level security;
revoke all on table public.cron_secrets from public;
revoke all on table public.cron_secrets from anon, authenticated;
grant select on table public.cron_secrets to service_role;

insert into public.cron_secrets (name) values
  ('escalate-dispute-sla'),
  ('expire-recordings'),
  ('slack-mttr-monitor'),
  ('slack-weekly-digest')
on conflict (name) do nothing;

do $cron$
declare
  r record;
  v_secret text;
  v_cmd text;
  v_new text;
  v_apikey text;
begin
  for r in
    select * from (values
      ('escalate-dispute-sla-every-15min', 'escalate-dispute-sla', '*/15 * * * *'),
      ('expire-recordings-hourly', 'expire-recordings', '5,35 * * * *'),
      ('slack-mttr-monitor-hourly', 'slack-mttr-monitor', '20 * * * *'),
      ('slack-weekly-digest-monday', 'slack-weekly-digest', '0 9 * * 1')
    ) as t(jobname, fn, schedule)
  loop
    select secret into v_secret from public.cron_secrets where name = r.fn;
    if v_secret is null then
      raise exception 'segredo ausente para %', r.fn;
    end if;

    select command into v_cmd from cron.job where jobname = r.jobname;
    if v_cmd is null then
      raise notice 'job % ausente: nada a re-agendar', r.jobname;
      continue;
    end if;

    if position('x-cron-secret' in v_cmd) > 0 then
      v_new := v_cmd;
    else
      -- Caminho 1: acrescenta o header dentro do jsonb_build_object que o job
      -- ja usa. Preserva tudo o que existe (apikey, Authorization, timeout).
      v_new := regexp_replace(
        v_cmd,
        'headers\s*:=\s*jsonb_build_object\(',
        format('headers:=jsonb_build_object(''x-cron-secret'',%L,', v_secret)
      );
      if position('x-cron-secret' in v_new) = 0 then
        -- Caminho 2 (job com formato inesperado): reconstroi o comando no
        -- formato ja provado em producao pela migration de 20261121200500,
        -- reusando a chave que o proprio job usa hoje.
        v_apikey := coalesce(
          substring(v_cmd from '''apikey''\s*,\s*''([^'']+)'''),
          substring(v_cmd from '''apikey''\s*:\s*''([^'']+)'''),
          substring(v_cmd from 'Bearer ([A-Za-z0-9_\.\-]+)')
        );
        if v_apikey is null then
          raise exception 'job %: sem jsonb_build_object e sem apikey para preservar', r.jobname;
        end if;
        v_new := format(
          'select net.http_post(url:=%L, headers:=jsonb_build_object(''Content-Type'',''application/json'',''apikey'',%L,''Authorization'',%L,''x-cron-secret'',%L), timeout_milliseconds:=30000, body:=%L::jsonb);',
          'https://jgnmwvzephsozsqmcpzb.supabase.co/functions/v1/' || r.fn,
          v_apikey,
          'Bearer ' || v_apikey,
          v_secret,
          '{"trigger":"cron"}'
        );
      end if;
    end if;

    perform cron.unschedule(r.jobname);
    perform cron.schedule(r.jobname, r.schedule, v_new);
    raise notice 'job % re-agendado com x-cron-secret', r.jobname;
  end loop;
end
$cron$;