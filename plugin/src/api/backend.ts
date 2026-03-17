import type { CarouselBranding } from "../types/branding";
import type { CarouselResponse } from "../types/carousel";

type GenerateCarouselInput = {
  prompt: string;
  cards: number;
  branding: CarouselBranding;
};

export async function requestCarousel(
  input: GenerateCarouselInput
): Promise<CarouselResponse> {
  const response = await fetch("http://localhost:3001/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Backend retornou ${response.status}: ${rawText}`);
  }

  const data = JSON.parse(rawText) as CarouselResponse;

  if (!data.cards || !Array.isArray(data.cards) || data.cards.length === 0) {
    throw new Error("Backend não retornou cards válidos.");
  }

  return data;
}