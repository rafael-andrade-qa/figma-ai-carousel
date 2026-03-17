import { fitTextByChars, fitTextByWords } from "../../../utils/text";

import { FRAME_WIDTH } from "../../constants/layout";
import type { SlideRenderer } from "../../../domain/template/types";
import { createBaseFrame } from "../../shared/createBaseFrame";
import { createCounterPill } from "../../shared/createCounterPill";
import { createImageRect } from "../../shared/createImageRect";
import { createText } from "../../shared/createText";
import { rgb } from "../../../utils/color";

export const educationalCtaRenderer: SlideRenderer = {
  async render({ slide, index, total, context }) {
    const frame = createBaseFrame(slide.title || "Educational CTA");
    frame.fills = [{ type: "SOLID", color: rgb("#F8FAFC") }];

    const heroCard = figma.createFrame();
    heroCard.resize(FRAME_WIDTH - 84, 300);
    heroCard.x = 42;
    heroCard.y = 42;
    heroCard.cornerRadius = 28;
    heroCard.layoutMode = "NONE";
    heroCard.clipsContent = true;
    heroCard.strokes = [];
    heroCard.fills = [{ type: "SOLID", color: rgb("#E2E8F0") }];
    frame.appendChild(heroCard);

    const heroImage = await createImageRect(slide.imageUrl, FRAME_WIDTH - 84, 300, "FILL");
    heroCard.appendChild(heroImage);

    const heroOverlay = figma.createRectangle();
    heroOverlay.resize(FRAME_WIDTH - 84, 300);
    heroOverlay.fills = [
      {
        type: "SOLID",
        color: rgb("#FFFFFF"),
        opacity: 0.48,
      },
    ];
    heroCard.appendChild(heroOverlay);

    frame.appendChild(
      createText({
        text: context.branding.brand.seriesName,
        fontSize: 16,
        fontStyle: "Regular",
        color: "#475569",
        width: 260,
        x: 60,
        y: 60,
      })
    );

    frame.appendChild(
      createText({
        text: context.branding.brand.profileHandle,
        fontSize: 16,
        fontStyle: "Regular",
        color: "#475569",
        width: 240,
        x: 778,
        y: 60,
        alignHorizontal: "RIGHT",
      })
    );

    frame.appendChild(createCounterPill(index + 1, total, 908, 54, "#CBD5E1"));

    frame.appendChild(
      createText({
        text: fitTextByWords(slide.title, 8),
        fontSize: 62,
        fontStyle: "Bold",
        color: "#0F172A",
        width: 860,
        x: 110,
        y: 392,
        alignHorizontal: "CENTER",
        lineHeight: 68,
      })
    );

    frame.appendChild(
      createText({
        text: fitTextByChars(slide.text, 150),
        fontSize: 28,
        fontStyle: "Regular",
        color: "#475569",
        width: 760,
        x: 160,
        y: 592,
        alignHorizontal: "CENTER",
        lineHeight: 38,
      })
    );

    const ctaBox = figma.createFrame();
    ctaBox.resize(480, 94);
    ctaBox.x = 300;
    ctaBox.y = 820;
    ctaBox.cornerRadius = 22;
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
        width: 480,
        x: 0,
        y: 27,
        alignHorizontal: "CENTER",
      })
    );

    const footerCard = figma.createFrame();
    footerCard.resize(996, 78);
    footerCard.x = 42;
    footerCard.y = 944;
    footerCard.cornerRadius = 18;
    footerCard.layoutMode = "NONE";
    footerCard.strokes = [];
    footerCard.fills = [{ type: "SOLID", color: rgb("#E2E8F0") }];
    frame.appendChild(footerCard);

    footerCard.appendChild(
      createText({
        text: "Use uma chamada objetiva e fácil de executar para aumentar conversão.",
        fontSize: 20,
        fontStyle: "Regular",
        color: "#475569",
        width: 930,
        x: 33,
        y: 25,
        alignHorizontal: "CENTER",
      })
    );

    return frame;
  },
};