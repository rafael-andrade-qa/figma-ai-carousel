type AuthActions = {
  onRequestCode: (email: string) => void | Promise<void>;
  onVerifyCode: (code: string) => void | Promise<void>;
  onResendCode: () => void | Promise<void>;
  onChangeEmail: () => void;
};

export function renderAuthScreen(params: {
  email: string | null;
  error?: string | null;
  resendCooldownSeconds?: number;
}) {
  const hasEmail = Boolean(params.email);
  const resendCooldownSeconds = Math.max(0, params.resendCooldownSeconds ?? 0);
  const canResend = resendCooldownSeconds === 0;

  return `
    <div class="app-shell">
      <section class="hero hero-compact">
        <div class="brand-row">
          <div class="brand">
            <div class="brand-mark">✦</div>
            <span>Figma AI Ads</span>
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
            <input
              id="authCode"
              type="text"
              inputmode="numeric"
              maxlength="8"
              placeholder="12345678"
              autocomplete="one-time-code"
            />

            <div class="inline-helper">
              Não recebeu?
              <span id="resendSlot">
                ${
                  canResend
                    ? `<button id="resendInline" class="inline-link-button" type="button">Clique aqui.</button>`
                    : `<span id="resendCountdown" class="inline-helper-countdown">Reenviar em ${resendCooldownSeconds}s</span>`
                }
              </span>
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
              ? `<button id="requestCode" class="primary-button" type="button">Continuar</button>`
              : `
                <button id="changeEmail" class="ghost-button" type="button">Trocar email</button>
              `
          }
        </div>
      </div>
    </div>
  `;
}

export function bindAuthScreen(
  actions: AuthActions,
  options?: {
    getResendCooldownSeconds?: () => number;
  }
) {
  const emailInput = document.getElementById("authEmail") as HTMLInputElement | null;
  const codeInput = document.getElementById("authCode") as HTMLInputElement | null;
  const resendSlot = document.getElementById("resendSlot");

  let isVerifyingCode = false;
  let cooldownIntervalId: number | null = null;

  document.getElementById("requestCode")?.addEventListener("click", async () => {
    const email = emailInput?.value?.trim() ?? "";
    await actions.onRequestCode(email);
  });

  function bindResendInlineButton() {
    document.getElementById("resendInline")?.addEventListener("click", async () => {
      await actions.onResendCode();
    });
  }

  bindResendInlineButton();

  document.getElementById("changeEmail")?.addEventListener("click", () => {
    if (cooldownIntervalId) {
      window.clearInterval(cooldownIntervalId);
      cooldownIntervalId = null;
    }

    actions.onChangeEmail();
  });

  codeInput?.addEventListener("input", async () => {
    const code = codeInput.value.trim();

    if (code.length !== 8 || isVerifyingCode) {
      return;
    }

    isVerifyingCode = true;

    try {
      await actions.onVerifyCode(code);
    } finally {
      isVerifyingCode = false;
    }
  });

  if (resendSlot && options?.getResendCooldownSeconds) {
    const renderResendState = () => {
      const remainingSeconds = options.getResendCooldownSeconds?.() ?? 0;

      if (remainingSeconds > 0) {
        resendSlot.innerHTML = `<span id="resendCountdown" class="inline-helper-countdown">Reenviar em ${remainingSeconds}s</span>`;
        return;
      }

      resendSlot.innerHTML = `<button id="resendInline" class="inline-link-button" type="button">Clique aqui.</button>`;
      bindResendInlineButton();
    };

    renderResendState();

    cooldownIntervalId = window.setInterval(() => {
      const remainingSeconds = options.getResendCooldownSeconds?.() ?? 0;
      renderResendState();

      if (remainingSeconds <= 0 && cooldownIntervalId) {
        window.clearInterval(cooldownIntervalId);
        cooldownIntervalId = null;
      }
    }, 1000);
  }
}