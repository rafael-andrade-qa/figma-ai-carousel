-- FIX: ambiguous user_id in grant_free_trial_once

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