import type {
  CarouselResponse,
  GenerateCarouselInput,
  RawCarouselResponse,
} from "../types/carousel.types";
import {
  enforceCardTypes,
  enhanceImagePrompt,
  normalizeCardCount,
} from "../utils/carousel";
import { logError, logInfo } from "../lib/logger";

import { generateImage } from "./image.service";
import { openai } from "../clients/openai.client";

export async function generateCarousel({
  prompt,
  cards,
  generationId,
  appUserId,
  authUserId,
  userEmail,
}: GenerateCarouselInput): Promise<CarouselResponse> {
  const totalCards = normalizeCardCount(cards);

  try {
    logInfo("Iniciando geração de carrossel", {
      generationId,
      appUserId,
      authUserId,
      userEmail,
      requestedCards: cards,
      totalCards,
      promptLength: prompt.length,
      flow: "carousel_generate_start",
      model: "gpt-5-mini",
    });

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

    logInfo("Resposta textual do carrossel recebida", {
      generationId,
      appUserId,
      authUserId,
      userEmail,
      totalCards,
      contentLength: content.length,
      flow: "carousel_text_success",
      model: "gpt-5-mini",
    });

    const parsed = JSON.parse(content) as RawCarouselResponse;
    const normalizedCards = enforceCardTypes(parsed.cards, totalCards);

    logInfo("Cards normalizados com sucesso", {
      generationId,
      appUserId,
      authUserId,
      userEmail,
      totalCards,
      normalizedCardsCount: normalizedCards.length,
      cardTypes: normalizedCards.map((card) => card.type),
      flow: "carousel_cards_normalized",
    });

    const cardsWithImages = await Promise.all(
      normalizedCards.map(async (card, index) => {
        const imagePrompt = enhanceImagePrompt(card);

        logInfo("Preparando imagem do card", {
          generationId,
          appUserId,
          authUserId,
          userEmail,
          cardIndex: index,
          cardType: card.type,
          titleLength: card.title.length,
          textLength: card.text.length,
          imagePromptLength: imagePrompt.length,
          flow: "carousel_card_image_prepare",
        });

        const imageUrl = await generateImage({
          prompt: imagePrompt,
          generationId,
          appUserId,
          cardIndex: index,
          cardType: card.type,
        });

        return {
          ...card,
          imagePrompt,
          imageUrl,
        };
      })
    );

    logInfo("Carrossel final gerado com sucesso", {
      generationId,
      appUserId,
      authUserId,
      userEmail,
      totalCards,
      cardsWithImagesCount: cardsWithImages.length,
      flow: "carousel_generate_success",
    });

    return { cards: cardsWithImages };
  } catch (error) {
    logError("Falha na geração do carrossel", error, {
      generationId,
      appUserId,
      authUserId,
      userEmail,
      requestedCards: cards,
      totalCards,
      promptLength: prompt.length,
      flow: "carousel_generate_error",
      model: "gpt-5-mini",
    });

    throw error;
  }
}