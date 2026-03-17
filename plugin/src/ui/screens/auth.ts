export function renderAuthScreen(params: {
  pendingEmail: string | null;
}) {
  const hasPendingEmail = Boolean(params.pendingEmail);

  return `
    <div class="app-shell">
      <div class="hero hero-compact">
        <div class="brand-row">
          <button id="authBack" class="ghost-button" type="button">Voltar</button>
          <div class="badge">Acesso seguro</div>
        </div>

        <h1>Entre com seu email</h1>
        <p>
          Vamos enviar um código para autenticar sua conta no plugin.
        </p>
      </div>

      <div class="content">
        <div class="section">
          <label for="authEmail">Email</label>
          <input
            id="authEmail"
            type="email"
            placeholder="voce@exemplo.com"
            value="${params.pendingEmail ?? ""}"
            ${hasPendingEmail ? "disabled" : ""}
          />
        </div>

        ${
          hasPendingEmail
            ? `
          <div class="section">
            <label for="authCode">Código de 8 dígitos</label>
            <input
              id="authCode"
              type="text"
              inputmode="numeric"
              maxlength="8"
              placeholder="12345678"
            />
            <div class="inline-error" style="color: var(--muted); margin-top: 10px;">
              Código enviado para ${params.pendingEmail}
            </div>
          </div>
        `
            : ""
        }

        <div class="welcome-actions">
          ${
            hasPendingEmail
              ? `
            <button id="verifyCode" class="primary-button" type="button">
              Validar código
            </button>
            <button id="changeEmail" class="ghost-button" type="button">
              Alterar email
            </button>
          `
              : `
            <button id="requestCode" class="primary-button" type="button">
              Receber código
            </button>
          `
          }
        </div>
      </div>
    </div>
  `;
}

export function bindAuthScreen(actions: {
  onBack: () => void;
  onRequestCode: (email: string) => void | Promise<void>;
  onVerifyCode: (code: string) => void | Promise<void>;
  onChangeEmail: () => void;
}) {
  const backButton = document.getElementById("authBack");
  const requestCodeButton = document.getElementById("requestCode");
  const verifyCodeButton = document.getElementById("verifyCode");
  const changeEmailButton = document.getElementById("changeEmail");
  const emailInput = document.getElementById("authEmail") as HTMLInputElement | null;
  const codeInput = document.getElementById("authCode") as HTMLInputElement | null;

  backButton?.addEventListener("click", actions.onBack);

  requestCodeButton?.addEventListener("click", async () => {
    const email = emailInput?.value?.trim() ?? "";
    await actions.onRequestCode(email);
  });

  verifyCodeButton?.addEventListener("click", async () => {
    const code = codeInput?.value?.trim() ?? "";
    await actions.onVerifyCode(code);
  });

  changeEmailButton?.addEventListener("click", actions.onChangeEmail);
}