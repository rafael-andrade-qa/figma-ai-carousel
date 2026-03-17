import { fitTextByChars, fitTextByWords } from "../../../utils/text";

import { FRAME_WIDTH } from "../../constants/layout";
import type { SlideRenderer } from "../../../domain/template/types";
import { createBaseFrame } from "../../shared/createBaseFrame";
import { createCounterPill } from "../../shared/createCounterPill";
import { createImageRect } from "../../shared/createImageRect";
import { createText } from "../../shared/createText";
import { rgb } from "../../../utils/color";

function createPill(
  text: string,
  backgroundHex: string,
  colorHex: string,
  width: number,
  x: number,
  y: number
): FrameNode {
  const pill = figma.createFrame();
  pill.resize(width, 46);
  pill.x = x;
  pill.y = y;
  pill.cornerRadius = 999;
  pill.layoutMode = "NONE";
  pill.strokes = [];
  pill.fills = [{ type: "SOLID", color: rgb(backgroundHex) }];

  pill.appendChild(
    createText({
      text,
      fontSize: 16,
      fontStyle: "Bold",
      color: colorHex,
      width,
      x: 0,
      y: 14,
      alignHorizontal: "CENTER",
    })
  );

  return pill;
}

export const mythCtaRenderer: SlideRenderer = {
  async render({ slide, index, total, context }) {
    const frame = createBaseFrame(slide.title || "Myth CTA");
    frame.fills = [{ type: "SOLID", color: rgb("#F8FAFC") }];

    const heroCard = figma.createFrame();
    heroCard.resize(FRAME_WIDTH - 84, 280);
    heroCard.x = 42;
    heroCard.y = 42;
    heroCard.cornerRadius = 28;
    heroCard.layoutMode = "NONE";
    heroCard.clipsContent = true;
    heroCard.strokes = [];
    heroCard.fills = [{ type: "SOLID", color: rgb("#E2E8F0") }];
    frame.appendChild(heroCard);

    const heroImage = await createImageRect(slide.imageUrl, FRAME_WIDTH - 84, 280, "FILL");
    heroCard.appendChild(heroImage);

    const overlay = figma.createRectangle();
    overlay.resize(FRAME_WIDTH - 84, 280);
    overlay.fills = [
      {
        type: "SOLID",
        color: rgb("#FFFFFF"),
        opacity: 0.36,
      },
    ];
    heroCard.appendChild(overlay);

    frame.appendChild(
      createText({
        text: context.branding.brand.seriesName,
        fontSize: 16,
        fontStyle: "Regular",
        color: "#334155",
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
        color: "#334155",
        width: 240,
        x: 778,
        y: 60,
        alignHorizontal: "RIGHT",
      })
    );

    frame.appendChild(createCounterPill(index + 1, total, 908, 54, "#334155"));

    frame.appendChild(createPill("MITO", "#FEE2E2", "#991B1B", 124, 314, 366));
    frame.appendChild(
      createPill("VERDADE", "#DBEAFE", "#1D4ED8", 150, 450, 366)
    );

    frame.appendChild(
      createText({
        text: fitTextByWords(slide.title, 8),
        fontSize: 58,
        fontStyle: "Bold",
        color: "#0F172A",
        width: 860,
        x: 110,
        y: 442,
        alignHorizontal: "CENTER",
        lineHeight: 64,
      })
    );

    frame.appendChild(
      createText({
        text: fitTextByChars(slide.text, 145),
        fontSize: 26,
        fontStyle: "Regular",
        color: "#475569",
        width: 760,
        x: 160,
        y: 642,
        alignHorizontal: "CENTER",
        lineHeight: 36,
      })
    );

    const compareBar = figma.createFrame();
    compareBar.resize(996, 98);
    compareBar.x = 42;
    compareBar.y = 770;
    compareBar.cornerRadius = 22;
    compareBar.layoutMode = "NONE";
    compareBar.strokes = [];
    compareBar.fills = [{ type: "SOLID", color: rgb("#FFFFFF") }];
    frame.appendChild(compareBar);

    const leftHalf = figma.createRectangle();
    leftHalf.resize(498, 98);
    leftHalf.x = 0;
    leftHalf.y = 0;
    leftHalf.cornerRadius = 22;
    leftHalf.fills = [{ type: "SOLID", color: rgb("#FEE2E2") }];
    leftHalf.strokes = [];
    compareBar.appendChild(leftHalf);

    const rightHalf = figma.createRectangle();
    rightHalf.resize(498, 98);
    rightHalf.x = 498;
    rightHalf.y = 0;
    rightHalf.cornerRadius = 22;
    rightHalf.fills = [{ type: "SOLID", color: rgb("#DBEAFE") }];
    rightHalf.strokes = [];
    compareBar.appendChild(rightHalf);

    compareBar.appendChild(
      createText({
        text: "Quebre a objeção",
        fontSize: 24,
        fontStyle: "Bold",
        color: "#991B1B",
        width: 420,
        x: 38,
        y: 34,
      })
    );

    compareBar.appendChild(
      createText({
        text: "Leve para a ação",
        fontSize: 24,
        fontStyle: "Bold",
        color: "#1D4ED8",
        width: 420,
        x: 538,
        y: 34,
        alignHorizontal: "RIGHT",
      })
    );

    const ctaBox = figma.createFrame();
    ctaBox.resize(470, 92);
    ctaBox.x = 305;
    ctaBox.y = 908;
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