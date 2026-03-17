import type { CreditTransaction } from "../../api/backend";

function formatAmount(amount: number) {
  if (amount > 0) return `+${amount}`;
  return `${amount}`;
}

function formatTypeLabel(type: CreditTransaction["type"]) {
  switch (type) {
    case "free_trial":
      return "Crédito grátis";
    case "purchase":
      return "Compra";
    case "usage":
      return "Uso";
    case "refund":
      return "Estorno";
    default:
      return type;
  }
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return value;
  }
}

export function renderTransactionsScreen(input: {
  credits: number;
  transactions: CreditTransaction[];
}) {
  return `
    <div class="app-shell">
      <section class="hero hero-compact">
        <div class="brand-row">
          <div class="brand">
            <div class="brand-mark">✦</div>
            <span>Figma AI Carousel</span>
          </div>
          <div class="badge">Extrato</div>
        </div>

        <h1>Extrato de créditos</h1>
        <p>Veja as movimentações recentes da sua conta.</p>
      </section>

      <div class="content">
        <div class="balance-card">
          <span>Saldo atual</span>
          <strong>${input.credits} créditos</strong>
        </div>

        ${
          input.transactions.length === 0
            ? `
              <div class="section">
                <div class="empty-transactions">
                  Nenhuma transação encontrada ainda.
                </div>
              </div>
            `
            : `
              <div class="section">
                <p class="section-title">Últimas movimentações</p>
                <p class="section-help">
                  Histórico recente de créditos, compras, uso e estornos.
                </p>

                <div class="transactions-list">
                  ${input.transactions
                    .map(
                      (transaction) => `
                        <div class="transaction-item">
                          <div class="transaction-top">
                            <div class="transaction-type">
                              ${formatTypeLabel(transaction.type)}
                            </div>
                            <div class="transaction-amount ${
                              transaction.amount > 0 ? "positive" : "negative"
                            }">
                              ${formatAmount(transaction.amount)}
                            </div>
                          </div>

                          <div class="transaction-description">
                            ${transaction.description}
                          </div>

                          <div class="transaction-meta">
                            <span>${formatDate(transaction.createdAt)}</span>
                            <span>Saldo: ${transaction.balanceAfter}</span>
                          </div>
                        </div>
                      `
                    )
                    .join("")}
                </div>
              </div>
            `
        }

        <div class="actions">
          <button id="backToDashboard" class="ghost-button" type="button">
            Voltar ao dashboard
          </button>
        </div>
      </div>
    </div>
  `;
}

export function bindTransactionsScreen(actions: {
  onBack: () => void;
}) {
  document
    .getElementById("backToDashboard")
    ?.addEventListener("click", actions.onBack);
}