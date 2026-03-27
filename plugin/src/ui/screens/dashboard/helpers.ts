import type { CarouselBranding, CarouselTemplate } from "../../../types/branding";

import type { GenerateCarouselMessage } from "../../../types/messages";
import { getState } from "../../state";

export function getCreditsCost(cards: number) {
  if (cards === 7) {
    return 2;
  }

  return 1;
}

export function getSelectedFormat() {
  return getState().selectedFormat ?? "carousel";
}

export function getGenerateButtonLabel() {
  return getSelectedFormat() === "carousel" ? "Gerar carrossel" : "Gerar peça";
}

export function buildBranding(input: {
  seriesName: string | null | undefined;
  profileHandle: string | null | undefined;
  primaryColor: string | null | undefined;
  template: string | null | undefined;
  ctaLabel: string | null | undefined;
}): CarouselBranding {
  return {
    seriesName: input.seriesName?.trim() || "Nome da Série",
    profileHandle: input.profileHandle?.trim() || "@seuperfil",
    primaryColor: input.primaryColor?.trim() || "#2E7BFF",
    template: (input.template as CarouselTemplate) || "educational",
    ctaLabel: input.ctaLabel?.trim() || "Agende sua consulta",
  };
}

export function validatePrompt(prompt: string) {
  return Boolean(prompt.trim());
}

export function buildGenerateCarouselMessage(input: {
  prompt: string;
  cards: number;
  branding: CarouselBranding;
  accessToken: string;
}): GenerateCarouselMessage {
  return {
    type: "generate-carousel",
    prompt: input.prompt,
    cards: input.cards,
    branding: input.branding,
    accessToken: input.accessToken,
  };
}