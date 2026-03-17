export const CREDIT_PACKAGES = {
  starter: {
    id: "starter",
    label: "Pacote Starter",
    credits: 20,
    amountCents: 2900,
    currency: "brl",
  },
  pro: {
    id: "pro",
    label: "Pacote Pro",
    credits: 60,
    amountCents: 6900,
    currency: "brl",
  },
  studio: {
    id: "studio",
    label: "Pacote Studio",
    credits: 150,
    amountCents: 14900,
    currency: "brl",
  },
} as const;

export type CreditPackageId = keyof typeof CREDIT_PACKAGES;

export function isValidCreditPackageId(value: string): value is CreditPackageId {
  return value in CREDIT_PACKAGES;
}

export function getCreditPackage(packageId: string) {
  if (!isValidCreditPackageId(packageId)) {
    return null;
  }

  return CREDIT_PACKAGES[packageId];
}

export function listCreditPackages() {
  return Object.values(CREDIT_PACKAGES);
}