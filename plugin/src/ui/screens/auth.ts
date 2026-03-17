export function renderAuthScreen(): string {
  return `
    <div class="app-shell">
      <section class="hero hero-compact">
        <div class="brand-row">
          <div class="brand">
            <div class="brand-mark">✦</div>
            <span>Figma AI Carousel</span>
          </div>
          <div class="badge">Acesso inicial</div>
        </div>

        <h1>Crie sua conta para salvar seus créditos</h1>
        <p>
          Por enquanto vamos começar com um fluxo simples por e-mail. Depois você pode
          evoluir isso para magic link ou Google login.
        </p>
      </section>

      <div class="content">
        <div class="section">
          <p class="section-title">Seu e-mail</p>
          <p class="section-help">
            Esse e-mail será usado para vincular seus créditos e o histórico de uso.
          </p>

          <label for="authEmail">E-mail</label>
          <input
            id="authEmail"
            type="email"
            placeholder="voce@exemplo.com"
            autocomplete="email"
          />

          <div id="authError" class="inline-error" hidden>
            Digite um e-mail válido para continuar.
          </div>
        </div>

        <div class="actions">
          <button id="authContinue" class="primary-button" type="button">
            Continuar
          </button>

          <button id="authBack" class="ghost-button" type="button">
            Voltar
          </button>
        </div>
      </div>
    </div>
  `;
}

export function bindAuthScreen(actions: {
  onContinue: (email: string) => void;
  onBack: () => void;
}) {
  const emailInput = document.getElementById("authEmail") as HTMLInputElement | null;
  const continueButton = document.getElementById("authContinue");
  const backButton = document.getElementById("authBack");
  const errorEl = document.getElementById("authError");

  function validateEmail(value: string) {
    return /\S+@\S+\.\S+/.test(value);
  }

  function submit() {
    const email = emailInput?.value.trim() || "";

    if (!validateEmail(email)) {
      if (errorEl) errorEl.hidden = false;
      return;
    }

    if (errorEl) errorEl.hidden = true;
    actions.onContinue(email);
  }

  continueButton?.addEventListener("click", submit);
  backButton?.addEventListener("click", actions.onBack);

  emailInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      submit();
    }
  });
}