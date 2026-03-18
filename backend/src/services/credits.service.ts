import { supabaseAdmin } from "../lib/supabase";

type UserCreditsRow = {
  id: string;
  email: string;
  credits: number;
};

export type UserCredits = {
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

type ApplyCreditTransactionByUserIdRow = {
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

async function getUserCreditsRowById(userId: string): Promise<UserCreditsRow> {
  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("id, email")
    .eq("id", userId)
    .maybeSingle();

  if (userError) {
    throw new Error(`Erro ao buscar usuário por id: ${userError.message}`);
  }

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const { data: account, error: accountError } = await supabaseAdmin
    .from("credit_accounts")
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (accountError) {
    throw new Error(
      `Erro ao buscar conta de créditos por userId: ${accountError.message}`
    );
  }

  return {
    id: user.id,
    email: user.email,
    credits: account?.balance ?? 0,
  };
}

async function ensureCreditAccountExistsByUserId(userId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("credit_accounts")
    .insert({
      user_id: userId,
      balance: 0,
    });

  if (error) {
    const message = error.message.toLowerCase();

    const isDuplicate =
      message.includes("duplicate key") ||
      message.includes("unique constraint") ||
      message.includes("already exists");

    if (isDuplicate) {
      return;
    }

    throw new Error(
      `Erro ao garantir conta de crédito por userId: ${error.message}`
    );
  }
}

async function grantFreeTrialOnceByUserId(
  userId: string,
  amount = 5
): Promise<void> {
  const { data: existingTransaction, error: existingError } = await supabaseAdmin
    .from("credit_transactions")
    .select("id")
    .eq("user_id", userId)
    .eq("type", "free_trial")
    .maybeSingle();

  if (existingError) {
    throw new Error(
      `Erro ao verificar free trial do usuário: ${existingError.message}`
    );
  }

  if (existingTransaction) {
    return;
  }

  await applyCreditTransactionByUserId({
    userId,
    type: "free_trial",
    amount,
    description: "Free trial credits granted",
    sourceType: "system",
    sourceId: "free_trial",
    metadata: {
      reason: "initial_trial",
    },
  });
}

async function applyCreditTransactionByUserId(input: {
  userId: string;
  type: CreditTransactionType;
  amount: number;
  description?: string;
  sourceType?: string;
  sourceId?: string;
  metadata?: Record<string, unknown>;
}): Promise<CreditTransaction> {
  const { data, error } = await supabaseAdmin.rpc(
    "apply_credit_transaction_by_user_id",
    {
      p_user_id: input.userId,
      p_type: input.type,
      p_amount: input.amount,
      p_description: input.description ?? null,
      p_source_type: input.sourceType ?? null,
      p_source_id: input.sourceId ?? null,
      p_metadata: input.metadata ?? {},
    }
  );

  if (error) {
    if (
      error.message.toLowerCase().includes("insufficient credits") ||
      error.message.toLowerCase().includes("saldo insuficiente")
    ) {
      throw new Error("NO_CREDITS");
    }

    if (error.message.toLowerCase().includes("user not found")) {
      throw new Error("USER_NOT_FOUND");
    }

    throw new Error(
      `Erro ao aplicar transação de crédito por userId: ${error.message}`
    );
  }

  const row = (data?.[0] ?? null) as ApplyCreditTransactionByUserIdRow | null;

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

export async function ensureUserCreditsByUserId(
  userId: string
): Promise<UserCredits> {
  await ensureCreditAccountExistsByUserId(userId);
  await grantFreeTrialOnceByUserId(userId, 5);

  return getUserCreditsRowById(userId);
}

export async function getUserCreditsByUserId(
  userId: string
): Promise<UserCredits> {
  return ensureUserCreditsByUserId(userId);
}

export async function getUserTransactionsByUserId(
  userId: string
): Promise<CreditTransaction[]> {
  const user = await ensureUserCreditsByUserId(userId);

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

export async function hasEnoughCreditsByUserId(
  userId: string,
  cards: number
): Promise<boolean> {
  const user = await ensureUserCreditsByUserId(userId);
  const cost = getCreditsCost(cards);

  return user.credits >= cost;
}

export async function consumeUserCreditsByUserId(
  userId: string,
  cards: number,
  options?: {
    sourceType?: string;
    sourceId?: string;
    metadata?: Record<string, unknown>;
    description?: string;
  }
) {
  const user = await ensureUserCreditsByUserId(userId);
  const cost = getCreditsCost(cards);

  if (user.credits < cost) {
    return {
      ok: false as const,
      error: "NO_CREDITS" as const,
    };
  }

  try {
    const transaction = await applyCreditTransactionByUserId({
      userId: user.id,
      type: "usage",
      amount: -cost,
      description:
        options?.description ??
        `Consumo de créditos para geração de carrossel com ${cards} cards`,
      sourceType: options?.sourceType ?? "generation",
      sourceId: options?.sourceId ?? `generate-${Date.now()}`,
      metadata: {
        cards,
        cost,
        ...(options?.metadata ?? {}),
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

export async function refundUserCreditsByUserId(
  userId: string,
  amount: number,
  options?: {
    sourceType?: string;
    sourceId?: string;
    metadata?: Record<string, unknown>;
    description?: string;
  }
) {
  if (amount <= 0) {
    throw new Error("Refund amount must be greater than zero");
  }

  const user = await ensureUserCreditsByUserId(userId);

  const transaction = await applyCreditTransactionByUserId({
    userId: user.id,
    type: "refund",
    amount,
    description:
      options?.description ?? "Estorno de créditos por falha na geração",
    sourceType: options?.sourceType ?? "generation_refund",
    sourceId: options?.sourceId ?? `refund-${Date.now()}`,
    metadata: {
      refundedAmount: amount,
      ...(options?.metadata ?? {}),
    },
  });

  return {
    email: transaction.email,
    credits: transaction.balanceAfter,
  };
}

export async function addUserCreditsByUserId(
  userId: string,
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

  const user = await ensureUserCreditsByUserId(userId);

  const transaction = await applyCreditTransactionByUserId({
    userId: user.id,
    type: "purchase",
    amount,
    description: description ?? "Compra de créditos",
    sourceType: options?.sourceType ?? "purchase_manual",
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