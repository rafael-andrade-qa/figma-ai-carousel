import { fitTextByChars, fitTextByWords } from "../../../utils/text";

import { FRAME_WIDTH } from "../../constants/layout";
import type { SlideRenderer } from "../../../domain/template/types";
import { createBaseFrame } from "../../shared/createBaseFrame";
import { createCounterPill } from "../../shared/createCounterPill";
import { createImageRect } from "../../shared/createImageRect";
import { createText } from "../../shared/createText";
import { rgb } from "../../../utils/color";

function createCheckBadge(colorHex: string, x: number, y: number): FrameNode {
  const badge = figma.createFrame();
  badge.resize(74, 74);
  badge.x = x;
  badge.y = y;
  badge.cornerRadius = 20;
  badge.layoutMode = "NONE";
  badge.strokes = [];
  badge.fills = [{ type: "SOLID", color: rgb(colorHex) }];

  const text = figma.createText();
  text.fontName = { family: "Inter", style: "Bold" };
  text.characters = "✓";
  text.fontSize = 34;
  text.fills = [{ type: "SOLID", color: rgb("#FFFFFF") }];
  text.resize(74, text.height);
  text.textAlignHorizontal = "CENTER";
  text.x = 0;
  text.y = 18;
  badge.appendChild(text);

  return badge;
}

export const checklistCoverRenderer: SlideRenderer = {
  async render({ slide, index, total, context }) {
    const frame = createBaseFrame(slide.title || "Checklist Cover");
    frame.fills = [{ type: "SOLID", color: rgb("#F8FAFC") }];

    frame.appendChild(
      createText({
        text: context.branding.brand.seriesName,
        fontSize: 16,
        fontStyle: "Regular",
        color: "#64748B",
        width: 260,
        x: 42,
        y: 30,
      })
    );

    frame.appendChild(
      createText({
        text: context.branding.brand.profileHandle,
        fontSize: 16,
        fontStyle: "Regular",
        color: "#64748B",
        width: 240,
        x: 798,
        y: 30,
        alignHorizontal: "RIGHT",
      })
    );

    frame.appendChild(createCounterPill(index + 1, total, 924, 20, "#CBD5E1"));

    const titleCard = figma.createFrame();
    titleCard.resize(616, 430);
    titleCard.x = 42;
    titleCard.y = 120;
    titleCard.cornerRadius = 28;
    titleCard.layoutMode = "NONE";
    titleCard.strokes = [];
    titleCard.fills = [{ type: "SOLID", color: rgb("#FFFFFF") }];
    frame.appendChild(titleCard);

    titleCard.appendChild(createCheckBadge(context.branding.colors.primary, 28, 28));

    titleCard.appendChild(
      createText({
        text: fitTextByWords(slide.title, 7),
        fontSize: 70,
        fontStyle: "Bold",
        color: "#0F172A",
        width: 500,
        x: 108,
        y: 34,
        lineHeight: 76,
      })
    );

    titleCard.appendChild(
      createText({
        text: fitTextByChars(slide.text, 110),
        fontSize: 24,
        fontStyle: "Regular",
        color: "#475569",
        width: 520,
        x: 28,
        y: 278,
        lineHeight: 34,
      })
    );

    const imageCard = figma.createFrame();
    imageCard.resize(338, 430);
    imageCard.x = 700;
    imageCard.y = 120;
    imageCard.cornerRadius = 28;
    imageCard.layoutMode = "NONE";
    imageCard.clipsContent = true;
    imageCard.strokes = [];
    imageCard.fills = [{ type: "SOLID", color: rgb("#E2E8F0") }];
    frame.appendChild(imageCard);

    const image = await createImageRect(slide.imageUrl, 338, 430, "FILL");
    imageCard.appendChild(image);

    const checklistPanel = figma.createFrame();
    checklistPanel.resize(FRAME_WIDTH - 84, 340);
    checklistPanel.x = 42;
    checklistPanel.y = 620;
    checklistPanel.cornerRadius = 26;
    checklistPanel.layoutMode = "NONE";
    checklistPanel.strokes = [];
    checklistPanel.fills = [{ type: "SOLID", color: rgb("#E2E8F0") }];
    frame.appendChild(checklistPanel);

    const items = [
      "Gancho claro no primeiro slide",
      "Passos objetivos e escaneáveis",
      "Mensagem direta no CTA",
    ];

    items.forEach((item, itemIndex) => {
      const row = figma.createFrame();
      row.resize(932, 78);
      row.x = 32;
      row.y = 34 + itemIndex * 94;
      row.cornerRadius = 20;
      row.layoutMode = "NONE";
      row.strokes = [];
      row.fills = [{ type: "SOLID", color: rgb("#FFFFFF") }];
      checklistPanel.appendChild(row);

      row.appendChild(createCheckBadge(context.branding.colors.primary, 16, 2));

      row.appendChild(
        createText({
          text: item,
          fontSize: 24,
          fontStyle: "Bold",
          color: "#0F172A",
          width: 790,
          x: 104,
          y: 24,
        })
      );
    });

    return frame;
  },
};