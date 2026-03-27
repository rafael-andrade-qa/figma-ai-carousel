import {
  buildBranding,
  buildGenerateCarouselMessage,
  getCreditsCost,
  getGenerateButtonLabel,
  getSelectedFormat,
  validatePrompt,
} from "./helpers";

import { bindDashboardPluginMessages } from "./messages";
import { getDashboardDom } from "./dom";
import { getState } from "../../state";

export function bindDashboardScreen(actions: {
  credits: number;
  email: string;
  onOpenPaywall: () => void;
  onOpenTransactions: () => void;
  onSuccessfulGeneration: (creditsUsed: number) => void | Promise<void>;
  onChangeFormat: () => void;
}) {
  const dom = getDashboardDom();

  const {
    promptEl,
    generateButton,
    statusCard,
    statusText,
    cardsGrid,
    seriesNameEl,
    profileHandleEl,
    primaryColorEl,
    templateEl,
    ctaLabelEl,
    openPaywallFromToolbarButton,
    openTransactionsFromToolbarButton,
    changeFormatButton,
    cardsOptions,
    quickPromptButtons,
    generationSummaryEl,
    brandingSummaryEl,
    slidesSummaryEl,
    accordionTriggers,
    accordionSections,
  } = dom;

  let selectedCards = 5;
  let pendingCreditsCost = 0;

  function setStatus(
    message: string,
    type: "default" | "success" | "error" = "default"
  ) {
    if (!statusCard || !statusText) {
      return;
    }

    statusText.textContent = message;
    statusCard.classList.remove("success", "error");

    if (type === "success") {
      statusCard.classList.add("success");
    }

    if (type === "error") {
      statusCard.classList.add("error");
    }
  }

  function setLoading(isLoading: boolean) {
    if (!generateButton) {
      return;
    }

    generateButton.disabled = isLoading;
    generateButton.textContent = isLoading ? "Gerando..." : getGenerateButtonLabel();
  }

  function getCardsLabel(cards: number) {
    return `${cards} ${cards === 1 ? "slide" : "slides"}`;
  }

  function getCreditsLabel(credits: number) {
    return `${credits} ${credits === 1 ? "crédito" : "créditos"}`;
  }

  function updateSlidesSummary() {
    const creditsCost = getCreditsCost(selectedCards);
    const summary = `${getCardsLabel(selectedCards)} • ${getCreditsLabel(creditsCost)}`;

    generationSummaryEl && (generationSummaryEl.textContent = summary);
    slidesSummaryEl && (slidesSummaryEl.textContent = summary);
  }

  function updateBrandingSummary() {
    if (!brandingSummaryEl) {
      return;
    }

    const templateLabel = templateEl?.selectedOptions?.[0]?.textContent?.trim() || "Educational";
    const primaryColor = primaryColorEl?.value?.trim() || "#2E7BFF";
    const profileHandle = profileHandleEl?.value?.trim() || "@seuperfil";

    brandingSummaryEl.textContent = `${templateLabel} • ${primaryColor} • ${profileHandle}`;
  }

  function toggleAccordion(name: string) {
    const section = accordionSections.find(
      (item) => item.dataset.accordion === name
    );

    if (!section) {
      return;
    }

    const content = section.querySelector<HTMLElement>("[data-accordion-content]");
    const trigger = section.querySelector<HTMLButtonElement>("[data-accordion-trigger]");
    const isOpen = section.classList.contains("is-open");
    const nextIsOpen = !isOpen;

    section.classList.toggle("is-open", nextIsOpen);

    if (content) {
      content.hidden = !nextIsOpen;
    }

    if (trigger) {
      trigger.setAttribute("aria-expanded", String(nextIsOpen));
    }
  }

  function bindAccordions() {
    accordionTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const target = trigger.dataset.accordionTrigger;
        if (!target) {
          return;
        }

        toggleAccordion(target);
      });
    });
  }

  function setCards(value: number) {
    selectedCards = value;

    cardsOptions.forEach((button) => {
      const buttonValue = Number(button.dataset.value);
      button.classList.toggle("active", buttonValue === selectedCards);
    });

    updateSlidesSummary();
  }

  function postGenerateMessage() {
    const selectedFormat = getSelectedFormat();

    if (selectedFormat !== "carousel") {
      setStatus("Esse formato entra em breve. Use Carrossel por enquanto.", "error");
      return;
    }

    const prompt = promptEl?.value.trim() || "";

    if (!validatePrompt(prompt)) {
      setStatus("Digite um briefing antes de gerar o carrossel.", "error");
      promptEl?.focus();
      return;
    }

    const creditsCost = getCreditsCost(selectedCards);

    if (actions.credits < creditsCost) {
      setStatus("Você não tem créditos suficientes para essa geração.", "error");
      actions.onOpenPaywall();
      return;
    }

    const accessToken = getState().session?.accessToken;

    if (!accessToken) {
      setStatus("Sessão inválida. Faça login novamente.", "error");
      return;
    }

    const message = buildGenerateCarouselMessage({
      prompt,
      cards: selectedCards,
      branding: buildBranding({
        seriesName: seriesNameEl?.value,
        profileHandle: profileHandleEl?.value,
        primaryColor: primaryColorEl?.value,
        template: templateEl?.value,
        ctaLabel: ctaLabelEl?.value,
      }),
      accessToken,
    });

    pendingCreditsCost = creditsCost;
    setLoading(true);
    setStatus(
      `Gerando ${getCardsLabel(selectedCards)} com custo de ${getCreditsLabel(creditsCost)}...`
    );

    parent.postMessage({ pluginMessage: message }, "*");
  }

  function bindCardsGrid() {
    cardsOptions.forEach((button) => {
      button.addEventListener("click", () => {
        const value = Number(button.dataset.value);

        if (!Number.isFinite(value)) {
          return;
        }

        setCards(value);
        setStatus(
          `${getCardsLabel(value)} selecionados. Essa geração consome ${getCreditsLabel(
            getCreditsCost(value)
          )}.`
        );
      });
    });
  }

  function bindQuickPrompts() {
    quickPromptButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (!promptEl) {
          return;
        }

        const chipValue = button.dataset.prompt?.trim();

        if (!chipValue) {
          return;
        }

        const currentPrompt = promptEl.value.trim();

        promptEl.value = currentPrompt
          ? `${currentPrompt} ${chipValue}`
          : chipValue;

        promptEl.focus();
        setStatus(`Sugestão "${chipValue}" adicionada ao briefing.`);
      });
    });
  }

  function bindGenerateButton() {
    if (!generateButton) {
      return;
    }

    generateButton.addEventListener("click", () => {
      postGenerateMessage();
    });
  }

  function bindBrandingFields() {
    [
      seriesNameEl,
      profileHandleEl,
      primaryColorEl,
      templateEl,
      ctaLabelEl,
    ].forEach((field) => {
      field?.addEventListener("input", updateBrandingSummary);
      field?.addEventListener("change", updateBrandingSummary);
    });
  }

  function bindPluginMessages() {
    bindDashboardPluginMessages({
      onStatus: (message) => {
        setStatus(message);
      },
      onError: (message) => {
        setLoading(false);

        if (message === "NO_CREDITS") {
          setStatus("Você ficou sem créditos.", "error");
          pendingCreditsCost = 0;
          actions.onOpenPaywall();
          return;
        }

        setStatus(message, "error");
        pendingCreditsCost = 0;
      },
      onSuccess: (message, creditsUsed) => {
        setLoading(false);
        setStatus(message, "success");

        const resolvedCreditsUsed = creditsUsed ?? pendingCreditsCost;

        if (resolvedCreditsUsed > 0) {
          void Promise.resolve(actions.onSuccessfulGeneration(resolvedCreditsUsed));
          pendingCreditsCost = 0;
        }
      },
    });
  }

  if (
    !promptEl ||
    !generateButton ||
    !statusCard ||
    !statusText ||
    !cardsGrid ||
    !seriesNameEl ||
    !profileHandleEl ||
    !primaryColorEl ||
    !templateEl ||
    !ctaLabelEl
  ) {
    console.error("[UI] Elementos obrigatórios não encontrados no DOM.");
    return;
  }

  changeFormatButton?.addEventListener("click", actions.onChangeFormat);
  openPaywallFromToolbarButton?.addEventListener("click", actions.onOpenPaywall);
  openTransactionsFromToolbarButton?.addEventListener("click", actions.onOpenTransactions);

  setCards(selectedCards);
  updateBrandingSummary();
  bindAccordions();
  bindCardsGrid();
  bindQuickPrompts();
  bindGenerateButton();
  bindBrandingFields();
  bindPluginMessages();
  setStatus("Aguardando briefing para iniciar a geração.");
}