type AuthActions = {
  onRequestCode: (email: string) => void | Promise<void>;
  onVerifyCode: (code: string) => void | Promise<void>;
  onResendCode: () => void | Promise<void>;
  onChangeEmail: () => void;
};

export function renderAuthScreen(params: {
  email: string | null;
  error?: string | null;
}) {
  const hasEmail = Boolean(params.email);

  return `
    <div class="app-shell">
      <section class="hero hero-compact">
        <div class="brand-row">
          <div class="brand">
            <div class="brand-mark">✦</div>
            <span>Figma AI Carousel</span>
          </div>

          <div class="badge">Acesso seguro</div>
        </div>

        <h1>${hasEmail ? "Digite o código" : "Entre com seu email"}</h1>

        <p>
          ${
            hasEmail
              ? `Enviamos um código para <strong>${params.email}</strong>`
              : "Use seu email para acessar o plugin. Sem senha, sem complicação."
          }
        </p>
      </section>

      <div class="content">

        ${
          !hasEmail
            ? `
          <div class="section">
            <p class="section-title">Acesse em segundos</p>
            <p class="section-help">
              Digite seu email e enviaremos um código de acesso.
            </p>

            <label for="authEmail">Email</label>
            <input id="authEmail" type="email" placeholder="voce@exemplo.com" />
          </div>
        `
            : `
          <div class="section">
            <p class="section-title">Validação</p>
            <p class="section-help">
              Digite o código enviado para seu email.
            </p>

            <label for="authCode">Código</label>
            <input id="authCode" type="text" inputmode="numeric" maxlength="8" placeholder="12345678" />

            <div class="inline-error">
              Não recebeu? Clique em reenviar
            </div>
          </div>
        `
        }

        ${
          params.error
            ? `
          <div class="status-card error">
            <div class="status-top">
              <div class="status-dot"></div>
              <div class="status-label">Erro</div>
            </div>
            <div class="status-text">${params.error}</div>
          </div>
        `
            : ""
        }

        <div class="actions">
          ${
            !hasEmail
              ? `<button id="requestCode" class="primary-button">Continuar</button>`
              : `
                <button id="verifyCode" class="primary-button">Entrar</button>
                <button id="resendCode" class="ghost-button">Reenviar código</button>
                <button id="changeEmail" class="ghost-button">Trocar email</button>
              `
          }
        </div>
      </div>
    </div>
  `;
}

export function bindAuthScreen(actions: AuthActions) {
  const emailInput = document.getElementById("authEmail") as HTMLInputElement | null;
  const codeInput = document.getElementById("authCode") as HTMLInputElement | null;

  document.getElementById("requestCode")?.addEventListener("click", async () => {
    const email = emailInput?.value?.trim() ?? "";
    await actions.onRequestCode(email);
  });

  document.getElementById("verifyCode")?.addEventListener("click", async () => {
    const code = codeInput?.value?.trim() ?? "";
    await actions.onVerifyCode(code);
  });

  document.getElementById("resendCode")?.addEventListener("click", async () => {
    await actions.onResendCode();
  });

  document.getElementById("changeEmail")?.addEventListener("click", () => {
    actions.onChangeEmail();
  });

  codeInput?.addEventListener("input", () => {
    if (codeInput.value.length === 8) {
      actions.onVerifyCode(codeInput.value);
    }
  });
}