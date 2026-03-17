import { openai } from "../clients/openai.client";

type GenerateImageInput = {
  prompt: string;
};

export async function generateImage({
  prompt,
}: GenerateImageInput): Promise<string> {
  const response = await openai.images.generate({
    model: "gpt-image-1-mini",
    prompt,
    size: "1024x1024",
    quality: "medium"
  });

  const imageBase64 = response.data?.[0]?.b64_json;

  if (!imageBase64) {
    throw new Error("A OpenAI não retornou imagem.");
  }

  return `data:image/png;base64,${imageBase64}`;
}