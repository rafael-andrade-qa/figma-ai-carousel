import type { CarouselBranding, CarouselTemplate } from "../../types/branding";
import type {
  GenerateCarouselMessage,
  PluginToUiMessage,
} from "../../types/messages";

import { getState } from "../state";

export function renderDashboardScreen(input: {
  credits: number;
  email: string | null;
}): string {
  return `
    <div class="app-shell">
      <div class="hero">
        <div class="brand-row">
          <div class="brand">
            <div class="brand-mark">✦</div>
            <span>Figma AI Carousel</span>
          </div>
          <div class="badge">Plugin local • MVP</div>
        </div>

        <div class="dashboard-topbar">
          <div class="balance-pill">
            <span>Créditos</span>
            <strong>${input.credits}</strong>
          </div>

          <div class="account-pill">
            <span>${input.email ?? "Modo free"}</span>
          </div>
        </div>

        <h1>Crie carrosséis com IA dentro do Figma</h1>
        <p>Gere capa, conteúdo e CTA final com texto e imagem em poucos cliques.</p>
      </div>

      <div class="content">
        <div class="section">
          <p class="section-title">Briefing do carrossel</p>
          <p class="section-help">
            Escreva o tema, nicho, objetivo e tom. Quanto mais claro, melhor o resultado.
          </p>

          <label for="prompt">Prompt</label>
          <textarea
            id="prompt"
            placeholder="Ex.: Carrossel para dentistas sobre o que fazer quando a agenda da clínica está vazia..."
          ></textarea>

          <div class="quick-prompts">
            <button
              class="chip"
              type="button"
              data-prompt="Crie um carrossel de Instagram sobre os principais erros que as pessoas cometem nesse tema. Estruture com um gancho forte no primeiro slide, depois apresente de 3 a 5 erros com explicações curtas e práticas, e finalize com um CTA simples. Linguagem clara, estratégica, profissional e fácil de entender."
            >
              Erros comuns
            </button>

            <button
              class="chip"
              type="button"
              data-prompt="Crie um carrossel de Instagram em formato passo a passo sobre esse tema. Comece com uma capa forte, depois organize o conteúdo em etapas claras e objetivas, mostrando uma sequência lógica de execução, e termine com um CTA direto. Linguagem prática, profissional e orientada à ação."
            >
              Passo a passo
            </button>

            <button
              class="chip"
              type="button"
              data-prompt="Crie um carrossel de Instagram no formato mito vs verdade sobre esse tema. Comece com um gancho que desperte curiosidade, depois apresente crenças equivocadas e explique a verdade por trás de cada uma, com clareza e autoridade, finalizando com um CTA simples. Linguagem direta, moderna e confiável."
            >
              Mito ou verdade
            </button>

            <button
              class="chip"
              type="button"
              data-prompt="Crie um carrossel de Instagram em formato estudo de caso sobre esse tema. Estruture mostrando contexto, problema, solução aplicada e resultado, de forma envolvente e fácil de acompanhar. Finalize com um CTA objetivo. Linguagem profissional, persuasiva e com foco em credibilidade."
            >
              Estudo de caso
            </button>

            <button
              class="chip"
              type="button"
              data-prompt="Crie um carrossel de Instagram com dicas práticas sobre esse tema. Comece com uma capa forte, depois apresente dicas objetivas, úteis e aplicáveis no dia a dia, com explicações curtas, e finalize com um CTA claro. Linguagem simples, estratégica e voltada para gerar valor."
            >
              Dicas práticas
            </button>
          </div>
        </div>

        <div class="section">
          <p class="section-title">Branding</p>
          <p class="section-help">
            Esses dados controlam os textos fixos e a identidade visual do carrossel.
          </p>

          <div class="grid-2">
            <div>
              <label for="seriesName">Nome da série</label>
              <input id="seriesName" type="text" value="Nome da Série" />
            </div>

            <div>
              <label for="profileHandle">Perfil</label>
              <input id="profileHandle" type="text" value="@seuperfil" />
            </div>

            <div>
              <label for="primaryColor">Cor principal</label>
              <input id="primaryColor" type="text" value="#2E7BFF" />
            </div>

            <div>
              <label for="template">Template</label>
              <select id="template">
                <option value="educational">Educational</option>
                <option value="authority">Authority</option>
                <option value="checklist">Checklist</option>
                <option value="storytelling">Storytelling</option>
                <option value="myth">Myth</option>
              </select>
            </div>
          </div>

          <div class="field-spacing">
            <label for="ctaLabel">Texto do CTA</label>
            <input id="ctaLabel" type="text" value="Agende sua consulta" />
          </div>
        </div>

        <div class="section">
          <div class="section-row">
            <div>
              <p class="section-title">Quantidade de slides</p>
              <p class="section-help">
                3 e 5 cards consomem 1 crédito. 7 cards consome 2 créditos.
              </p>
            </div>

            <div style="display:flex; gap:10px; align-items:center;">
              <button id="openTransactions" class="tiny-link-button" type="button">
                Ver extrato
              </button>

              <button id="openPaywall" class="tiny-link-button" type="button">
                Comprar créditos
              </button>
            </div>
          </div>

          <div class="cards-grid" id="cardsGrid">
            <button class="cards-option" type="button" data-value="3">3</button>
            <button class="cards-option active" type="button" data-value="5">5</button>
            <button class="cards-option" type="button" data-value="7">7</button>
          </div>
        </div>

        <div class="actions">
          <button id="generate" class="primary-button" type="button">
            Gerar carrossel
          </button>

          <div class="action-note">
            O plugin vai criar os frames direto no canvas do arquivo atual.
          </div>
        </div>

        <div id="statusCard" class="status-card">
          <div class="status-top">
            <div class="status-dot"></div>
            <div class="status-label">Status</div>
          </div>
          <div id="statusText" class="status-text">
            Aguardando briefing para iniciar a geração.
          </div>
        </div>

        <div class="footer-note">
          V1 focada em geração rápida de carrosséis estratégicos para Instagram.
        </div>
      </div>
    </div>
  `;
}

