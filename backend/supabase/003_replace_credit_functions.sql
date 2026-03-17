-- =========================================================
-- Replace helper functions to avoid PL/pgSQL name ambiguity
-- =========================================================

drop function if exists public.grant_free_trial_once(text, integer);
drop function if exists public.apply_credit_transaction(text, text, integer, text, text, text, jsonb);
drop function if exists public.ensure_user_credit_account(text);

create function public.ensure_user_credit_account(p_email text)
returns table (
  out_user_id uuid,
  out_email text,
  out_balance integer
)
language plpgsql
as $$
declare
  v_user_id uuid;
begin
  select u.id
    into v_user_id
  from public.users as u
  where lower(u.email) = lower(trim(p_email));

  if v_user_id is null then
    insert into public.users (email)
    values (lower(trim(p_email)))
    returning id into v_user_id;

    insert into public.credit_accounts (user_id, balance)
    values (v_user_id, 0);
  else
    insert into public.credit_accounts (user_id, balance)
    values (v_user_id, 0)
    on conflict (user_id) do nothing;
  end if;

  return query
  select
    u.id as out_user_id,
    u.email as out_email,
    ca.balance as out_balance
  from public.users as u
  join public.credit_accounts as ca
    on ca.user_id = u.id
  where u.id = v_user_id;
end;
$$;

create function public.apply_credit_transaction(
  p_email text,
  p_type text,
  p_amount integer,
  p_description text default null,
  p_source_type text default null,
  p_source_id text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns table (
  out_transaction_id uuid,
  out_user_id uuid,
  out_email text,
  out_type text,
  out_amount integer,
  out_balance_before integer,
  out_balance_after integer,
  out_description text,
  out_source_type text,
  out_source_id text,
  out_metadata jsonb,
  out_created_at timestamptz
)
language plpgsql
as $$
declare
  v_user_id uuid;
  v_email text;
  v_balance_before integer;
  v_balance_after integer;
  v_transaction_id uuid;
  v_created_at timestamptz;
begin
  if p_amount = 0 then
    raise exception 'Transaction amount cannot be zero';
  end if;

  if p_type not in ('free_trial', 'usage', 'purchase', 'refund', 'manual_adjustment') then
    raise exception 'Invalid transaction type: %', p_type;
  end if;

  select e.out_user_id, e.out_email, e.out_balance
    into v_user_id, v_email, v_balance_before
  from public.ensure_user_credit_account(p_email) as e;

  select ca.balance
    into v_balance_before
  from public.credit_accounts as ca
  where ca.user_id = v_user_id
  for update;

  v_balance_after := v_balance_before + p_amount;

  if v_balance_after < 0 then
    raise exception 'Insufficient credits';
  end if;

  update public.credit_accounts as ca
  set balance = v_balance_after
  where ca.user_id = v_user_id;

  insert into public.credit_transactions (
    user_id,
    type,
    amount,
    balance_before,
    balance_after,
    description,
    source_type,
    source_id,
    metadata
  )
  values (
    v_user_id,
    p_type,
    p_amount,
    v_balance_before,
    v_balance_after,
    p_description,
    p_source_type,
    p_source_id,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id, created_at
    into v_transaction_id, v_created_at;

  return query
  select
    ct.id as out_transaction_id,
    u.id as out_user_id,
    u.email as out_email,
    ct.type as out_type,
    ct.amount as out_amount,
    ct.balance_before as out_balance_before,
    ct.balance_after as out_balance_after,
    ct.description as out_description,
    ct.source_type as out_source_type,
    ct.source_id as out_source_id,
    ct.metadata as out_metadata,
    ct.created_at as out_created_at
  from public.credit_transactions as ct
  join public.users as u
    on u.id = ct.user_id
  where ct.id = v_transaction_id;
end;
$$;

create function public.grant_free_trial_once(
  p_email text,
  p_amount integer default 5
)
returns table (
  out_transaction_id uuid,
  out_user_id uuid,
  out_email text,
  out_type text,
  out_amount integer,
  out_balance_before integer,
  out_balance_after integer,
  out_description text,
  out_source_type text,
  out_source_id text,
  out_metadata jsonb,
  out_created_at timestamptz
)
language plpgsql
as $$
declare
  v_user_id uuid;
  v_already_granted boolean;
begin
  select e.out_user_id
    into v_user_id
  from public.ensure_user_credit_account(p_email) as e;

  select exists (
    select 1
    from public.credit_transactions as ct
    where ct.user_id = v_user_id
      and ct.type = 'free_trial'
  )
  into v_already_granted;

  if v_already_granted then
    return;
  end if;

  return query
  select *
  from public.apply_credit_transaction(
    p_email => p_email,
    p_type => 'free_trial',
    p_amount => p_amount,
    p_description => 'Free trial credits granted',
    p_source_type => 'system',
    p_source_id => 'free_trial',
    p_metadata => jsonb_build_object('reason', 'initial_trial')
  );
end;
$$;