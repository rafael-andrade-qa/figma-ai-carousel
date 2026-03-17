import { COUNTER_X, COUNTER_Y } from "../constants/layout";
import { fitTextByChars, fitTextByWords } from "../../utils/text";

import type { RenderContext } from "../types";
import { createBaseFrame } from "../shared/createBaseFrame";
import { createCounterPill } from "../shared/createCounterPill";
import { createRoundedImageFrame } from "../shared/createRoundedImageFrame";
import { createText } from "../shared/createText";
import { rgb } from "../../utils/color";

export async function renderContentCard(context: RenderContext): Promise<FrameNode> {
  const { card, index, total, branding } = context;

  const frame = createBaseFrame(card.title || "Content");
  frame.fills = [{ type: "SOLID", color: rgb("#ECECEC") }];

  frame.appendChild(
    createText({
      text: branding.seriesName,
      fontSize: 16,
      fontStyle: "Regular",
      color: "#666666",
      width: 240,
      x: 34,
      y: 28,
    })
  );

  frame.appendChild(
    createText({
      text: branding.profileHandle,
      fontSize: 16,
      fontStyle: "Regular",
      color: "#666666",
      width: 240,
      x: 700,
      y: 28,
      alignHorizontal: "RIGHT",
    })
  );

  frame.appendChild(createCounterPill(index + 1, total, COUNTER_X, COUNTER_Y, "#707070"));

  frame.appendChild(
    createText({
      text: fitTextByWords(card.title, 8),
      fontSize: 74,
      fontStyle: "Bold",
      color: branding.primaryColor,
      width: 920,
      x: 42,
      y: 110,
      lineHeight: 78,
    })
  );

  const imageFrame = await createRoundedImageFrame(card.imageUrl, 1000, 500);
  imageFrame.x = 40;
  imageFrame.y = 355;
  frame.appendChild(imageFrame);

  frame.appendChild(
    createText({
      text: fitTextByChars(card.text, 165),
      fontSize: 28,
      fontStyle: "Regular",
      color: "#8A8A8A",
      width: 930,
      x: 42,
      y: 892,
      lineHeight: 38,
    })
  );

  return frame;
}