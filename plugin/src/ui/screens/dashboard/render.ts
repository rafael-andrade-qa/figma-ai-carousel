import {
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

  const sectionTitle =
    selectedFormat === "carousel" ? "Briefing do carrossel" : "Briefing da peça";

  const brandingHelp =
    selectedFormat === "carousel"
      ? "Defina os textos fixos e a identidade visual usados na geração."
      : "Defina os textos fixos e a identidade visual usados na peça.";

  const actionNote =
    selectedFormat === "carousel"
      ? "O plugin vai criar os frames direto no canvas do arquivo atual."
      : "O plugin vai criar a peça direto no canvas do arquivo atual.";

  return `
    <div class="app-shell dashboard-shell">
      <section class="hero hero-compact dashboard-hero">
        <div class="dashboard-topbar">
          <div class="dashboard-topbar-left">
            <div class="brand">
              <div class="brand-mark">✦</div>
              <span>Figma AI Ads</span>
            </div>
          </div>

          <div class="dashboard-toolbar">
            <button
              id="changeFormatButton"
              class="toolbar-button"
              type="button"
              title="Escolher formato"
            >
              <span class="toolbar-button-arrow">←</span>
              <span>Formatos</span>
            </button>

            <button
              id="openPaywallFromToolbar"
              class="toolbar-chip"
              type="button"
              title="Comprar créditos"
            >
              <span class="toolbar-chip-label">${input.credits} Créditos</span>
            </button>

            <button
              id="openTransactionsFromToolbar"
              class="toolbar-button"
              type="button"
              title="Ver extrato"
            >
              Extrato
            </button>
          </div>
        </div>

        <div class="dashboard-hero-body">
          <div class="dashboard-hero-copy">
            <h1>${heroTitle}</h1>
            <p>${heroSubtitle}</p>
          </div>
        </div>
      </section>

      <div class="content dashboard-content">
        <section class="section dashboard-primary-card">
          <div class="dashboard-primary-head">
            <div>
              <p class="dashboard-eyebrow">Geração principal</p>
              <h2 class="dashboard-primary-title">${sectionTitle}</h2>
              <p class="dashboard-primary-help">
                Descreva com clareza o objetivo do criativo, a oferta, o público e o tom.
              </p>
            </div>

            <div class="dashboard-summary-card">
              <span class="dashboard-summary-label">Resumo da geração</span>
              <strong id="generationSummary">5 slides • 1 crédito</strong>
            </div>
          </div>

          <div class="field-spacing">
            <textarea
              id="prompt"
              placeholder="${promptPlaceholder}"
            ></textarea>
          </div>

          <div class="dashboard-chips-wrap">
            <div class="dashboard-chips-label">Sugestões rápidas</div>
            <div class="chips-row dashboard-chips-row">
              ${promptSuggestions
                .map(
                  (suggestion) => `
                    <button
                      type="button"
                      class="chip-button dashboard-chip-button"
                      data-prompt="${suggestion.prompt.replace(/"/g, "&quot;")}"
                      title="${suggestion.label}"
                    >
                      ${suggestion.label}
                    </button>
                  `
                )
                .join("")}
            </div>
          </div>

          <div class="actions dashboard-actions">
            <button id="generate" class="primary-button primary-button-lg" type="button">
              ${selectedFormat === "carousel" ? "Gerar carrossel" : "Gerar peça"}
            </button>

            <p class="action-note">${actionNote}</p>
          </div>

          <div id="statusCard" class="status-card dashboard-status-card">
            <div class="status-top">
              <span class="status-dot"></span>
              <span class="status-label">Status</span>
            </div>
            <div id="statusText" class="status-text"></div>
          </div>
        </section>

        <section class="section accordion-section" data-accordion="branding">
          <button
            type="button"
            class="accordion-toggle"
            data-accordion-trigger="branding"
            aria-expanded="false"
          >
            <span class="accordion-copy">
              <span class="section-title">Branding</span>
              <span id="brandingSummary" class="accordion-summary">
                Educacional • #2E7BFF • @seuperfil
              </span>
            </span>
            <span class="accordion-icon">⌄</span>
          </button>

          <div class="accordion-content" data-accordion-content="branding" hidden>
            <p class="section-help">${brandingHelp}</p>

            <div class="grid-2">
              <div>
                <label class="field-label" for="seriesName">
                  Nome da série
                  <span
                    class="field-tip"
                    title="Texto curto que aparece como nome da série ou linha editorial do conteúdo. Ex.: Dicas de Tráfego, Pílulas de Marketing, Série Clínica."
                  >
                    ?
                  </span>
                </label>
                <input id="seriesName" type="text" value="Nome da Série" />
              </div>

              <div>
                <label class="field-label" for="profileHandle">
                  Perfil
                  <span
                    class="field-tip"
                    title="Usuário ou nome curto da marca que aparece nos cards. Ex.: @suaempresa ou @seuperfil."
                  >
                    ?
                  </span>
                </label>
                <input id="profileHandle" type="text" value="@seuperfil" />
              </div>
            </div>

            <div class="grid-2 field-spacing">
              <div>
                <label class="field-label" for="primaryColor">
                  Cor principal
                  <span
                    class="field-tip"
                    title="Cor de destaque usada em botões, barras, detalhes e elementos visuais principais do template."
                  >
                    ?
                  </span>
                </label>

                <div class="color-field">
                  <input
                    id="primaryColorPicker"
                    class="color-field-picker"
                    type="color"
                    value="#2e7bff"
                    aria-label="Selecionar cor principal"
                  />
                  <input id="primaryColor" type="text" value="#2E7BFF" />
                </div>
              </div>

              <div>
                <label class="field-label" for="template">
                  Template
                  <span
                    class="field-tip"
                    title="Define o estilo visual e a lógica de composição do carrossel. Você pode escolher o formato que melhor combina com o tipo de mensagem."
                  >
                    ?
                  </span>
                </label>
                <select id="template">
                  <option value="educational" selected>Educacional</option>
                  <option value="authority">Autoridade</option>
                  <option value="checklist">Checklist</option>
                  <option value="myth">Mito ou verdade</option>
                  <option value="storytelling">Storytelling</option>
                </select>
              </div>
            </div>

            <div class="field-spacing">
              <label class="field-label" for="ctaLabel">
                CTA final
                <span
                  class="field-tip"
                  title="Chamada final para ação. Ex.: Agende sua consulta, Fale com nossa equipe, Clique no link da bio."
                >
                  ?
                </span>
              </label>
              <input id="ctaLabel" type="text" value="Agende sua consulta" />
            </div>
          </div>
        </section>

        <section class="section accordion-section" data-accordion="slides">
          <button
            type="button"
            class="accordion-toggle"
            data-accordion-trigger="slides"
            aria-expanded="false"
          >
            <span class="accordion-copy">
              <span class="section-title">Quantidade de slides</span>
              <span id="slidesSummary" class="accordion-summary">5 slides • 1 crédito</span>
            </span>
            <span class="accordion-icon">⌄</span>
          </button>

          <div class="accordion-content" data-accordion-content="slides" hidden>
            <p class="section-help">
              Escolha a estrutura mais adequada para a profundidade do conteúdo.
            </p>

            <div id="cardsGrid" class="cards-grid">
              <button type="button" class="cards-option" data-value="3">
                <span class="cards-option-value">3</span>
                <span class="cards-option-label">slides</span>
                <span class="cards-option-meta">1 crédito</span>
              </button>

              <button type="button" class="cards-option active" data-value="5">
                <span class="cards-option-value">5</span>
                <span class="cards-option-label">slides</span>
                <span class="cards-option-meta">1 crédito</span>
              </button>

              <button type="button" class="cards-option" data-value="7">
                <span class="cards-option-value">7</span>
                <span class="cards-option-label">slides</span>
                <span class="cards-option-meta">2 créditos</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;
}