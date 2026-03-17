import { fitTextByChars, fitTextByWords } from "../../../utils/text";

import type { SlideRenderer } from "../../../domain/template/types";
import { createBaseFrame } from "../../shared/createBaseFrame";
import { createCounterPill } from "../../shared/createCounterPill";
import { createRoundedImageFrame } from "../../shared/createRoundedImageFrame";
import { createText } from "../../shared/createText";
import { rgb } from "../../../utils/color";

function createStepCard(
  stepNumber: number,
  text: string,
  colorHex: string,
  y: number
): FrameNode {
  const card = figma.createFrame();
  card.resize(470, 150);
  card.x = 42;
  card.y = y;
  card.cornerRadius = 24;
  card.layoutMode = "NONE";
  card.strokes = [];
  card.fills = [{ type: "SOLID", color: rgb("#FFFFFF") }];

  const badge = figma.createFrame();
  badge.resize(64, 64);
  badge.x = 22;
  badge.y = 22;
  badge.cornerRadius = 18;
  badge.layoutMode = "NONE";
  badge.strokes = [];
  badge.fills = [{ type: "SOLID", color: rgb(colorHex) }];
  card.appendChild(badge);

  const badgeText = figma.createText();
  badgeText.fontName = { family: "Inter", style: "Bold" };
  badgeText.characters = String(stepNumber).padStart(2, "0");
  badgeText.fontSize = 24;
  badgeText.fills = [{ type: "SOLID", color: rgb("#FFFFFF") }];
  badgeText.resize(64, badgeText.height);
  badgeText.textAlignHorizontal = "CENTER";
  badgeText.x = 0;
  badgeText.y = 19;
  badge.appendChild(badgeText);

  card.appendChild(
    createText({
      text,
      fontSize: 24,
      fontStyle: "Bold",
      color: "#0F172A",
      width: 340,
      x: 104,
      y: 30,
      lineHeight: 30,
    })
  );

  return card;
}

export const checklistContentRenderer: SlideRenderer = {
  async render({ slide, index, total, context }) {
    const frame = createBaseFrame(slide.title || "Checklist Content");
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

    frame.appendChild(
      createText({
        text: fitTextByWords(slide.title, 8),
        fontSize: 58,
        fontStyle: "Bold",
        color: "#0F172A",
        width: 960,
        x: 42,
        y: 110,
        lineHeight: 64,
      })
    );

    const steps = [
      fitTextByChars(slide.text, 44),
      "Revise a clareza do gancho antes de publicar.",
      "Finalize com CTA simples e acionável.",
    ];

    frame.appendChild(createStepCard(1, steps[0], context.branding.colors.primary, 250));
    frame.appendChild(createStepCard(2, steps[1], context.branding.colors.primary, 422));
    frame.appendChild(createStepCard(3, steps[2], context.branding.colors.primary, 594));

    const imageFrame = await createRoundedImageFrame(slide.imageUrl, 446, 494);
    imageFrame.x = 592;
    imageFrame.y = 250;
    imageFrame.cornerRadius = 28;
    frame.appendChild(imageFrame);

    const noteCard = figma.createFrame();
    noteCard.resize(446, 220);
    noteCard.x = 592;
    noteCard.y = 780;
    noteCard.cornerRadius = 24;
    noteCard.layoutMode = "NONE";
    noteCard.strokes = [];
    noteCard.fills = [{ type: "SOLID", color: rgb("#E2E8F0") }];
    frame.appendChild(noteCard);

    noteCard.appendChild(
      createText({
        text: "Checklist útil",
        fontSize: 22,
        fontStyle: "Bold",
        color: "#0F172A",
        width: 180,
        x: 24,
        y: 24,
      })
    );

    noteCard.appendChild(
      createText({
        text: "Esse formato funciona muito bem para posts salváveis, operacionais e orientados à execução.",
        fontSize: 24,
        fontStyle: "Regular",
        color: "#475569",
        width: 390,
        x: 24,
        y: 64,
        lineHeight: 32,
      })
    );

    return frame;
  },
};