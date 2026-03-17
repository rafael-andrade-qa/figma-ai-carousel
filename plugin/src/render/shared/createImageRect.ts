import { imageUrlToBytes } from "../../utils/image";
import { rgb } from "../../utils/color";

export async function createImageRect(
  imageUrl: string | undefined,
  width: number,
  height: number,
  scaleMode: "FILL" | "FIT"
): Promise<RectangleNode> {
  const rect = figma.createRectangle();
  rect.resize(width, height);

  if (!imageUrl) {
    rect.fills = [{ type: "SOLID", color: rgb("#1A1A1A") }];
    return rect;
  }

  try {
    const bytes = await imageUrlToBytes(imageUrl);
    const image = figma.createImage(bytes);

    rect.fills = [
      {
        type: "IMAGE",
        imageHash: image.hash,
        scaleMode,
      },
    ];
  } catch (error) {
    console.error("[PLUGIN] Erro ao criar image rect:", error);
    rect.fills = [{ type: "SOLID", color: rgb("#1A1A1A") }];
  }

  return rect;
}