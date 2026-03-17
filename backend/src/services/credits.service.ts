type UserCredits = {
  email: string;
  credits: number;
};

const usersCredits = new Map<string, UserCredits>();

const FREE_CREDITS_ON_FIRST_USE = 5;

export function getCreditsCost(cards: number) {
  if (cards === 7) return 2;
  return 1;
}

export function ensureUserCredits(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!usersCredits.has(normalizedEmail)) {
    usersCredits.set(normalizedEmail, {
      email: normalizedEmail,
      credits: FREE_CREDITS_ON_FIRST_USE,
    });
  }

  return usersCredits.get(normalizedEmail)!;
}

export function getUserCredits(email: string) {
  return ensureUserCredits(email);
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

  return {
    ok: true as const,
    creditsUsed: cost,
    creditsLeft: user.credits,
  };
}

export function refundUserCredits(email: string, amount: number) {
  const user = ensureUserCredits(email);
  user.credits += amount;

  return user;
}

export function addUserCredits(email: string, amount: number) {
  const user = ensureUserCredits(email);
  user.credits += amount;
  return user;
}
