import { fitTextByChars, fitTextByWords } from "../../../utils/text";

import { FRAME_WIDTH } from "../../constants/layout";
import type { SlideRenderer } from "../../../domain/template/types";
import { createBaseFrame } from "../../shared/createBaseFrame";
import { createCounterPill } from "../../shared/createCounterPill";
import { createImageRect } from "../../shared/createImageRect";
import { createText } from "../../shared/createText";
import { rgb } from "../../../utils/color";

export const authorityCtaRenderer: SlideRenderer = {
  async render({ slide, index, total, context }) {
    const frame = createBaseFrame(slide.title || "Authority CTA");
    frame.fills = [{ type: "SOLID", color: rgb("#050505") }];

    const topImage = await createImageRect(slide.imageUrl, FRAME_WIDTH, 380, "FILL");
    frame.appendChild(topImage);

    const imageOverlay = figma.createRectangle();
    imageOverlay.resize(FRAME_WIDTH, 380);
    imageOverlay.fills = [
      {
        type: "SOLID",
        color: rgb("#000000"),
        opacity: 0.45,
      },
    ];
    frame.appendChild(imageOverlay);

    frame.appendChild(
      createText({
        text: context.branding.brand.seriesName.toUpperCase(),
        fontSize: 16,
        fontStyle: "Regular",
        color: "#E4E4E7",
        width: 300,
        x: 42,
        y: 24,
      })
    );

    frame.appendChild(
      createText({
        text: context.branding.brand.profileHandle,
        fontSize: 16,
        fontStyle: "Regular",
        color: "#E4E4E7",
        width: 240,
        x: 798,
        y: 24,
        alignHorizontal: "RIGHT",
      })
    );

    frame.appendChild(createCounterPill(index + 1, total, 924, 18, "#202024"));

    frame.appendChild(
      createText({
        text: fitTextByWords(slide.title, 7),
        fontSize: 68,
        fontStyle: "Bold",
        color: "#FFFFFF",
        width: 860,
        x: 110,
        y: 458,
        alignHorizontal: "CENTER",
        lineHeight: 74,
      })
    );

    frame.appendChild(
      createText({
        text: fitTextByChars(slide.text, 150),
        fontSize: 28,
        fontStyle: "Regular",
        color: "#D4D4D8",
        width: 780,
        x: 150,
        y: 675,
        alignHorizontal: "CENTER",
        lineHeight: 38,
      })
    );

    const ctaBox = figma.createFrame();
    ctaBox.resize(470, 92);
    ctaBox.x = 305;
    ctaBox.y = 845;
    ctaBox.cornerRadius = 999;
    ctaBox.layoutMode = "NONE";
    ctaBox.strokes = [];
    ctaBox.fills = [{ type: "SOLID", color: rgb(context.branding.colors.primary) }];
    frame.appendChild(ctaBox);

    ctaBox.appendChild(
      createText({
        text: context.branding.cta.label,
        fontSize: 28,
        fontStyle: "Bold",
        color: "#FFFFFF",
        width: 470,
        x: 0,
        y: 27,
        alignHorizontal: "CENTER",
      })
    );

    const bottomLine = figma.createRectangle();
    bottomLine.resize(220, 6);
    bottomLine.x = 430;
    bottomLine.y = 968;
    bottomLine.cornerRadius = 999;
    bottomLine.fills = [{ type: "SOLID", color: rgb(context.branding.colors.primary) }];
    bottomLine.strokes = [];
    frame.appendChild(bottomLine);

    return frame;
  },
};