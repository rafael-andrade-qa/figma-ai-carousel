create or replace function public.apply_credit_transaction_by_user_id(
  p_user_id uuid,
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

  select u.id, u.email
    into v_user_id, v_email
  from public.users u
  where u.id = p_user_id;

  if v_user_id is null then
    raise exception 'User not found';
  end if;

  insert into public.credit_accounts (user_id, balance)
  values (v_user_id, 0)
  on conflict (user_id) do nothing;

  select ca.balance
    into v_balance_before
  from public.credit_accounts ca
  where ca.user_id = v_user_id
  for update;

  v_balance_after := v_balance_before + p_amount;

  if v_balance_after < 0 then
    raise exception 'Insufficient credits';
  end if;

  update public.credit_accounts
  set balance = v_balance_after
  where user_id = v_user_id;

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
    ct.id,
    u.id,
    u.email,
    ct.type,
    ct.amount,
    ct.balance_before,
    ct.balance_after,
    ct.description,
    ct.source_type,
    ct.source_id,
    ct.metadata,
    ct.created_at
  from public.credit_transactions ct
  join public.users u on u.id = ct.user_id
  where ct.id = v_transaction_id;
end;
$$;