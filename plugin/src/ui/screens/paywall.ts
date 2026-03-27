import type { PurchasePackageId } from "../../api/backend";

function formatCreditsLabel(value: number) {
  return `${value} ${value === 1 ? "crédito" : "créditos"}`;
}

export function renderPaywallScreen(currentCredits: number) {
  return `
    <div class="app-shell paywall-shell">
      <section class="hero hero-compact paywall-hero">
        <div class="paywall-topbar">
          <div class="brand">
            <div class="brand-mark">✦</div>
            <span>Figma AI Ads</span>
          </div>

          <button
            id="paywallBack"
            class="toolbar-button"
            type="button"
            title="Voltar"
          >
            <span class="toolbar-button-arrow">←</span>
            <span>Voltar</span>
          </button>
        </div>

        <div class="paywall-hero-copy">
          <h1>Escolha um pacote de créditos</h1>
          <p>
            Continue gerando criativos direto no Figma com checkout seguro e atualização rápida do saldo.
          </p>
        </div>
      </section>

      <div class="content paywall-content">
        <section class="section paywall-balance-card">
          <div class="paywall-balance-copy">
            <span class="paywall-balance-label">Saldo atual</span>
            <strong class="paywall-balance-value">${formatCreditsLabel(currentCredits)}</strong>
          </div>
        </section>

        <section class="section paywall-intro-card">
          <p class="section-title">Escolha o pacote ideal</p>
          <p class="section-help">
            Ao clicar em um pacote, o checkout do Stripe será aberto no navegador.
            Depois do pagamento, seu saldo será atualizado automaticamente.
          </p>
        </section>

        <div class="pricing-grid paywall-pricing-grid">
          <button class="price-card paywall-price-card" type="button" data-package-id="starter">
            <div class="paywall-price-card-head">
              <div>
                <div class="price-title">Starter</div>
                <div class="price-credits">20 créditos</div>
              </div>
            </div>

            <div class="paywall-price-main">
              <div class="price-value">R$19</div>
              <div class="price-help">Ótimo para testar no dia a dia</div>
            </div>
          </button>

          <button
            class="price-card paywall-price-card featured"
            type="button"
            data-package-id="pro"
          >
            <div class="paywall-price-card-head">
              <div>
                <div class="price-title">Pro</div>
                <div class="price-credits">60 créditos</div>
              </div>

              <div class="price-badge">Popular</div>
            </div>

            <div class="paywall-price-main">
              <div class="price-value">R$39</div>
              <div class="price-help">Melhor equilíbrio entre preço e volume</div>
            </div>
          </button>

          <button class="price-card paywall-price-card" type="button" data-package-id="studio">
            <div class="paywall-price-card-head">
              <div>
                <div class="price-title">Studio</div>
                <div class="price-credits">150 créditos</div>
              </div>
            </div>

            <div class="paywall-price-main">
              <div class="price-value">R$79</div>
              <div class="price-help">Para uso recorrente e equipe</div>
            </div>
          </button>
        </div>

        <div id="paywallStatusCard" class="status-card paywall-status-card">
          <div class="status-top">
            <div class="status-dot"></div>
            <div class="status-label">Checkout</div>
          </div>

          <div id="paywallStatusText" class="status-text">Clique em um pacote para abrir o checkout.</div>
        </div>
      </div>
    </div>
  `;
}

export function bindPaywallScreen(actions: {
  onBack: () => void;
  onBuy: (packageId: PurchasePackageId) => void | Promise<void>;
}) {
  const backButton = document.getElementById("paywallBack") as HTMLButtonElement | null;
  const statusCard = document.getElementById("paywallStatusCard") as HTMLDivElement | null;
  const statusText = document.getElementById("paywallStatusText") as HTMLDivElement | null;

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

  function setBuyingState(activePackageId: string | null) {
    document
      .querySelectorAll<HTMLButtonElement>("[data-package-id]")
      .forEach((button) => {
        const isActive = button.dataset.packageId === activePackageId;
        button.disabled = activePackageId !== null;
        button.classList.toggle("is-loading", isActive);
      });
  }

  backButton?.addEventListener("click", () => {
    actions.onBack();
  });

  document.querySelectorAll<HTMLButtonElement>("[data-package-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      const packageId = button.dataset.packageId as PurchasePackageId | undefined;

      if (!packageId) {
        return;
      }

      try {
        setBuyingState(packageId);
        setStatus("Abrindo checkout seguro no navegador...");

        await actions.onBuy(packageId);

        setStatus(
          "Checkout aberto. Assim que o pagamento for confirmado, seu saldo será atualizado automaticamente.",
          "success"
        );
      } catch (error) {
        console.error("[UI] Erro ao iniciar checkout:", error);
        setStatus("Não foi possível abrir o checkout agora.", "error");
      } finally {
        setBuyingState(null);
      }
    });
  });
}