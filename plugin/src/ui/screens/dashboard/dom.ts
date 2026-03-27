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
    primaryColorPickerEl: document.getElementById(
      "primaryColorPicker"
    ) as HTMLInputElement | null,
    templateEl: document.getElementById("template") as HTMLSelectElement | null,
    ctaLabelEl: document.getElementById("ctaLabel") as HTMLInputElement | null,

    openPaywallFromToolbarButton: document.getElementById(
      "openPaywallFromToolbar"
    ) as HTMLButtonElement | null,
    openTransactionsFromToolbarButton: document.getElementById(
      "openTransactionsFromToolbar"
    ) as HTMLButtonElement | null,
    changeFormatButton: document.getElementById("changeFormatButton") as HTMLButtonElement | null,

    generationSummaryEl: document.getElementById("generationSummary") as HTMLDivElement | null,
    brandingSummaryEl: document.getElementById("brandingSummary") as HTMLDivElement | null,
    slidesSummaryEl: document.getElementById("slidesSummary") as HTMLDivElement | null,

    cardsOptions: Array.from(
      document.querySelectorAll<HTMLButtonElement>(".cards-option")
    ),

    quickPromptButtons: Array.from(
      document.querySelectorAll<HTMLButtonElement>(".chip-button")
    ),

    accordionTriggers: Array.from(
      document.querySelectorAll<HTMLButtonElement>("[data-accordion-trigger]")
    ),

    accordionSections: Array.from(
      document.querySelectorAll<HTMLElement>(".accordion-section")
    ),
  };
}