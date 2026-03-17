import type { PurchasePackageId } from "../../api/backend";

export function renderPaywallScreen(currentCredits: number): string {
  return `
    <div class="app-shell">
      <section class="hero hero-compact">
        <div class="brand-row">
          <div class="brand">
            <div class="brand-mark">✦</div>
            <span>Figma AI Carousel</span>
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

        <div class="actions">
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
}) {
  const backButton = document.getElementById("paywallBack");
  const priceButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>(".price-card")
  );

  backButton?.addEventListener("click", actions.onBack);

  priceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const packageId = button.dataset.packageId as PurchasePackageId | undefined;
      if (!packageId) return;

      actions.onBuy(packageId);
    });
  });
}