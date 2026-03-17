-- =========================================================
-- Add Supabase Auth linkage to public.users
-- =========================================================

alter table public.users
add column if not exists auth_user_id uuid;

create unique index if not exists idx_users_auth_user_id
  on public.users(auth_user_id)
  where auth_user_id is not null;

-- =========================================================
-- Helper:
-- Ensures an authenticated app user exists and is linked to auth.users
-- =========================================================
create or replace function public.ensure_authenticated_user(
  p_auth_user_id uuid,
  p_email text
)
returns table (
  out_user_id uuid,
  out_auth_user_id uuid,
  out_email text,
  out_balance integer
)
language plpgsql
as $$
declare
  v_user_id uuid;
  v_email text;
begin
  if p_auth_user_id is null then
    raise exception 'auth_user_id is required';
  end if;

  if p_email is null or length(trim(p_email)) = 0 then
    raise exception 'email is required';
  end if;

  v_email := lower(trim(p_email));

  -- 1) First try by auth_user_id
  select u.id
    into v_user_id
  from public.users as u
  where u.auth_user_id = p_auth_user_id;

  -- 2) If not found, try by email (migration path from old model)
  if v_user_id is null then
    select u.id
      into v_user_id
    from public.users as u
    where lower(u.email) = v_email;
  end if;

  -- 3) Create if still missing
  if v_user_id is null then
    insert into public.users (email, auth_user_id)
    values (v_email, p_auth_user_id)
    returning id into v_user_id;

    insert into public.credit_accounts (user_id, balance)
    values (v_user_id, 0);
  else
    -- 4) Backfill/link auth_user_id and keep email in sync
    update public.users
    set
      auth_user_id = coalesce(auth_user_id, p_auth_user_id),
      email = v_email
    where id = v_user_id;

    insert into public.credit_accounts (user_id, balance)
    values (v_user_id, 0)
    on conflict (user_id) do nothing;
  end if;

  return query
  select
    u.id as out_user_id,
    u.auth_user_id as out_auth_user_id,
    u.email as out_email,
    ca.balance as out_balance
  from public.users as u
  join public.credit_accounts as ca
    on ca.user_id = u.id
  where u.id = v_user_id;
end;
$$;