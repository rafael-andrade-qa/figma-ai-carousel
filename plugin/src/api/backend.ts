import type { CarouselBranding } from "../types/branding";
import type { CarouselResponse } from "../types/carousel";

type GenerateCarouselInput = {
  prompt: string;
  cards: number;
  branding: CarouselBranding;
  userEmail: string;
};

type ErrorResponse = {
  error: string;
};

export async function requestCarousel(
  input: GenerateCarouselInput
): Promise<CarouselResponse | ErrorResponse> {
  const response = await fetch("http://localhost:3001/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const rawText = await response.text();
  const data = JSON.parse(rawText) as CarouselResponse | ErrorResponse;

  if (!response.ok) {
    if ("error" in data) {
      return data;
    }

    throw new Error(`Backend retornou ${response.status}: ${rawText}`);
  }

  if ("error" in data) {
    return data;
  }

  if (!data.cards || !Array.isArray(data.cards) || data.cards.length === 0) {
    throw new Error("Backend não retornou cards válidos.");
  }

  return data;
}