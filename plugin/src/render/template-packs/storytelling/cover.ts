import { FRAME_HEIGHT, FRAME_WIDTH } from "../../constants/layout";
import { fitTextByChars, fitTextByWords } from "../../../utils/text";

import type { SlideRenderer } from "../../../domain/template/types";
import { createBaseFrame } from "../../shared/createBaseFrame";
import { createCounterPill } from "../../shared/createCounterPill";
import { createImageRect } from "../../shared/createImageRect";
import { createText } from "../../shared/createText";
import { rgb } from "../../../utils/color";

export const storytellingCoverRenderer: SlideRenderer = {
  async render({ slide, index, total, context }) {
    const frame = createBaseFrame(slide.title || "Storytelling Cover");
    frame.fills = [{ type: "SOLID", color: rgb("#111827") }];

    const bgImage = await createImageRect(slide.imageUrl, FRAME_WIDTH, FRAME_HEIGHT, "FILL");
    frame.appendChild(bgImage);

    const overlay = figma.createRectangle();
    overlay.resize(FRAME_WIDTH, FRAME_HEIGHT);
    overlay.fills = [
      {
        type: "SOLID",
        color: rgb("#0F172A"),
        opacity: 0.56,
      },
    ];
    frame.appendChild(overlay);

    const bottomGlow = figma.createRectangle();
    bottomGlow.resize(FRAME_WIDTH, 420);
    bottomGlow.y = 660;
    bottomGlow.fills = [
      {
        type: "SOLID",
        color: rgb("#020617"),
        opacity: 0.42,
      },
    ];
    frame.appendChild(bottomGlow);

    frame.appendChild(
      createText({
        text: context.branding.brand.seriesName,
        fontSize: 17,
        fontStyle: "Regular",
        color: "#E2E8F0",
        width: 320,
        x: 44,
        y: 34,
      })
    );

    frame.appendChild(
      createText({
        text: context.branding.brand.profileHandle,
        fontSize: 17,
        fontStyle: "Regular",
        color: "#E2E8F0",
        width: 240,
        x: 796,
        y: 34,
        alignHorizontal: "RIGHT",
      })
    );

    frame.appendChild(createCounterPill(index + 1, total, 924, 26, "#1E293B"));

    const eyebrow = figma.createFrame();
    eyebrow.resize(188, 42);
    eyebrow.x = 58;
    eyebrow.y = 476;
    eyebrow.cornerRadius = 999;
    eyebrow.layoutMode = "NONE";
    eyebrow.strokes = [];
    eyebrow.fills = [{ type: "SOLID", color: rgb(context.branding.colors.primary) }];
    frame.appendChild(eyebrow);

    eyebrow.appendChild(
      createText({
        text: "CASO / HISTÓRIA",
        fontSize: 16,
        fontStyle: "Bold",
        color: "#FFFFFF",
        width: 188,
        x: 0,
        y: 12,
        alignHorizontal: "CENTER",
      })
    );

    frame.appendChild(
      createText({
        text: fitTextByWords(slide.title, 6),
        fontSize: 82,
        fontStyle: "Bold",
        color: "#FFFFFF",
        width: 900,
        x: 58,
        y: 548,
        lineHeight: 88,
      })
    );

    frame.appendChild(
      createText({
        text: fitTextByChars(slide.text, 110),
        fontSize: 28,
        fontStyle: "Regular",
        color: "#E2E8F0",
        width: 720,
        x: 58,
        y: 866,
        lineHeight: 38,
      })
    );

    return frame;
  },
};