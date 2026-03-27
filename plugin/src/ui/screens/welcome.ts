export function renderWelcomeScreen() {
  return `
    <div class="app-shell">
      <div class="hero hero-centered">
        <div class="brand-row">
          <div class="brand">
            <div class="brand-mark">✦</div>
            <span>Figma AI Ads</span>
          </div>
          <div class="badge">5 créditos grátis</div>
        </div>

        <div class="hero-centered-content">
          <h1>Crie peças e campanhas visuais com IA dentro do Figma</h1>
          <p>
            Transforme um briefing em criativos prontos para conteúdo, anúncios e campanhas visuais com mais velocidade.
          </p>

          <div class="welcome-benefits">
            <div class="mini-card">
              <strong>Múltiplos formatos</strong>
              <span>Carrossel, post, stories, capa para Reels e mais.</span>
            </div>

            <div class="mini-card">
              <strong>Fluxo rápido</strong>
              <span>Do briefing ao canvas em poucos cliques.</span>
            </div>

            <div class="mini-card">
              <strong>Teste grátis</strong>
              <span>Ganhe créditos para começar agora.</span>
            </div>
          </div>

          <div class="welcome-actions">
            <button id="startButton" class="primary-button" type="button">
              Continuar com email
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function bindWelcomeScreen(actions: {
  onStart: () => void;
}) {
  const startButton = document.getElementById("startButton");
  startButton?.addEventListener("click", actions.onStart);
}