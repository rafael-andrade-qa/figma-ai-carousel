import { FRAME_HEIGHT, FRAME_WIDTH } from "../../constants/layout";
import { fitTextByChars, fitTextByWords } from "../../../utils/text";

import type { SlideRenderer } from "../../../domain/template/types";
import { createBaseFrame } from "../../shared/createBaseFrame";
import { createCounterPill } from "../../shared/createCounterPill";
import { createImageRect } from "../../shared/createImageRect";
import { createText } from "../../shared/createText";
import { rgb } from "../../../utils/color";

export const authorityCoverRenderer: SlideRenderer = {
  async render({ slide, index, total, context }) {
    const frame = createBaseFrame(slide.title || "Authority Cover");
    frame.fills = [{ type: "SOLID", color: rgb("#050505") }];

    const bgImage = await createImageRect(slide.imageUrl, FRAME_WIDTH, FRAME_HEIGHT, "FILL");
    frame.appendChild(bgImage);

    const darkOverlay = figma.createRectangle();
    darkOverlay.resize(FRAME_WIDTH, FRAME_HEIGHT);
    darkOverlay.fills = [
      {
        type: "SOLID",
        color: rgb("#000000"),
        opacity: 0.62,
      },
    ];
    frame.appendChild(darkOverlay);

    const gradientBand = figma.createRectangle();
    gradientBand.resize(FRAME_WIDTH, 260);
    gradientBand.y = FRAME_HEIGHT - 260;
    gradientBand.fills = [
      {
        type: "SOLID",
        color: rgb("#000000"),
        opacity: 0.28,
      },
    ];
    frame.appendChild(gradientBand);

    frame.appendChild(
      createText({
        text: context.branding.brand.seriesName.toUpperCase(),
        fontSize: 18,
        fontStyle: "Regular",
        color: "#D4D4D8",
        width: 320,
        x: 44,
        y: 34,
      })
    );

    frame.appendChild(
      createText({
        text: context.branding.brand.profileHandle,
        fontSize: 18,
        fontStyle: "Regular",
        color: "#D4D4D8",
        width: 240,
        x: 796,
        y: 34,
        alignHorizontal: "RIGHT",
      })
    );

    frame.appendChild(createCounterPill(index + 1, total, 924, 26, "#18181B"));

    const accentLine = figma.createRectangle();
    accentLine.resize(180, 8);
    accentLine.x = 58;
    accentLine.y = 470;
    accentLine.cornerRadius = 999;
    accentLine.fills = [{ type: "SOLID", color: rgb(context.branding.colors.primary) }];
    accentLine.strokes = [];
    frame.appendChild(accentLine);

    frame.appendChild(
      createText({
        text: fitTextByWords(slide.title, 6),
        fontSize: 88,
        fontStyle: "Bold",
        color: "#FFFFFF",
        width: 920,
        x: 58,
        y: 505,
        lineHeight: 92,
      })
    );

    frame.appendChild(
      createText({
        text: fitTextByChars(slide.text, 120),
        fontSize: 28,
        fontStyle: "Regular",
        color: "#E4E4E7",
        width: 760,
        x: 58,
        y: 820,
        lineHeight: 38,
      })
    );

    return frame;
  },
};