import type {
  CarouselResponse,
  GenerateCarouselInput,
  RawCarouselResponse,
} from "../types/carousel.types";
import { enforceCardTypes, enhanceImagePrompt, normalizeCardCount } from "../utils/carousel";

import { generateImage } from "./image.service";
import { openai } from "../clients/openai.client";

export async function generateCarousel({
  prompt,
  cards,
}: GenerateCarouselInput): Promise<CarouselResponse> {
  const totalCards = normalizeCardCount(cards);

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      {
        role: "developer",
        content: `
Você é um gerador profissional de carrosséis para Instagram.
Responda SOMENTE no JSON esperado.
Gere exatamente ${totalCards} cards.
O primeiro card deve ter type = "cover".
O último card deve ter type = "cta".
Todos os intermediários devem ter type = "content".
        `.trim(),
      },
      {
        role: "user",
        content: `Crie um carrossel com ${totalCards} cards com base neste briefing:\n\n${prompt}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "carousel_response",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            cards: {
              type: "array",
              minItems: totalCards,
              maxItems: totalCards,
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  type: {
                    type: "string",
                    enum: ["cover", "content", "cta"],
                  },
                  title: { type: "string" },
                  text: { type: "string" },
                  imagePrompt: { type: "string" },
                },
                required: ["type", "title", "text", "imagePrompt"],
              },
            },
          },
          required: ["cards"],
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("A OpenAI não retornou conteúdo.");
  }

  const parsed = JSON.parse(content) as RawCarouselResponse;
  const normalizedCards = enforceCardTypes(parsed.cards, totalCards);

  const cardsWithImages = await Promise.all(
    normalizedCards.map(async (card) => {
      const imagePrompt = enhanceImagePrompt(card);
      const imageUrl = await generateImage({ prompt: imagePrompt });

      return {
        ...card,
        imagePrompt,
        imageUrl,
      };
    })
  );

  return { cards: cardsWithImages };
}