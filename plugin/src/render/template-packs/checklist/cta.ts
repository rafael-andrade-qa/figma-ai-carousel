import { fitTextByChars, fitTextByWords } from "../../../utils/text";

import { FRAME_WIDTH } from "../../constants/layout";
import type { SlideRenderer } from "../../../domain/template/types";
import { createBaseFrame } from "../../shared/createBaseFrame";
import { createCounterPill } from "../../shared/createCounterPill";
import { createImageRect } from "../../shared/createImageRect";
import { createText } from "../../shared/createText";
import { rgb } from "../../../utils/color";

function createMiniCheck(colorHex: string, x: number, y: number): FrameNode {
  const badge = figma.createFrame();
  badge.resize(54, 54);
  badge.x = x;
  badge.y = y;
  badge.cornerRadius = 16;
  badge.layoutMode = "NONE";
  badge.strokes = [];
  badge.fills = [{ type: "SOLID", color: rgb(colorHex) }];

  const text = figma.createText();
  text.fontName = { family: "Inter", style: "Bold" };
  text.characters = "✓";
  text.fontSize = 28;
  text.fills = [{ type: "SOLID", color: rgb("#FFFFFF") }];
  text.resize(54, text.height);
  text.textAlignHorizontal = "CENTER";
  text.x = 0;
  text.y = 11;
  badge.appendChild(text);

  return badge;
}

export const checklistCtaRenderer: SlideRenderer = {
  async render({ slide, index, total, context }) {
    const frame = createBaseFrame(slide.title || "Checklist CTA");
    frame.fills = [{ type: "SOLID", color: rgb("#F8FAFC") }];

    const topCard = figma.createFrame();
    topCard.resize(FRAME_WIDTH - 84, 260);
    topCard.x = 42;
    topCard.y = 42;
    topCard.cornerRadius = 28;
    topCard.layoutMode = "NONE";
    topCard.clipsContent = true;
    topCard.strokes = [];
    topCard.fills = [{ type: "SOLID", color: rgb("#E2E8F0") }];
    frame.appendChild(topCard);

    const image = await createImageRect(slide.imageUrl, FRAME_WIDTH - 84, 260, "FILL");
    topCard.appendChild(image);

    const overlay = figma.createRectangle();
    overlay.resize(FRAME_WIDTH - 84, 260);
    overlay.fills = [
      {
        type: "SOLID",
        color: rgb("#FFFFFF"),
        opacity: 0.42,
      },
    ];
    topCard.appendChild(overlay);

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
        fontSize: 58,
        fontStyle: "Bold",
        color: "#0F172A",
        width: 860,
        x: 110,
        y: 360,
        alignHorizontal: "CENTER",
        lineHeight: 64,
      })
    );

    frame.appendChild(
      createText({
        text: fitTextByChars(slide.text, 150),
        fontSize: 26,
        fontStyle: "Regular",
        color: "#475569",
        width: 760,
        x: 160,
        y: 548,
        alignHorizontal: "CENTER",
        lineHeight: 36,
      })
    );

    const proofCard = figma.createFrame();
    proofCard.resize(996, 134);
    proofCard.x = 42;
    proofCard.y = 690;
    proofCard.cornerRadius = 24;
    proofCard.layoutMode = "NONE";
    proofCard.strokes = [];
    proofCard.fills = [{ type: "SOLID", color: rgb("#FFFFFF") }];
    frame.appendChild(proofCard);

    proofCard.appendChild(createMiniCheck(context.branding.colors.primary, 24, 18));
    proofCard.appendChild(createMiniCheck(context.branding.colors.primary, 24, 74));
    proofCard.appendChild(
      createText({
        text: "CTA claro e direto",
        fontSize: 24,
        fontStyle: "Bold",
        color: "#0F172A",
        width: 300,
        x: 96,
        y: 22,
      })
    );
    proofCard.appendChild(
      createText({
        text: "Próximo passo fácil de executar",
        fontSize: 24,
        fontStyle: "Bold",
        color: "#0F172A",
        width: 420,
        x: 96,
        y: 78,
      })
    );

    const ctaBox = figma.createFrame();
    ctaBox.resize(470, 92);
    ctaBox.x = 305;
    ctaBox.y = 876;
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
        width: 470,
        x: 0,
        y: 27,
        alignHorizontal: "CENTER",
      })
    );

    return frame;
  },
};