import { fitTextByChars, fitTextByWords } from "../../../utils/text";

import { FRAME_WIDTH } from "../../constants/layout";
import type { SlideRenderer } from "../../../domain/template/types";
import { createBaseFrame } from "../../shared/createBaseFrame";
import { createCounterPill } from "../../shared/createCounterPill";
import { createImageRect } from "../../shared/createImageRect";
import { createText } from "../../shared/createText";
import { rgb } from "../../../utils/color";

export const storytellingCtaRenderer: SlideRenderer = {
  async render({ slide, index, total, context }) {
    const frame = createBaseFrame(slide.title || "Storytelling CTA");
    frame.fills = [{ type: "SOLID", color: rgb("#0F172A") }];

    const imageBand = figma.createFrame();
    imageBand.resize(FRAME_WIDTH - 84, 332);
    imageBand.x = 42;
    imageBand.y = 42;
    imageBand.cornerRadius = 28;
    imageBand.layoutMode = "NONE";
    imageBand.clipsContent = true;
    imageBand.strokes = [];
    imageBand.fills = [{ type: "SOLID", color: rgb("#1E293B") }];
    frame.appendChild(imageBand);

    const heroImage = await createImageRect(slide.imageUrl, FRAME_WIDTH - 84, 332, "FILL");
    imageBand.appendChild(heroImage);

    const overlay = figma.createRectangle();
    overlay.resize(FRAME_WIDTH - 84, 332);
    overlay.fills = [
      {
        type: "SOLID",
        color: rgb("#020617"),
        opacity: 0.46,
      },
    ];
    imageBand.appendChild(overlay);

    frame.appendChild(
      createText({
        text: context.branding.brand.seriesName,
        fontSize: 16,
        fontStyle: "Regular",
        color: "#E2E8F0",
        width: 280,
        x: 60,
        y: 62,
      })
    );

    frame.appendChild(
      createText({
        text: context.branding.brand.profileHandle,
        fontSize: 16,
        fontStyle: "Regular",
        color: "#E2E8F0",
        width: 240,
        x: 778,
        y: 62,
        alignHorizontal: "RIGHT",
      })
    );

    frame.appendChild(createCounterPill(index + 1, total, 908, 54, "#1E293B"));

    frame.appendChild(
      createText({
        text: fitTextByWords(slide.title, 8),
        fontSize: 64,
        fontStyle: "Bold",
        color: "#FFFFFF",
        width: 860,
        x: 110,
        y: 430,
        alignHorizontal: "CENTER",
        lineHeight: 70,
      })
    );

    frame.appendChild(
      createText({
        text: fitTextByChars(slide.text, 150),
        fontSize: 28,
        fontStyle: "Regular",
        color: "#CBD5E1",
        width: 760,
        x: 160,
        y: 642,
        alignHorizontal: "CENTER",
        lineHeight: 38,
      })
    );

    const ctaBox = figma.createFrame();
    ctaBox.resize(470, 92);
    ctaBox.x = 305;
    ctaBox.y = 842;
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

    frame.appendChild(
      createText({
        text: "Toda boa história termina em ação.",
        fontSize: 20,
        fontStyle: "Regular",
        color: "#94A3B8",
        width: 500,
        x: 290,
        y: 962,
        alignHorizontal: "CENTER",
      })
    );

    return frame;
  },
};