export function bindDashboardScreen(actions: {
  credits: number;
  email: string;
  onOpenPaywall: () => void;
  onOpenTransactions: () => void;
  onSuccessfulGeneration: (creditsUsed: number) => void | Promise<void>;
}) {
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
  const openPaywallButton = document.getElementById("openPaywall");
  const openTransactionsButton = document.getElementById("openTransactions");

  const cardsOptions = Array.from(
    document.querySelectorAll<HTMLButtonElement>(".cards-option")
  );

  const quickPromptButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>(".chip")
  );

  let selectedCards = 5;
  let pendingCreditsCost = 0;

  function getCreditsCost(cards: number) {
    if (cards === 7) return 2;
    return 1;
  }

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

    const message: GenerateCarouselMessage = {
      type: "generate-carousel",
      prompt,
      cards: selectedCards,
      branding: getBranding(),
      accessToken,
    };

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
    if (!cardsGrid) return;

    cardsGrid.addEventListener("click", (event) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest(".cards-option") as HTMLButtonElement | null;

      if (!button) return;

      const value = Number(button.dataset.value);
      if (!Number.isFinite(value)) return;

      setCards(value);
      setStatus(
        `Essa geração vai consumir ${getCreditsCost(value)} crédito${
          getCreditsCost(value) > 1 ? "s" : ""
        }.`
      );
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

        if (msg.message === "NO_CREDITS") {
          setStatus("Você ficou sem créditos.", "error");
          pendingCreditsCost = 0;
          actions.onOpenPaywall();
          return;
        }

        setStatus(msg.message, "error");
        pendingCreditsCost = 0;
        return;
      }

      if (msg.type === "success") {
        setLoading(false);
        setStatus(msg.message, "success");

        const creditsUsed = msg.creditsUsed ?? pendingCreditsCost;

        if (creditsUsed > 0) {
          void Promise.resolve(actions.onSuccessfulGeneration(creditsUsed));
          pendingCreditsCost = 0;
        }
      }
    };
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

  setCards(selectedCards);
  bindCardsGrid();
  bindQuickPrompts();
  bindGenerateButton();
  bindPluginMessages();
  openPaywallButton?.addEventListener("click", actions.onOpenPaywall);
  openTransactionsButton?.addEventListener("click", actions.onOpenTransactions);
  setStatus("Aguardando briefing para iniciar a geração.");
}