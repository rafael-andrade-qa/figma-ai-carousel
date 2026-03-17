import { createImageRect } from "./createImageRect";
import { rgb } from "../../utils/color";

export async function createRoundedImageFrame(
  imageUrl: string | undefined,
  width: number,
  height: number
): Promise<FrameNode> {
  const container = figma.createFrame();
  container.resize(width, height);
  container.cornerRadius = 12;
  container.clipsContent = true;
  container.layoutMode = "NONE";
  container.strokes = [];
  container.fills = [{ type: "SOLID", color: rgb("#DDDDDD") }];

  if (!imageUrl) {
    return container;
  }

  try {
    const imageRect = await createImageRect(imageUrl, width, height, "FILL");
    container.appendChild(imageRect);
  } catch (error) {
    console.error("[PLUGIN] Erro ao criar rounded image frame:", error);
  }

  return container;
}