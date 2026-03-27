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
    openPaywallButton,
    openTransactionsButton,
    changeFormatButton,
    cardsOptions,
    quickPromptButtons,
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

  function setCards(value: number) {
    selectedCards = value;

    cardsOptions.forEach((button) => {
      const buttonValue = Number(button.dataset.value);
      button.classList.toggle("active", buttonValue === selectedCards);
    });
  }

  function postGenerateMessage() {
    const selectedFormat = getSelectedFormat();

    if (selectedFormat !== "carousel") {
      setStatus("Esse formato entra em breve. Use Carrossel por enquanto.", "error");
      return;
    }

    const prompt = promptEl?.value.trim() || "";

    if (!validatePrompt(prompt)) {
      setStatus("Digite um prompt antes de gerar o carrossel.", "error");
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
    setStatus("Enviando briefing para o plugin...");

    parent.postMessage(
      {
        pluginMessage: message,
      },
      "*"
    );
  }

  function bindCardsGrid() {
    if (!cardsGrid) {
      return;
    }

    cardsGrid.addEventListener("click", (event) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest(".cards-option") as HTMLButtonElement | null;

      if (!button) {
        return;
      }

      const value = Number(button.dataset.value);

      if (!Number.isFinite(value)) {
        return;
      }

      setCards(value);

      const cost = getCreditsCost(value);

      setStatus(
        `Essa geração vai consumir ${cost} crédito${cost > 1 ? "s" : ""}.`
      );
    });
  }

  function bindQuickPrompts() {
    quickPromptButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (!promptEl) {
          return;
        }

        const chipValue = button.dataset.chipValue || "";
        const currentPrompt = promptEl.value.trim();

        promptEl.value = currentPrompt
          ? `${currentPrompt} ${chipValue}`
          : chipValue;

        promptEl.focus();
        setStatus(`Sugestão "${chipValue}" adicionada ao prompt.`);
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
  openPaywallButton?.addEventListener("click", actions.onOpenPaywall);
  openTransactionsButton?.addEventListener("click", actions.onOpenTransactions);

  setCards(selectedCards);
  bindCardsGrid();
  bindQuickPrompts();
  bindGenerateButton();
  bindPluginMessages();
  setStatus("Aguardando briefing para iniciar a geração.");
}