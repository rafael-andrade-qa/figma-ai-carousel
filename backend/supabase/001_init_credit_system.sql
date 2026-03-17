-- =========================================================
-- FIGMA AI CAROUSEL
-- INITIAL CREDIT SYSTEM SCHEMA
-- =========================================================

-- Extensions
create extension if not exists "pgcrypto";

-- =========================================================
-- USERS
-- =========================================================
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_email on public.users(email);

-- =========================================================
-- CREDIT ACCOUNTS
-- One row per user with current balance
-- =========================================================
create table if not exists public.credit_accounts (
  user_id uuid primary key references public.users(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- CREDIT TRANSACTIONS
-- Immutable ledger of all credit movements
-- =========================================================
create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (
    type in ('free_trial', 'usage', 'purchase', 'refund', 'manual_adjustment')
  ),
  amount integer not null,
  balance_before integer not null check (balance_before >= 0),
  balance_after integer not null check (balance_after >= 0),
  description text,
  source_type text,
  source_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_credit_transactions_user_id
  on public.credit_transactions(user_id);

create index if not exists idx_credit_transactions_type
  on public.credit_transactions(type);

create index if not exists idx_credit_transactions_created_at
  on public.credit_transactions(created_at desc);

create index if not exists idx_credit_transactions_source
  on public.credit_transactions(source_type, source_id);

-- =========================================================
-- UPDATED_AT TRIGGER
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_users_set_updated_at on public.users;
create trigger trg_users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

drop trigger if exists trg_credit_accounts_set_updated_at on public.credit_accounts;
create trigger trg_credit_accounts_set_updated_at
before update on public.credit_accounts
for each row
execute function public.set_updated_at();

-- =========================================================
-- HELPER FUNCTION:
-- Ensures user + credit account exist
-- =========================================================
create or replace function public.ensure_user_credit_account(p_email text)
returns table (
  id uuid,
  email text,
  balance integer
)
language plpgsql
as $$
declare
  v_user_id uuid;
begin
  select u.id
    into v_user_id
  from public.users u
  where lower(u.email) = lower(p_email);

  if v_user_id is null then
    insert into public.users (email)
    values (lower(trim(p_email)))
    returning users.id into v_user_id;

    insert into public.credit_accounts (user_id, balance)
    values (v_user_id, 0);
  else
    insert into public.credit_accounts (user_id, balance)
    values (v_user_id, 0)
    on conflict (user_id) do nothing;
  end if;

  return query
  select u.id, u.email, ca.balance
  from public.users u
  join public.credit_accounts ca on ca.user_id = u.id
  where u.id = v_user_id;
end;
$$;

-- =========================================================
-- HELPER FUNCTION:
-- Applies a credit transaction atomically
-- Positive amount => add credits
-- Negative amount => consume credits
-- =========================================================
create or replace function public.apply_credit_transaction(
  p_email text,
  p_type text,
  p_amount integer,
  p_description text default null,
  p_source_type text default null,
  p_source_id text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns table (
  transaction_id uuid,
  user_id uuid,
  email text,
  type text,
  amount integer,
  balance_before integer,
  balance_after integer,
  description text,
  source_type text,
  source_id text,
  metadata jsonb,
  created_at timestamptz
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

  select e.id, e.email, e.balance
    into v_user_id, v_email, v_balance_before
  from public.ensure_user_credit_account(p_email) e;

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

-- =========================================================
-- HELPER FUNCTION:
-- Grants free trial only once per user
-- Returns the inserted transaction if granted
-- Returns zero rows if already granted before
-- =========================================================
create or replace function public.grant_free_trial_once(
  p_email text,
  p_amount integer default 5
)
returns table (
  transaction_id uuid,
  user_id uuid,
  email text,
  type text,
  amount integer,
  balance_before integer,
  balance_after integer,
  description text,
  source_type text,
  source_id text,
  metadata jsonb,
  created_at timestamptz
)
language plpgsql
as $$
declare
  v_user_id uuid;
  v_already_granted boolean;
begin
  select e.id
    into v_user_id
  from public.ensure_user_credit_account(p_email) e;

  select exists (
    select 1
    from public.credit_transactions ct
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