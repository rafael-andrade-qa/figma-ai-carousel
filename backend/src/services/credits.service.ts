type UserCredits = {
  email: string;
  credits: number;
};

export type CreditTransactionType =
  | "free_trial"
  | "purchase"
  | "usage"
  | "refund";

export type CreditTransaction = {
  id: string;
  email: string;
  type: CreditTransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
};

const usersCredits = new Map<string, UserCredits>();
const usersTransactions = new Map<string, CreditTransaction[]>();

const FREE_CREDITS_ON_FIRST_USE = 5;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createTransaction(input: {
  email: string;
  type: CreditTransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
}): CreditTransaction {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    email: input.email,
    type: input.type,
    amount: input.amount,
    balanceAfter: input.balanceAfter,
    description: input.description,
    createdAt: new Date().toISOString(),
  };
}

function appendTransaction(input: {
  email: string;
  type: CreditTransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
}) {
  const normalizedEmail = normalizeEmail(input.email);
  const current = usersTransactions.get(normalizedEmail) ?? [];

  const transaction = createTransaction({
    ...input,
    email: normalizedEmail,
  });

  current.unshift(transaction);
  usersTransactions.set(normalizedEmail, current);

  return transaction;
}

export function getCreditsCost(cards: number) {
  if (cards === 7) return 2;
  return 1;
}

export function ensureUserCredits(email: string) {
  const normalizedEmail = normalizeEmail(email);

  if (!usersCredits.has(normalizedEmail)) {
    usersCredits.set(normalizedEmail, {
      email: normalizedEmail,
      credits: FREE_CREDITS_ON_FIRST_USE,
    });

    appendTransaction({
      email: normalizedEmail,
      type: "free_trial",
      amount: FREE_CREDITS_ON_FIRST_USE,
      balanceAfter: FREE_CREDITS_ON_FIRST_USE,
      description: "Créditos grátis de boas-vindas",
    });
  }

  return usersCredits.get(normalizedEmail)!;
}

export function getUserCredits(email: string) {
  return ensureUserCredits(email);
}

export function getUserTransactions(email: string) {
  const user = ensureUserCredits(email);
  return usersTransactions.get(user.email) ?? [];
}

export function hasEnoughCredits(email: string, cards: number) {
  const user = ensureUserCredits(email);
  const cost = getCreditsCost(cards);

  return user.credits >= cost;
}

export function consumeUserCredits(email: string, cards: number) {
  const user = ensureUserCredits(email);
  const cost = getCreditsCost(cards);

  if (user.credits < cost) {
    return {
      ok: false as const,
      error: "NO_CREDITS" as const,
    };
  }

  user.credits -= cost;

  appendTransaction({
    email: user.email,
    type: "usage",
    amount: -cost,
    balanceAfter: user.credits,
    description: `Consumo de créditos para geração de carrossel com ${cards} cards`,
  });

  return {
    ok: true as const,
    creditsUsed: cost,
    creditsLeft: user.credits,
  };
}

export function refundUserCredits(email: string, amount: number) {
  const user = ensureUserCredits(email);
  user.credits += amount;

  appendTransaction({
    email: user.email,
    type: "refund",
    amount,
    balanceAfter: user.credits,
    description: "Estorno de créditos por falha na geração",
  });

  return user;
}

export function addUserCredits(email: string, amount: number, description?: string) {
  const user = ensureUserCredits(email);
  user.credits += amount;

  appendTransaction({
    email: user.email,
    type: "purchase",
    amount,
    balanceAfter: user.credits,
    description: description ?? "Compra de créditos",
  });

  return user;
}