export function renderWelcomeScreen() {
  return `
    <div class="app-shell">
      <div class="hero hero-centered">
        <div class="brand-row">
          <div class="brand">
            <div class="brand-mark">✦</div>
            <span>Figma AI Carousel</span>
          </div>
          <div class="badge">5 créditos grátis</div>
        </div>

        <div class="hero-centered-content">
          <h1>Crie carrosséis estratégicos com IA dentro do Figma</h1>
          <p>
            Gere capa, conteúdo e CTA final em poucos cliques com templates prontos para Instagram.
          </p>

          <div class="welcome-benefits">
            <div class="mini-card">
              <strong>Templates prontos</strong>
              <span>Authority, Educational, Checklist e mais.</span>
            </div>

            <div class="mini-card">
              <strong>Fluxo rápido</strong>
              <span>Do briefing ao canvas em segundos.</span>
            </div>

            <div class="mini-card">
              <strong>Teste grátis</strong>
              <span>Ganhe 5 créditos para começar.</span>
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