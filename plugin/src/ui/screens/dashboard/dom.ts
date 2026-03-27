export function getDashboardDom() {
  return {
    promptEl: document.getElementById("prompt") as HTMLTextAreaElement | null,
    generateButton: document.getElementById("generate") as HTMLButtonElement | null,
    statusCard: document.getElementById("statusCard") as HTMLDivElement | null,
    statusText: document.getElementById("statusText") as HTMLDivElement | null,
    cardsGrid: document.getElementById("cardsGrid") as HTMLDivElement | null,

    seriesNameEl: document.getElementById("seriesName") as HTMLInputElement | null,
    profileHandleEl: document.getElementById("profileHandle") as HTMLInputElement | null,
    primaryColorEl: document.getElementById("primaryColor") as HTMLInputElement | null,
    templateEl: document.getElementById("template") as HTMLSelectElement | null,
    ctaLabelEl: document.getElementById("ctaLabel") as HTMLInputElement | null,

    openPaywallButton: document.getElementById("openPaywall") as HTMLButtonElement | null,
    openTransactionsButton: document.getElementById("openTransactions") as HTMLButtonElement | null,
    changeFormatButton: document.getElementById("changeFormatButton") as HTMLButtonElement | null,

    cardsOptions: Array.from(
      document.querySelectorAll<HTMLButtonElement>(".cards-option")
    ),

    quickPromptButtons: Array.from(
      document.querySelectorAll<HTMLButtonElement>(".chip-button")
    ),
  };
}