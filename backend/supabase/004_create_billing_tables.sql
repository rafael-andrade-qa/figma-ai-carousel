-- =========================================================
-- BILLING TABLES
-- Prepara a base para Stripe Checkout + Webhook
-- =========================================================

create table if not exists public.checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  provider text not null default 'stripe',
  package_id text not null,
  credits integer not null check (credits > 0),
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'brl',
  status text not null check (
    status in ('pending', 'paid', 'expired', 'failed', 'canceled')
  ) default 'pending',
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists idx_checkout_sessions_user_id
  on public.checkout_sessions(user_id);

create index if not exists idx_checkout_sessions_status
  on public.checkout_sessions(status);

create index if not exists idx_checkout_sessions_created_at
  on public.checkout_sessions(created_at desc);

create index if not exists idx_checkout_sessions_package_id
  on public.checkout_sessions(package_id);

create table if not exists public.stripe_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  processed_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb
);

create index if not exists idx_stripe_events_event_type
  on public.stripe_events(event_type);

create index if not exists idx_stripe_events_processed_at
  on public.stripe_events(processed_at desc);

drop trigger if exists trg_checkout_sessions_set_updated_at on public.checkout_sessions;
create trigger trg_checkout_sessions_set_updated_at
before update on public.checkout_sessions
for each row
execute function public.set_updated_at();