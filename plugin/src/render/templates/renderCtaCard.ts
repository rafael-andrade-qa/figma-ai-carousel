import { COUNTER_X, COUNTER_Y, FRAME_WIDTH } from "../constants/layout";
import { fitTextByChars, fitTextByWords } from "../../utils/text";

import type { RenderContext } from "../types";
import { createBaseFrame } from "../shared/createBaseFrame";
import { createCounterPill } from "../shared/createCounterPill";
import { createImageRect } from "../shared/createImageRect";
import { createText } from "../shared/createText";
import { rgb } from "../../utils/color";

export async function renderCtaCard(context: RenderContext): Promise<FrameNode> {
  const { card, index, total, branding } = context;

  const frame = createBaseFrame(card.title || "CTA");
  frame.fills = [{ type: "SOLID", color: rgb("#050505") }];

  const topImage = await createImageRect(card.imageUrl, FRAME_WIDTH, 470, "FILL");
  topImage.y = 0;
  frame.appendChild(topImage);

  const fade = figma.createRectangle();
  fade.resize(FRAME_WIDTH, 470);
  fade.fills = [
    {
      type: "SOLID",
      color: rgb("#000000"),
      opacity: 0.22,
    },
  ];
  frame.appendChild(fade);

  frame.appendChild(
    createText({
      text: branding.seriesName,
      fontSize: 16,
      fontStyle: "Regular",
      color: "#ECECEC",
      width: 240,
      x: 34,
      y: 20,
    })
  );

  frame.appendChild(
    createText({
      text: branding.profileHandle,
      fontSize: 16,
      fontStyle: "Regular",
      color: "#ECECEC",
      width: 240,
      x: 700,
      y: 20,
      alignHorizontal: "RIGHT",
    })
  );

  frame.appendChild(createCounterPill(index + 1, total, COUNTER_X, COUNTER_Y, "#3B3B3B"));

  frame.appendChild(
    createText({
      text: fitTextByWords(card.title, 8),
      fontSize: 70,
      fontStyle: "Regular",
      color: "#FFFFFF",
      width: 920,
      x: 80,
      y: 575,
      alignHorizontal: "CENTER",
      lineHeight: 74,
    })
  );

  frame.appendChild(
    createText({
      text: fitTextByChars(card.text, 150),
      fontSize: 28,
      fontStyle: "Bold",
      color: branding.primaryColor,
      width: 860,
      x: 110,
      y: 840,
      alignHorizontal: "CENTER",
      lineHeight: 34,
    })
  );

  const ctaBox = figma.createFrame();
  ctaBox.resize(430, 84);
  ctaBox.x = 325;
  ctaBox.y = 972;
  ctaBox.cornerRadius = 16;
  ctaBox.fills = [{ type: "SOLID", color: rgb(branding.primaryColor) }];
  ctaBox.strokes = [];
  frame.appendChild(ctaBox);

  ctaBox.appendChild(
    createText({
      text: branding.ctaLabel,
      fontSize: 28,
      fontStyle: "Bold",
      color: "#FFFFFF",
      width: 430,
      x: 0,
      y: 24,
      alignHorizontal: "CENTER",
    })
  );

  return frame;
}