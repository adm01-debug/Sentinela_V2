-- Re-agenda os jobs que chamam edge functions direto, com credencial propria.
--
-- Os jobs foram criados pelo painel e chamam a funcao com a anon key, o que
-- impede o gate requireUserOrServiceRole (PR #268) de ficar ativo: ele
-- devolvia 401 a cada execucao (o escalonamento de SLA parou e foi revertido
-- na PR #269). Aqui o banco gera um segredo por funcao, guarda em
-- public.cron_secrets (RLS sem policy: so service_role le) e injeta o header
-- x-cron-secret no comando que o job ja usa, preservando as chaves atuais.
-- As funcoes aceitam x-cron-secret ou usuario/service_role.

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
begin
  for r in
    select * from (values
      ('escalate-dispute-sla-every-15min', 'escalate-dispute-sla', '*/15 * * * *'),
      ('expire-recordings-hourly', 'expire-recordings', '5,35 * * * *'),
      ('slack-mttr-monitor-hourly', 'slack-mttr-monitor', '20 * * * *'),
      ('slack-weekly-digest-monday', 'slack-weekly-digest', '0 9 * * 1')
    ) as t(jobname, secret_name, schedule)
  loop
    select secret into v_secret from public.cron_secrets where name = r.secret_name;
    if v_secret is null then
      raise exception 'segredo ausente para %', r.secret_name;
    end if;

    select command into v_cmd from cron.job where jobname = r.jobname;
    if v_cmd is null then
      raise notice 'job % ausente: nada a re-agendar', r.jobname;
      continue;
    end if;

    if position('x-cron-secret' in v_cmd) = 0 then
      v_cmd := regexp_replace(
        v_cmd,
        'headers\s*:=\s*jsonb_build_object\(',
        format('headers:=jsonb_build_object(''x-cron-secret'',%L,', v_secret)
      );
    end if;

    if position('x-cron-secret' in v_cmd) = 0 then
      raise exception 'nao foi possivel injetar x-cron-secret no job %', r.jobname;
    end if;

    perform cron.unschedule(r.jobname);
    perform cron.schedule(r.jobname, r.schedule, v_cmd);
  end loop;
end
$cron$;