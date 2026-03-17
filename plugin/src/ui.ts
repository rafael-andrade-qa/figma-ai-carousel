import type { CarouselBranding, CarouselTemplate } from "./types/branding";
import type { GenerateCarouselMessage, PluginToUiMessage } from "./types/messages";

const promptEl = document.getElementById("prompt") as HTMLTextAreaElement | null;
const generateButton = document.getElementById("generate") as HTMLButtonElement | null;
const statusCard = document.getElementById("statusCard") as HTMLDivElement | null;
const statusText = document.getElementById("statusText") as HTMLDivElement | null;
const cardsGrid = document.getElementById("cardsGrid") as HTMLDivElement | null;

const seriesNameEl = document.getElementById("seriesName") as HTMLInputElement | null;
const profileHandleEl = document.getElementById("profileHandle") as HTMLInputElement | null;
const primaryColorEl = document.getElementById("primaryColor") as HTMLInputElement | null;
const templateEl = document.getElementById("template") as HTMLSelectElement | null;
const ctaLabelEl = document.getElementById("ctaLabel") as HTMLInputElement | null;

const cardsOptions = Array.from(
  document.querySelectorAll<HTMLButtonElement>(".cards-option")
);

const quickPromptButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>(".chip")
);

let selectedCards = 5;

function setStatus(
  message: string,
  type: "default" | "success" | "error" = "default"
) {
  if (!statusCard || !statusText) return;

  statusText.textContent = message;
  statusCard.classList.remove("success", "error");

  if (type === "success") statusCard.classList.add("success");
  if (type === "error") statusCard.classList.add("error");
}

function setLoading(isLoading: boolean) {
  if (!generateButton) return;

  generateButton.disabled = isLoading;
  generateButton.textContent = isLoading ? "Gerando..." : "Gerar carrossel";
}

function setCards(value: number) {
  selectedCards = value;

  cardsOptions.forEach((button) => {
    const buttonValue = Number(button.dataset.value);
    button.classList.toggle("active", buttonValue === selectedCards);
  });
}

function getBranding(): CarouselBranding {
  return {
    seriesName: seriesNameEl?.value.trim() || "Nome da Série",
    profileHandle: profileHandleEl?.value.trim() || "@seuperfil",
    primaryColor: primaryColorEl?.value.trim() || "#2E7BFF",
    template: (templateEl?.value as CarouselTemplate) || "educational",
    ctaLabel: ctaLabelEl?.value.trim() || "Agende sua consulta",
  };
}

function validatePrompt(prompt: string): boolean {
  if (!prompt.trim()) {
    setStatus("Digite um prompt antes de gerar o carrossel.", "error");
    return false;
  }

  return true;
}

function postGenerateMessage() {
  const prompt = promptEl?.value.trim() || "";

  if (!validatePrompt(prompt)) {
    return;
  }

  const message: GenerateCarouselMessage = {
    type: "generate-carousel",
    prompt,
    cards: selectedCards,
    branding: getBranding(),
  };

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
  if (!cardsGrid) return;

  cardsGrid.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest(".cards-option") as HTMLButtonElement | null;

    if (!button) return;

    const value = Number(button.dataset.value);
    if (!Number.isFinite(value)) return;

    setCards(value);
  });
}

function bindQuickPrompts() {
  quickPromptButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!promptEl) return;

      promptEl.value = button.dataset.prompt || "";
      setStatus("Prompt de exemplo aplicado.");
    });
  });
}

function bindGenerateButton() {
  if (!generateButton) return;

  generateButton.addEventListener("click", () => {
    postGenerateMessage();
  });
}

function bindPluginMessages() {
  window.onmessage = (event: MessageEvent<{ pluginMessage?: PluginToUiMessage }>) => {
    const msg = event.data.pluginMessage;

    if (!msg) return;

    if (msg.type === "status") {
      setStatus(msg.message);
      return;
    }

    if (msg.type === "error") {
      setLoading(false);
      setStatus(msg.message, "error");
      return;
    }

    if (msg.type === "success") {
      setLoading(false);
      setStatus(msg.message, "success");
    }
  };
}

function init() {
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

  setCards(selectedCards);
  bindCardsGrid();
  bindQuickPrompts();
  bindGenerateButton();
  bindPluginMessages();
  setStatus("Aguardando briefing para iniciar a geração.");
}

init();