/// <reference types="@figma/plugin-typings" />

import { sendError, sendStatus, sendSuccess } from "./utils/notify";

import type { GenerateCarouselMessage } from "./types/messages";
import { createCarouselFrames } from "./render/createCarouselFrames";
import { defaultBranding } from "./render/config/defaultBranding";
import { requestCarousel } from "./api/backend";

figma.showUI(__html__, { width: 420, height: 520 });

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
    const userEmail = msg.userEmail?.trim();

    if (!prompt) {
      sendError("Prompt vazio.");
      figma.notify("Prompt vazio.");
      return;
    }

    if (!userEmail) {
      sendError("Usuário não identificado.");
      figma.notify("Erro de autenticação.");
      return;
    }

    const creditsCost = getCreditsCost(cards);

    sendStatus("Validando créditos...");

    const data = await requestCarousel({
      prompt,
      cards,
      branding,
      userEmail,
    });

    if ("error" in data) {
      if (data.error === "NO_CREDITS") {
        figma.ui.postMessage({
          type: "error",
          message: "NO_CREDITS",
        });

        figma.notify("Sem créditos suficientes.");
        return;
      }

      throw new Error(data.error);
    }

    sendStatus(`Gerando ${cards} cards...`);

    await createCarouselFrames(data.cards, branding);

    sendSuccess(`Sucesso! ${data.cards.length} frames criados.`);

    figma.ui.postMessage({
      type: "success",
      message: "Carrossel gerado com sucesso.",
      creditsUsed: data.creditsUsed ?? creditsCost,
    });

    figma.notify(`Carrossel criado com ${data.cards.length} cards.`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido no plugin.";

    sendError(message);
    figma.notify("Erro ao gerar carrossel.");
  }
};