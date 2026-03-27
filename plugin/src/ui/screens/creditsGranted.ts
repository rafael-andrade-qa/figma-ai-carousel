export function renderCreditsGrantedScreen(credits: number): string {
  return `
    <div class="app-shell">
      <section class="hero hero-centered">
        <div class="brand-row">
          <div class="brand">
            <div class="brand-mark">✦</div>
            <span>Figma AI Ads</span>
          </div>
          <div class="badge">Conta criada</div>
        </div>

        <div class="hero-centered-content">
          <div class="success-icon">✓</div>
          <h1>Pronto, seus créditos já estão liberados</h1>
          <p>
            Você recebeu <strong>${credits} créditos grátis</strong> para testar o plugin
            e criar seus primeiros criativos.
          </p>

          <div class="granted-card">
            <div class="granted-value">${credits} créditos</div>
            <div class="granted-help">3 e 5 cards consomem 1 crédito • 7 cards consome 2</div>
          </div>

          <div class="welcome-actions">
            <button id="grantedContinue" class="primary-button" type="button">
              Escolher formato
            </button>
          </div>
        </div>
      </section>
    </div>
  `;
}

export function bindCreditsGrantedScreen(actions: {
  onContinue: () => void;
}) {
  const continueButton = document.getElementById("grantedContinue");
  continueButton?.addEventListener("click", actions.onContinue);
}