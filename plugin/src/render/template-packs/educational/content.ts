import { fitTextByChars, fitTextByWords } from "../../../utils/text";

import type { SlideRenderer } from "../../../domain/template/types";
import { createBaseFrame } from "../../shared/createBaseFrame";
import { createCounterPill } from "../../shared/createCounterPill";
import { createRoundedImageFrame } from "../../shared/createRoundedImageFrame";
import { createText } from "../../shared/createText";
import { rgb } from "../../../utils/color";

export const educationalContentRenderer: SlideRenderer = {
  async render({ slide, index, total, context }) {
    const frame = createBaseFrame(slide.title || "Educational Content");
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
        fontSize: 62,
        fontStyle: "Bold",
        color: "#0F172A",
        width: 920,
        x: 42,
        y: 110,
        lineHeight: 68,
      })
    );

    const textCard = figma.createFrame();
    textCard.resize(474, 610);
    textCard.x = 42;
    textCard.y = 238;
    textCard.cornerRadius = 28;
    textCard.layoutMode = "NONE";
    textCard.clipsContent = true;
    textCard.strokes = [];
    textCard.fills = [{ type: "SOLID", color: rgb("#FFFFFF") }];
    frame.appendChild(textCard);

    const topLine = figma.createRectangle();
    topLine.resize(474, 10);
    topLine.x = 0;
    topLine.y = 0;
    topLine.fills = [{ type: "SOLID", color: rgb(context.branding.colors.primary) }];
    topLine.strokes = [];
    textCard.appendChild(topLine);

    textCard.appendChild(
      createText({
        text: fitTextByChars(slide.text, 240),
        fontSize: 28,
        fontStyle: "Regular",
        color: "#475569",
        width: 386,
        x: 44,
        y: 46,
        lineHeight: 38,
      })
    );

    const imageFrame = await createRoundedImageFrame(slide.imageUrl, 522, 610);
    imageFrame.x = 556;
    imageFrame.y = 238;
    imageFrame.cornerRadius = 28;
    frame.appendChild(imageFrame);

    const hintCard = figma.createFrame();
    hintCard.resize(996, 132);
    hintCard.x = 42;
    hintCard.y = 890;
    hintCard.cornerRadius = 24;
    hintCard.layoutMode = "NONE";
    hintCard.strokes = [];
    hintCard.fills = [{ type: "SOLID", color: rgb("#E2E8F0") }];
    frame.appendChild(hintCard);

    hintCard.appendChild(
      createText({
        text: "Resumo prático",
        fontSize: 20,
        fontStyle: "Bold",
        color: "#0F172A",
        width: 180,
        x: 24,
        y: 22,
      })
    );

    hintCard.appendChild(
      createText({
        text: "Organize a informação em blocos curtos para aumentar leitura, retenção e salvamentos.",
        fontSize: 22,
        fontStyle: "Regular",
        color: "#475569",
        width: 920,
        x: 24,
        y: 58,
        lineHeight: 28,
      })
    );

    return frame;
  },
};