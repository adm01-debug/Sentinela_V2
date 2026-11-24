-- Re-agenda escalate-dispute-sla-every-15min com credencial propria do cron.
--
-- O job foi criado pelo painel e chama a funcao com a anon key, o que impede o
-- gate requireUserOrServiceRole (PR #268) de ficar ativo: ele devolvia 401 a
-- cada 15min e o escalonamento de SLA parava. O gate foi revertido na PR #269.
-- Aqui o banco gera um segredo aleatorio, guarda em public.cron_secrets (RLS
-- sem policy: so service_role le) e injeta o header x-cron-secret no job.
-- A funcao aceita x-cron-secret ou usuario/service_role.

create table if not exists public.cron_secrets (
  name text primary key,
  secret text not null default replace(gen_random_uuid()::text, '-', ''),
  created_at timestamptz not null default now(),
  constraint cron_secrets_secret_len check (length(secret) >= 32)
);

alter table public.cron_secrets enable row level security;
revoke all on table public.cron_secrets from anon, authenticated;
grant select on table public.cron_secrets to service_role;

insert into public.cron_secrets (name) values ('escalate-dispute-sla')
on conflict (name) do nothing;

do $cron$
declare
  v_secret text;
  v_cmd text;
begin
  select secret into v_secret from public.cron_secrets where name = 'escalate-dispute-sla';

  select command into v_cmd from cron.job where jobname = 'escalate-dispute-sla-every-15min';
  if v_cmd is null then
    raise notice 'job escalate-dispute-sla-every-15min ausente: nada a re-agendar';
    return;
  end if;

  if position('x-cron-secret' in v_cmd) = 0 then
    v_cmd := regexp_replace(
      v_cmd,
      'headers\s*:=\s*jsonb_build_object\(',
      format('headers:=jsonb_build_object(''x-cron-secret'',%L,', v_secret),
      1
    );
  end if;

  if position('x-cron-secret' in v_cmd) = 0 then
    raise exception 'nao foi possivel injetar x-cron-secret no comando do cron';
  end if;

  perform cron.unschedule('escalate-dispute-sla-every-15min');
  perform cron.schedule('escalate-dispute-sla-every-15min', '*/15 * * * *', v_cmd);
end
$cron$;