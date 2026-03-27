import {
  CREATIVE_FORMATS,
  type CreativeFormat,
} from "../creativeFormats";

export function renderSelectFormatScreen(_selectedFormat: CreativeFormat | null): string {
  return `
    <div class="app-shell">
      <section class="hero select-format-hero">
        <div class="brand-row">
          <div class="brand">
            <div class="brand-mark">✦</div>
            <span>Figma AI Ads</span>
          </div>
          <div class="badge">Criativos com IA</div>
        </div>

        <div class="select-hero-copy">
          <h1>O que você quer criar hoje?</h1>
          <p>
            Escolha o formato e transforme seu briefing em peças prontas para
            campanha, conteúdo e conversão.
          </p>
        </div>
      </section>

      <div class="content select-format-content">
        <section class="select-section">
          <div class="select-section-heading">
            <h2>Selecione um formato</h2>
            <p class="section-help">
              Você já pode começar com carrossel. Os próximos formatos já ficam visíveis
              para preparar a evolução do produto.
            </p>
          </div>

          <div class="format-grid">
            ${CREATIVE_FORMATS.map(
              (format) => `
                <button
                  class="format-card ${format.availableNow ? "is-available" : "is-locked"}"
                  type="button"
                  data-format-id="${format.id}"
                >
                  <div class="format-card-top">
                    <div class="format-icon ${format.availableNow ? "" : "muted"}">
                      ${getFormatIcon(format.id)}
                    </div>

                    <span class="format-badge ${
                      format.availableNow ? "available" : "soon"
                    }">
                      ${format.badge}
                    </span>
                  </div>

                  <div class="format-card-body">
                    <strong>${format.label}</strong>
                    <span>${format.description}</span>
                  </div>
                </button>
              `
            ).join("")}
          </div>
        </section>
      </div>
    </div>
  `;
}

export function bindSelectFormatScreen(actions: {
  onSelectFormat: (format: CreativeFormat) => void;
  onContinue: () => void;
}) {
  document.querySelectorAll<HTMLElement>("[data-format-id]").forEach((element) => {
    element.addEventListener("click", async () => {
      const formatId = element.dataset.formatId as CreativeFormat | undefined;

      if (!formatId) {
        return;
      }

      const format = CREATIVE_FORMATS.find((item) => item.id === formatId);

      if (!format) {
        return;
      }

      await actions.onSelectFormat(formatId);

      if (format.availableNow) {
        await actions.onContinue();
      }
    });
  });
}

function getFormatIcon(format: CreativeFormat) {
  switch (format) {
    case "carousel":
      return "▣";
    case "static_post":
      return "■";
    case "stories":
      return "▥";
    case "reel_cover":
      return "▶";
    case "banner":
      return "▬";
    case "whatsapp":
      return "◌";
    default:
      return "✦";
  }
}