import type { CarouselCardType, RawCarouselCard } from "../types/carousel.types";

export function normalizeCardCount(cards: number): number {
  if (!Number.isFinite(cards)) return 5;
  if (cards < 3) return 3;
  if (cards > 10) return 10;
  return Math.floor(cards);
}

export function enforceCardTypes(
  cards: RawCarouselCard[],
  totalCards: number
): RawCarouselCard[] {
  return cards.map((card, index) => {
    let type: CarouselCardType = "content";

    if (index === 0) type = "cover";
    else if (index === totalCards - 1) type = "cta";

    return { ...card, type };
  });
}

export function enhanceImagePrompt(card: RawCarouselCard): string {
  const base =
    "square instagram composition, professional editorial photography, realistic, high quality, clean framing, no text, no typography, no watermark, no collage";

  if (card.type === "cover") {
    return `${card.imagePrompt}, ${base}, cinematic lighting, emotionally strong subject, clear focal point, centered composition, suitable for headline overlay`;
  }

  if (card.type === "cta") {
    return `${card.imagePrompt}, ${base}, positive outcome, professional atmosphere, visually clean, suitable for CTA slide, balanced composition`;
  }

  return `${card.imagePrompt}, ${base}, bright clean scene, contextual subject, suitable for educational instagram carousel, safe composition for crop`;
}