import type { PurchasePackageId } from "../../api/backend";

export function renderPaywallScreen(currentCredits: number): string {
  return `
    <div class="app-shell">
      <section class="hero hero-compact">
        <div class="brand-row">
          <div class="brand">
            <div class="brand-mark">✦</div>
            <span>Figma AI Ads</span>
          </div>
          <div class="badge">Sem créditos</div>
        </div>

        <h1>Você ficou sem créditos</h1>
        <p>
          Escolha um pacote para continuar gerando carrosséis direto no Figma.
        </p>
      </section>

      <div class="content">
        <div class="balance-card">
          <span>Saldo atual</span>
          <strong>${currentCredits} créditos</strong>
        </div>

        <div class="section">
          <p class="section-title">Escolha seu pacote</p>
          <p class="section-help">
            O checkout seguro do Stripe será aberto no navegador. Depois do pagamento,
            o plugin tentará atualizar seu saldo automaticamente.
          </p>
        </div>

        <div class="pricing-grid">
          <button class="price-card" type="button" data-package-id="starter">
            <div class="price-title">Starter</div>
            <div class="price-credits">20 créditos</div>
            <div class="price-value">R$19</div>
            <div class="price-help">Ótimo para testar no dia a dia</div>
          </button>

          <button class="price-card featured" type="button" data-package-id="pro">
            <div class="price-badge">Mais popular</div>
            <div class="price-title">Pro</div>
            <div class="price-credits">60 créditos</div>
            <div class="price-value">R$39</div>
            <div class="price-help">Melhor equilíbrio entre preço e volume</div>
          </button>

          <button class="price-card" type="button" data-package-id="studio">
            <div class="price-title">Studio</div>
            <div class="price-credits">150 créditos</div>
            <div class="price-value">R$79</div>
            <div class="price-help">Para uso recorrente e equipe</div>
          </button>
        </div>

        <div id="paywallStatusCard" class="status-card">
          <div class="status-top">
            <div class="status-dot"></div>
            <div class="status-label">Pagamento</div>
          </div>
          <div id="paywallStatusText" class="status-text">
            Escolha um pacote para abrir o checkout.
          </div>
        </div>

        <div class="actions" style="display:flex; flex-direction:column; gap:10px;">
          <button id="refreshCreditsAfterPayment" class="primary-button" type="button">
            Já paguei, atualizar saldo
          </button>

          <button id="paywallBack" class="ghost-button" type="button">
            Voltar ao dashboard
          </button>
        </div>
      </div>
    </div>
  `;
}

export function bindPaywallScreen(actions: {
  onBack: () => void;
  onBuy: (packageId: PurchasePackageId) => void | Promise<void>;
  onRefreshCredits: () => void | Promise<void>;
}) {
  const backButton = document.getElementById("paywallBack") as HTMLButtonElement | null;
  const refreshButton = document.getElementById(
    "refreshCreditsAfterPayment"
  ) as HTMLButtonElement | null;
  const statusCard = document.getElementById("paywallStatusCard") as HTMLDivElement | null;
  const statusText = document.getElementById("paywallStatusText") as HTMLDivElement | null;

  const priceButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>(".price-card")
  );

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

  function setLoading(isLoading: boolean, activePackageId?: PurchasePackageId) {
    priceButtons.forEach((button) => {
      const packageId = button.dataset.packageId as PurchasePackageId | undefined;
      button.disabled = isLoading;

      if (isLoading && activePackageId && packageId === activePackageId) {
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = `
          <div class="price-title">Abrindo checkout...</div>
          <div class="price-help">Aguarde alguns instantes</div>
        `;
      } else if (!isLoading && button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
        delete button.dataset.originalText;
      }
    });

    if (refreshButton) {
      refreshButton.disabled = isLoading;
      refreshButton.textContent = isLoading
        ? "Abrindo checkout..."
        : "Já paguei, atualizar saldo";
    }

    if (backButton) {
      backButton.disabled = isLoading;
    }
  }

  backButton?.addEventListener("click", actions.onBack);

  refreshButton?.addEventListener("click", async () => {
    try {
      setStatus("Atualizando saldo no backend...");
      await actions.onRefreshCredits();
      setStatus("Saldo sincronizado com sucesso.", "success");
    } catch {
      setStatus("Não foi possível atualizar o saldo agora.", "error");
    }
  });

  priceButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const packageId = button.dataset.packageId as PurchasePackageId | undefined;
      if (!packageId) return;

      try {
        setLoading(true, packageId);
        setStatus("Criando checkout seguro...");

        await actions.onBuy(packageId);

        setStatus(
          "Checkout aberto no navegador. Após pagar, volte ao plugin. Vamos tentar atualizar seu saldo automaticamente."
        );
      } catch {
        setStatus("Não foi possível abrir o checkout agora.", "error");
      } finally {
        setLoading(false);
      }
    });
  });
}