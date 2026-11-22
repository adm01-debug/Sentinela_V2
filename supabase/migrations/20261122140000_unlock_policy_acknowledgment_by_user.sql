-- Destrava o aceite de politicas por usuario.
--
-- Problema: policy_acknowledgments so tinha employee_name (texto livre) e o
-- SELECT exigia has_role(auth.uid(),'admin'). Um usuario comum nao conseguia
-- ler o proprio aceite, entao o PolicyGate (que checa esse SELECT) trancava
-- todo mundo -- foi exatamente o lockout da PR #223, revertido por 75596b2b5.
--
-- Correcao: (1) coluna user_id amarrando o aceite a auth.uid(); (2) RPC
-- security definer que responde apenas pelo proprio usuario; (3) backfill do
-- que ja existe por email/nome.

alter table public.policy_acknowledgments
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists policy_acknowledgments_user_id_acknowledged_at_idx
  on public.policy_acknowledgments (user_id, acknowledged_at desc);

-- Backfill: registros antigos so tinham nome/email.
update public.policy_acknowledgments pa
set user_id = u.id
from auth.users u
where pa.user_id is null
  and (
    pa.employee_name = u.email
    or pa.employee_name = u.raw_user_meta_data->>'name'
    or pa.employee_name = u.raw_user_meta_data->>'full_name'
  );

-- RPC: o usuario so enxerga o proprio aceite. SECURITY DEFINER porque a RLS
-- de SELECT e admin-only e nao deve ser aberta.
create or replace function public.my_policy_acknowledgment_status()
returns table (has_acknowledged_today boolean, last_acknowledged_at timestamptz, is_exempt boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_name text;
begin
  if v_uid is null then
    return query select false, null::timestamptz, false;
    return;
  end if;

  select u.email, coalesce(u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'full_name')
    into v_email, v_name
  from auth.users u
  where u.id = v_uid;

  return query
  select
    exists (
      select 1
      from public.policy_acknowledgments pa
      where pa.user_id = v_uid
        and pa.acknowledged_at >= current_date
    ),
    (
      select max(pa.acknowledged_at)
      from public.policy_acknowledgments pa
      where pa.user_id = v_uid
    ),
    exists (
      select 1
      from public.policy_exemptions pe
      where (pe.employee_name = v_email or pe.employee_name = v_name)
        and (pe.expires_at is null or pe.expires_at > now())
    );
end;
$$;

revoke all on function public.my_policy_acknowledgment_status() from public, anon;
grant execute on function public.my_policy_acknowledgment_status() to authenticated;

-- O insert passa a exigir o dono. Mantem o caminho anonimo de quem se
-- identifica por nome (fluxo publico de confirmacao), mas se houver usuario
-- logado o user_id tem que ser ele mesmo: ninguem registra aceite pelo outro.
drop policy if exists "Allow public inserts for employee confirmations"
  on public.policy_acknowledgments;

create policy "Allow employee confirmations with own user_id"
  on public.policy_acknowledgments
  for insert
  to anon, authenticated
  with check (
    (employee_name is not null and length(employee_name) > 0)
    and (user_id is null or user_id = auth.uid())
  );
