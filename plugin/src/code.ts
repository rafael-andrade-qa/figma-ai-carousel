/// <reference types="@figma/plugin-typings" />

import { sendError, sendStatus, sendSuccess } from "./utils/notify";

import type { GenerateCarouselMessage } from "./types/messages";
import { createCarouselFrames } from "./render/createCarouselFrames";
import { defaultBranding } from "./render/config/defaultBranding";
import { requestCarousel } from "./api/backend";

figma.showUI(__html__, { width: 560, height: 780 });

function getCreditsCost(cards: number) {
  if (cards === 7) return 2;
  return 1;
}

figma.ui.onmessage = async (msg: GenerateCarouselMessage) => {
  if (msg.type !== "generate-carousel") {
    sendError("Tipo de mensagem desconhecido.");
    return;
  }

  try {
    const prompt = msg.prompt?.trim();
    const cards = typeof msg.cards === "number" ? msg.cards : 5;
    const branding = msg.branding ?? defaultBranding;
    const accessToken = msg.accessToken?.trim();

    if (!prompt) {
      sendError("Prompt vazio.");
      figma.notify("Prompt vazio.");
      return;
    }

    if (!accessToken) {
      sendError("Sessão inválida. Faça login novamente.");
      figma.notify("Sessão inválida. Faça login novamente.");
      return;
    }

    const creditsCost = getCreditsCost(cards);

    sendStatus("Gerando carrossel com IA...");
    figma.notify(`Gerando carrossel (${creditsCost} crédito(s))...`);

    const response = await requestCarousel({
      prompt,
      cards,
      branding,
      accessToken,
    });

    await createCarouselFrames(response.cards, branding);

    sendSuccess("Carrossel gerado com sucesso.");
    figma.notify("Carrossel criado no canvas com sucesso.");

    figma.ui.postMessage({
      type: "success",
      message: "Carrossel gerado com sucesso.",
      creditsUsed: response.creditsUsed ?? creditsCost,
    });
  } catch (error) {
    console.error("[PLUGIN] Erro ao gerar carrossel:", error);

    const message =
      error instanceof Error ? error.message : "Erro desconhecido ao gerar carrossel.";

    sendError(message);
    figma.notify("Erro ao gerar carrossel.");
  }
};