/// <reference types="@figma/plugin-typings" />

import { COUNTER_X, COUNTER_Y, FRAME_HEIGHT, FRAME_WIDTH } from "../constants/layout";
import { fitTextByChars, fitTextByWords } from "../../utils/text";

import type { RenderContext } from "../types";
import { createBaseFrame } from "../shared/createBaseFrame";
import { createCounterPill } from "../shared/createCounterPill";
import { createImageRect } from "../shared/createImageRect";
import { createText } from "../shared/createText";
import { rgb } from "../../utils/color";

export async function renderCoverCard(context: RenderContext): Promise<FrameNode> {
  const { card, index, total, branding } = context;

  const frame = createBaseFrame(card.title || "Cover");
  frame.fills = [{ type: "SOLID", color: rgb("#000000") }];

  const bgImage = await createImageRect(card.imageUrl, FRAME_WIDTH, FRAME_HEIGHT, "FILL");
  frame.appendChild(bgImage);

  const overlay = figma.createRectangle();
  overlay.resize(FRAME_WIDTH, FRAME_HEIGHT);
  overlay.fills = [
    {
      type: "SOLID",
      color: rgb("#000000"),
      opacity: 0.42,
    },
  ];
  frame.appendChild(overlay);

  frame.appendChild(
    createText({
      text: branding.seriesName,
      fontSize: 20,
      fontStyle: "Regular",
      color: "#ECECEC",
      width: 300,
      x: 36,
      y: 24,
    })
  );

  frame.appendChild(
    createText({
      text: branding.profileHandle,
      fontSize: 20,
      fontStyle: "Regular",
      color: "#ECECEC",
      width: 220,
      x: 720,
      y: 24,
      alignHorizontal: "RIGHT",
    })
  );

  frame.appendChild(createCounterPill(index + 1, total, COUNTER_X, COUNTER_Y, "#2F2F2F"));

  frame.appendChild(
    createText({
      text: fitTextByWords(card.title, 7),
      fontSize: 82,
      fontStyle: "Bold",
      color: "#FFFFFF",
      width: 930,
      x: 42,
      y: 625,
      lineHeight: 84,
    })
  );

  frame.appendChild(
    createText({
      text: fitTextByChars(card.text, 110),
      fontSize: 30,
      fontStyle: "Regular",
      color: branding.primaryColor,
      width: 900,
      x: 90,
      y: 905,
      alignHorizontal: "CENTER",
      lineHeight: 36,
    })
  );

  return frame;
}