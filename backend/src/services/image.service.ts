import { logError, logInfo } from "../lib/logger";

import { openai } from "../clients/openai.client";

type GenerateImageInput = {
  prompt: string;
  generationId?: string;
  appUserId?: string;
  cardIndex?: number;
  cardType?: string;
};

export async function generateImage({
  prompt,
  generationId,
  appUserId,
  cardIndex,
  cardType,
}: GenerateImageInput): Promise<string> {
  try {
    logInfo("Iniciando geração de imagem", {
      generationId,
      appUserId,
      cardIndex,
      cardType,
      promptLength: prompt.length,
      flow: "image_generate_start",
      model: "gpt-image-1-mini",
    });

    const response = await openai.images.generate({
      model: "gpt-image-1-mini",
      prompt,
      size: "1024x1024",
      quality: "medium",
    });

    const imageBase64 = response.data?.[0]?.b64_json;

    if (!imageBase64) {
      throw new Error("A OpenAI não retornou imagem.");
    }

    logInfo("Imagem gerada com sucesso", {
      generationId,
      appUserId,
      cardIndex,
      cardType,
      base64Length: imageBase64.length,
      flow: "image_generate_success",
      model: "gpt-image-1-mini",
    });

    return `data:image/png;base64,${imageBase64}`;
  } catch (error) {
    logError("Falha na geração de imagem", error, {
      generationId,
      appUserId,
      cardIndex,
      cardType,
      promptLength: prompt.length,
      flow: "image_generate_error",
      model: "gpt-image-1-mini",
    });

    throw error;
  }
}