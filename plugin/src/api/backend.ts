import type { CarouselBranding } from "../types/branding";
import type { CarouselResponse } from "../types/carousel";

type GenerateCarouselInput = {
  prompt: string;
  cards: number;
  branding: CarouselBranding;
  userEmail: string;
};

type ErrorResponse = {
  error: string;
};

export type CreditsResponse = {
  email: string;
  credits: number;
};

export type PurchasePackageId = "starter" | "pro" | "studio";

export type PurchaseCreditsResponse = {
  email: string;
  credits: number;
  purchasedCredits: number;
  packageId: PurchasePackageId;
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

export type TransactionsResponse = {
  email: string;
  transactions: CreditTransaction[];
};

export async function requestCarousel(
  input: GenerateCarouselInput
): Promise<CarouselResponse | ErrorResponse> {
  const response = await fetch("http://localhost:3001/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const rawText = await response.text();
  const data = JSON.parse(rawText) as CarouselResponse | ErrorResponse;

  if (!response.ok) {
    if ("error" in data) {
      return data;
    }

    throw new Error(`Backend retornou ${response.status}: ${rawText}`);
  }

  if ("error" in data) {
    return data;
  }

  if (!data.cards || !Array.isArray(data.cards) || data.cards.length === 0) {
    throw new Error("Backend não retornou cards válidos.");
  }

  return data;
}

export async function requestCredits(userEmail: string): Promise<CreditsResponse> {
  const response = await fetch(
    `http://localhost:3001/credits?userEmail=${encodeURIComponent(userEmail)}`
  );

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Backend retornou ${response.status}: ${rawText}`);
  }

  return JSON.parse(rawText) as CreditsResponse;
}

export async function requestPurchaseCredits(input: {
  userEmail: string;
  packageId: PurchasePackageId;
}): Promise<PurchaseCreditsResponse> {
  const response = await fetch("http://localhost:3001/credits/purchase", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Backend retornou ${response.status}: ${rawText}`);
  }

  return JSON.parse(rawText) as PurchaseCreditsResponse;
}

export async function requestTransactions(
  userEmail: string
): Promise<TransactionsResponse> {
  const response = await fetch(
    `http://localhost:3001/credits/transactions?userEmail=${encodeURIComponent(userEmail)}`
  );

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Backend retornou ${response.status}: ${rawText}`);
  }

  return JSON.parse(rawText) as TransactionsResponse;
}