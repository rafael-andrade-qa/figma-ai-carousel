/// <reference types="@figma/plugin-typings" />

import { sendError, sendStatus, sendSuccess } from "./utils/notify";

import type { GenerateCarouselMessage } from "./types/messages";
import { createCarouselFrames } from "./render/createCarouselFrames";
import { defaultBranding } from "./render/config/defaultBranding";
import { requestCarousel } from "./api/backend";

figma.showUI(__html__, { width: 420, height: 420 });

figma.ui.onmessage = async (msg: GenerateCarouselMessage) => {
  if (msg.type !== "generate-carousel") {
    sendError("Tipo de mensagem desconhecido.");
    return;
  }

  try {
    const prompt = msg.prompt?.trim();
    const cards = typeof msg.cards === "number" ? msg.cards : 5;
    const branding = msg.branding ?? defaultBranding;

    if (!prompt) {
      sendError("Prompt vazio.");
      figma.notify("Prompt vazio.");
      return;
    }

    sendStatus("Mensagem recebida. Iniciando geração...");

    const data = await requestCarousel({
      prompt,
      cards,
      branding,
    });

    sendStatus(`Recebidos ${data.cards.length} cards. Criando frames...`);

    await createCarouselFrames(data.cards, branding);

    sendSuccess(`Sucesso! ${data.cards.length} frames criados.`);
    figma.notify(`Carrossel criado com ${data.cards.length} cards.`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido no plugin.";

    sendError(message);
    figma.notify("Erro ao gerar carrossel.");
  }
};