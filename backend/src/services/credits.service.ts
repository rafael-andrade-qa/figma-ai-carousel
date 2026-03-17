import { supabaseAdmin } from "../lib/supabase";

type UserCredits = {
  id: string;
  email: string;
  credits: number;
};

export type CreditTransactionType =
  | "free_trial"
  | "purchase"
  | "usage"
  | "refund"
  | "manual_adjustment";

export type CreditTransaction = {
  id: string;
  email: string;
  type: CreditTransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
};

type EnsureUserCreditAccountRow = {
  out_user_id: string;
  out_email: string;
  out_balance: number;
};

type ApplyCreditTransactionRow = {
  out_transaction_id: string;
  out_user_id: string;
  out_email: string;
  out_type: CreditTransactionType;
  out_amount: number;
  out_balance_before: number;
  out_balance_after: number;
  out_description: string | null;
  out_source_type: string | null;
  out_source_id: string | null;
  out_metadata: Record<string, unknown> | null;
  out_created_at: string;
};

type CreditTransactionRow = {
  id: string;
  type: CreditTransactionType;
  amount: number;
  balance_after: number;
  description: string | null;
  created_at: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function mapUserCredits(row: EnsureUserCreditAccountRow): UserCredits {
  return {
    id: row.out_user_id,
    email: row.out_email,
    credits: row.out_balance,
  };
}

function mapTransaction(row: {
  id: string;
  email: string;
  type: CreditTransactionType;
  amount: number;
  balance_after: number;
  description: string | null;
  created_at: string;
}): CreditTransaction {
  return {
    id: row.id,
    email: row.email,
    type: row.type,
    amount: row.amount,
    balanceAfter: row.balance_after,
    description: row.description ?? "",
    createdAt: row.created_at,
  };
}

async function ensureUserCreditAccount(email: string): Promise<UserCredits> {
  const normalizedEmail = normalizeEmail(email);

  const { data, error } = await supabaseAdmin.rpc("ensure_user_credit_account", {
    p_email: normalizedEmail,
  });

  if (error) {
    throw new Error(
      `Erro ao garantir conta de crédito do usuário: ${error.message}`
    );
  }

  const row = (data?.[0] ?? null) as EnsureUserCreditAccountRow | null;

  if (!row) {
    throw new Error("Não foi possível carregar a conta de créditos do usuário.");
  }

  return mapUserCredits(row);
}

async function applyCreditTransaction(input: {
  email: string;
  type: CreditTransactionType;
  amount: number;
  description?: string;
  sourceType?: string;
  sourceId?: string;
  metadata?: Record<string, unknown>;
}): Promise<CreditTransaction> {
  const normalizedEmail = normalizeEmail(input.email);

  const { data, error } = await supabaseAdmin.rpc("apply_credit_transaction", {
    p_email: normalizedEmail,
    p_type: input.type,
    p_amount: input.amount,
    p_description: input.description ?? null,
    p_source_type: input.sourceType ?? null,
    p_source_id: input.sourceId ?? null,
    p_metadata: input.metadata ?? {},
  });

  if (error) {
    if (
      error.message.toLowerCase().includes("insufficient credits") ||
      error.message.toLowerCase().includes("saldo insuficiente")
    ) {
      throw new Error("NO_CREDITS");
    }

    throw new Error(`Erro ao aplicar transação de crédito: ${error.message}`);
  }

  const row = (data?.[0] ?? null) as ApplyCreditTransactionRow | null;

  if (!row) {
    throw new Error("A transação de crédito não retornou dados.");
  }

  return mapTransaction({
    id: row.out_transaction_id,
    email: row.out_email,
    type: row.out_type,
    amount: row.out_amount,
    balance_after: row.out_balance_after,
    description: row.out_description,
    created_at: row.out_created_at,
  });
}

export function getCreditsCost(cards: number) {
  if (cards === 7) return 2;
  return 1;
}

export async function ensureUserCredits(email: string): Promise<UserCredits> {
  const normalizedEmail = normalizeEmail(email);

  const { error: grantError } = await supabaseAdmin.rpc("grant_free_trial_once", {
    p_email: normalizedEmail,
    p_amount: 5,
  });

  if (grantError) {
    throw new Error(`Erro ao conceder free trial: ${grantError.message}`);
  }

  return ensureUserCreditAccount(normalizedEmail);
}

export async function getUserCredits(email: string): Promise<UserCredits> {
  return ensureUserCredits(email);
}

export async function getUserTransactions(
  email: string
): Promise<CreditTransaction[]> {
  const user = await ensureUserCredits(email);

  const { data, error } = await supabaseAdmin
    .from("credit_transactions")
    .select("id, type, amount, balance_after, description, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Erro ao buscar transações: ${error.message}`);
  }

  const rows = (data ?? []) as CreditTransactionRow[];

  return rows.map((row) =>
    mapTransaction({
      ...row,
      email: user.email,
    })
  );
}

export async function hasEnoughCredits(
  email: string,
  cards: number
): Promise<boolean> {
  const user = await ensureUserCredits(email);
  const cost = getCreditsCost(cards);

  return user.credits >= cost;
}

export async function consumeUserCredits(email: string, cards: number) {
  const user = await ensureUserCredits(email);
  const cost = getCreditsCost(cards);

  if (user.credits < cost) {
    return {
      ok: false as const,
      error: "NO_CREDITS" as const,
    };
  }

  try {
    const transaction = await applyCreditTransaction({
      email: user.email,
      type: "usage",
      amount: -cost,
      description: `Consumo de créditos para geração de carrossel com ${cards} cards`,
      sourceType: "generation",
      sourceId: `generate-${Date.now()}`,
      metadata: {
        cards,
        cost,
      },
    });

    return {
      ok: true as const,
      creditsUsed: cost,
      creditsLeft: transaction.balanceAfter,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "NO_CREDITS") {
      return {
        ok: false as const,
        error: "NO_CREDITS" as const,
      };
    }

    throw error;
  }
}

export async function refundUserCredits(email: string, amount: number) {
  if (amount <= 0) {
    throw new Error("Refund amount must be greater than zero");
  }

  await ensureUserCredits(email);

  const transaction = await applyCreditTransaction({
    email,
    type: "refund",
    amount,
    description: "Estorno de créditos por falha na geração",
    sourceType: "generation_refund",
    sourceId: `refund-${Date.now()}`,
    metadata: {
      refundedAmount: amount,
    },
  });

  return {
    email: transaction.email,
    credits: transaction.balanceAfter,
  };
}

export async function addUserCredits(
  email: string,
  amount: number,
  description?: string,
  options?: {
    sourceType?: string;
    sourceId?: string;
    metadata?: Record<string, unknown>;
  }
) {
  if (amount <= 0) {
    throw new Error("Purchase amount must be greater than zero");
  }

  await ensureUserCredits(email);

  const transaction = await applyCreditTransaction({
    email,
    type: "purchase",
    amount,
    description: description ?? "Compra de créditos",
    sourceType: options?.sourceType ?? "purchase_mock",
    sourceId: options?.sourceId ?? `purchase-${Date.now()}`,
    metadata: options?.metadata ?? {
      purchasedAmount: amount,
    },
  });

  return {
    email: transaction.email,
    credits: transaction.balanceAfter,
  };
}