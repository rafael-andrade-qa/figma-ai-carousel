import {
  getCreativeFormatLabel,
  getDashboardSubtitleByFormat,
  getDashboardTitleByFormat,
  getPromptPlaceholderByFormat,
  getPromptSuggestionsByFormat,
} from "../../creativeFormats";

import { getState } from "../../state";

export function renderDashboardScreen(input: {
  credits: number;
  email: string | null;
}): string {
  const state = getState();
  const selectedFormat = state.selectedFormat ?? "carousel";

  const heroTitle = getDashboardTitleByFormat(selectedFormat);
  const heroSubtitle = getDashboardSubtitleByFormat(selectedFormat);
  const promptPlaceholder = getPromptPlaceholderByFormat(selectedFormat);
  const promptSuggestions = getPromptSuggestionsByFormat(selectedFormat);
  const selectedFormatLabel = getCreativeFormatLabel(selectedFormat);

  const sectionTitle =
    selectedFormat === "carousel" ? "Briefing do carrossel" : "Briefing da peça";

  const brandingHelp =
    selectedFormat === "carousel"
      ? "Esses dados controlam os textos fixos e a identidade visual do carrossel."
      : "Esses dados controlam os textos fixos e a identidade visual da peça.";

  const generateButtonLabel =
    selectedFormat === "carousel" ? "Gerar carrossel" : "Gerar peça";

  const actionNote =
    selectedFormat === "carousel"
      ? "O plugin vai criar os frames direto no canvas do arquivo atual."
      : "O plugin vai criar a peça direto no canvas do arquivo atual.";

  const footerNote =
    selectedFormat === "carousel"
      ? "V1 focada em geração rápida de carrosséis estratégicos para Instagram."
      : "V1 evoluindo para uma plataforma de geração de criativos com IA.";

  return `
    <div class="app-shell">
      <div class="hero">
        <div class="brand-row">
          <div class="brand">
            <div class="brand-mark">✦</div>
            <span>Figma AI Ads</span>
          </div>
          <div class="badge">Plugin local • MVP</div>
        </div>

        <div class="dashboard-topbar">
          <div class="balance-pill">
            <span>Créditos</span>
            <strong>${input.credits}</strong>
          </div>

          <div class="account-pill">
            <span>${input.email ?? "Modo free"}</span>
          </div>
        </div>

        <div class="dashboard-hero-copy">
          <div class="dashboard-format-pill">
            Formato atual: <strong>${selectedFormatLabel}</strong>
          </div>

          <h1>${heroTitle}</h1>
          <p>${heroSubtitle}</p>

          <div class="dashboard-secondary-actions">
            <button id="changeFormatButton" class="ghost-button" type="button">
              Trocar formato
            </button>
          </div>
        </div>
      </div>

      <div class="content">
        <div class="section">
          <p class="section-title">${sectionTitle}</p>
          <p class="section-help">
            Escreva o tema, nicho, objetivo e tom. Quanto mais claro, melhor o resultado.
          </p>

          <label for="prompt">Prompt</label>
          <textarea
            id="prompt"
            placeholder="${promptPlaceholder}"
          ></textarea>

          <div class="prompt-chips">
            ${promptSuggestions
              .map(
                (item) => `
                  <button
                    type="button"
                    class="chip-button"
                    data-chip-value="${item}"
                  >
                    ${item}
                  </button>
                `
              )
              .join("")}
          </div>
        </div>

        <div class="section">
          <p class="section-title">Branding</p>
          <p class="section-help">
            ${brandingHelp}
          </p>

          <div class="grid-2">
            <div>
              <label for="seriesName">Nome da série</label>
              <input id="seriesName" type="text" value="Nome da Série" />
            </div>

            <div>
              <label for="profileHandle">Perfil</label>
              <input id="profileHandle" type="text" value="@seuperfil" />
            </div>

            <div>
              <label for="primaryColor">Cor principal</label>
              <input id="primaryColor" type="text" value="#2E7BFF" />
            </div>

            <div>
              <label for="template">Template</label>
              <select id="template">
                <option value="educational">Educational</option>
                <option value="authority">Authority</option>
                <option value="checklist">Checklist</option>
                <option value="storytelling">Storytelling</option>
                <option value="myth">Myth</option>
              </select>
            </div>
          </div>

          <div class="field-spacing">
            <label for="ctaLabel">Texto do CTA</label>
            <input id="ctaLabel" type="text" value="Agende sua consulta" />
          </div>
        </div>

        <div class="section">
          <div class="section-row">
            <div>
              <p class="section-title">Quantidade de slides</p>
              <p class="section-help">
                3 e 5 cards consomem 1 crédito. 7 cards consome 2 créditos.
              </p>
            </div>

            <div style="display:flex; gap:10px; align-items:center;">
              <button id="openTransactions" class="tiny-link-button" type="button">
                Ver extrato
              </button>

              <button id="openPaywall" class="tiny-link-button" type="button">
                Comprar créditos
              </button>
            </div>
          </div>

          <div class="cards-grid" id="cardsGrid">
            <button class="cards-option" type="button" data-value="3">3</button>
            <button class="cards-option active" type="button" data-value="5">5</button>
            <button class="cards-option" type="button" data-value="7">7</button>
          </div>
        </div>

        <div class="actions">
          <button id="generate" class="primary-button" type="button">
            ${generateButtonLabel}
          </button>

          <div class="action-note">
            ${actionNote}
          </div>
        </div>

        <div id="statusCard" class="status-card">
          <div class="status-top">
            <div class="status-dot"></div>
            <div class="status-label">Status</div>
          </div>
          <div id="statusText" class="status-text">
            Aguardando briefing para iniciar a geração.
          </div>
        </div>

        <div class="footer-note">
          ${footerNote}
        </div>
      </div>
    </div>
  `;
}