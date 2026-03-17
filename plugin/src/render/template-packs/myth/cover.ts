import { fitTextByChars, fitTextByWords } from "../../../utils/text";

import { FRAME_WIDTH } from "../../constants/layout";
import type { SlideRenderer } from "../../../domain/template/types";
import { createBaseFrame } from "../../shared/createBaseFrame";
import { createCounterPill } from "../../shared/createCounterPill";
import { createImageRect } from "../../shared/createImageRect";
import { createText } from "../../shared/createText";
import { rgb } from "../../../utils/color";

function createLabel(
  text: string,
  backgroundHex: string,
  width: number,
  x: number,
  y: number
): FrameNode {
  const tag = figma.createFrame();
  tag.resize(width, 44);
  tag.x = x;
  tag.y = y;
  tag.cornerRadius = 999;
  tag.layoutMode = "NONE";
  tag.strokes = [];
  tag.fills = [{ type: "SOLID", color: rgb(backgroundHex) }];

  tag.appendChild(
    createText({
      text,
      fontSize: 16,
      fontStyle: "Bold",
      color: "#FFFFFF",
      width,
      x: 0,
      y: 13,
      alignHorizontal: "CENTER",
    })
  );

  return tag;
}

export const mythCoverRenderer: SlideRenderer = {
  async render({ slide, index, total, context }) {
    const frame = createBaseFrame(slide.title || "Myth Cover");
    frame.fills = [{ type: "SOLID", color: rgb("#F8FAFC") }];

    const topImage = figma.createFrame();
    topImage.resize(FRAME_WIDTH - 84, 286);
    topImage.x = 42;
    topImage.y = 42;
    topImage.cornerRadius = 28;
    topImage.layoutMode = "NONE";
    topImage.clipsContent = true;
    topImage.strokes = [];
    topImage.fills = [{ type: "SOLID", color: rgb("#E2E8F0") }];
    frame.appendChild(topImage);

    const heroImage = await createImageRect(slide.imageUrl, FRAME_WIDTH - 84, 286, "FILL");
    topImage.appendChild(heroImage);

    const imageOverlay = figma.createRectangle();
    imageOverlay.resize(FRAME_WIDTH - 84, 286);
    imageOverlay.fills = [
      {
        type: "SOLID",
        color: rgb("#FFFFFF"),
        opacity: 0.24,
      },
    ];
    topImage.appendChild(imageOverlay);

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

    frame.appendChild(createLabel("MITO", "#DC2626", 128, 42, 378));
    frame.appendChild(createLabel("VERDADE", context.branding.colors.primary, 156, 182, 378));

    frame.appendChild(
      createText({
        text: fitTextByWords(slide.title, 7),
        fontSize: 66,
        fontStyle: "Bold",
        color: "#0F172A",
        width: 920,
        x: 42,
        y: 446,
        lineHeight: 72,
      })
    );

    const splitCard = figma.createFrame();
    splitCard.resize(FRAME_WIDTH - 84, 318);
    splitCard.x = 42;
    splitCard.y = 674;
    splitCard.cornerRadius = 28;
    splitCard.layoutMode = "NONE";
    splitCard.strokes = [];
    splitCard.fills = [{ type: "SOLID", color: rgb("#FFFFFF") }];
    frame.appendChild(splitCard);

    const leftBlock = figma.createRectangle();
    leftBlock.resize(498, 318);
    leftBlock.x = 0;
    leftBlock.y = 0;
    leftBlock.cornerRadius = 28;
    leftBlock.fills = [{ type: "SOLID", color: rgb("#FEE2E2") }];
    leftBlock.strokes = [];
    splitCard.appendChild(leftBlock);

    const rightBlock = figma.createRectangle();
    rightBlock.resize(498, 318);
    rightBlock.x = 498;
    rightBlock.y = 0;
    rightBlock.cornerRadius = 28;
    rightBlock.fills = [{ type: "SOLID", color: rgb("#DBEAFE") }];
    rightBlock.strokes = [];
    splitCard.appendChild(rightBlock);

    splitCard.appendChild(
      createText({
        text: "Mito",
        fontSize: 28,
        fontStyle: "Bold",
        color: "#991B1B",
        width: 160,
        x: 34,
        y: 34,
      })
    );

    splitCard.appendChild(
      createText({
        text: fitTextByChars(slide.text, 70),
        fontSize: 24,
        fontStyle: "Regular",
        color: "#7F1D1D",
        width: 420,
        x: 34,
        y: 88,
        lineHeight: 32,
      })
    );

    splitCard.appendChild(
      createText({
        text: "Verdade",
        fontSize: 28,
        fontStyle: "Bold",
        color: "#1D4ED8",
        width: 180,
        x: 532,
        y: 34,
      })
    );

    splitCard.appendChild(
      createText({
        text: "A diferença está no contexto, na execução e na estratégia aplicada.",
        fontSize: 24,
        fontStyle: "Regular",
        color: "#1E3A8A",
        width: 420,
        x: 532,
        y: 88,
        lineHeight: 32,
      })
    );

    return frame;
  },
};