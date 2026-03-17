import type { CarouselBranding } from "../types/branding";
import type { CarouselResponse } from "../types/carousel";

type ErrorResponse = {
  error: string;
  detail?: string;
};

const BACKEND_URL = "http://localhost:3001";

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

export type TransactionsResponse = {
  email: string;
  transactions: CreditTransaction[];
};

export type CreateCheckoutSessionResponse = {
  checkoutUrl: string;
  checkoutSessionId: string;
  localCheckoutSessionId: string;
  package: {
    id: PurchasePackageId;
    label: string;
    credits: number;
    amountCents: number;
    currency: string;
  };
};

type GenerateCarouselInput = {
  prompt: string;
  cards: number;
  branding: CarouselBranding;
  accessToken: string;
};

async function authorizedFetch(
  input: string,
  accessToken: string,
  init?: RequestInit
) {
  const headers = new Headers(init?.headers ?? {});
  headers.set("Authorization", `Bearer ${accessToken}`);

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  const rawText = await response.text();

  if (!response.ok) {
    let parsed: ErrorResponse | null = null;

    try {
      parsed = JSON.parse(rawText) as ErrorResponse;
    } catch {
      parsed = null;
    }

    const detail = parsed?.detail ? ` - ${parsed.detail}` : "";
    const message = parsed?.error ?? rawText ?? "Erro desconhecido";

    throw new Error(`Backend retornou ${response.status}: ${message}${detail}`);
  }

  return rawText;
}

export async function requestCarousel(
  input: GenerateCarouselInput
): Promise<CarouselResponse> {
  const rawText = await authorizedFetch(`${BACKEND_URL}/generate`, input.accessToken, {
    method: "POST",
    body: JSON.stringify({
      prompt: input.prompt,
      cards: input.cards,
      branding: input.branding,
    }),
  });

  const data = JSON.parse(rawText) as CarouselResponse;

  if (!Array.isArray(data.cards) || data.cards.length === 0) {
    throw new Error("Backend não retornou cards válidos.");
  }

  return data;
}

export async function requestCredits(
  accessToken: string
): Promise<CreditsResponse> {
  const rawText = await authorizedFetch(`${BACKEND_URL}/credits`, accessToken);

  return JSON.parse(rawText) as CreditsResponse;
}

export async function requestPurchaseCredits(input: {
  accessToken: string;
  packageId: PurchasePackageId;
}): Promise<PurchaseCreditsResponse> {
  const rawText = await authorizedFetch(
    `${BACKEND_URL}/credits/purchase`,
    input.accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        packageId: input.packageId,
      }),
    }
  );

  return JSON.parse(rawText) as PurchaseCreditsResponse;
}

export async function requestCreateCheckoutSession(input: {
  accessToken: string;
  packageId: PurchasePackageId;
}): Promise<CreateCheckoutSessionResponse> {
  const rawText = await authorizedFetch(
    `${BACKEND_URL}/billing/checkout-sessions`,
    input.accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        packageId: input.packageId,
      }),
    }
  );

  return JSON.parse(rawText) as CreateCheckoutSessionResponse;
}

export async function requestTransactions(
  accessToken: string
): Promise<TransactionsResponse> {
  const rawText = await authorizedFetch(
    `${BACKEND_URL}/credits/transactions`,
    accessToken
  );

  return JSON.parse(rawText) as TransactionsResponse;
}