import { fitTextByChars, fitTextByWords } from "../../../utils/text";

import { FRAME_WIDTH } from "../../constants/layout";
import type { SlideRenderer } from "../../../domain/template/types";
import { createBaseFrame } from "../../shared/createBaseFrame";
import { createCounterPill } from "../../shared/createCounterPill";
import { createImageRect } from "../../shared/createImageRect";
import { createText } from "../../shared/createText";
import { rgb } from "../../../utils/color";

export const educationalCoverRenderer: SlideRenderer = {
  async render({ slide, index, total, context }) {
    const frame = createBaseFrame(slide.title || "Educational Cover");
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

    const titleBlock = figma.createFrame();
    titleBlock.resize(598, 460);
    titleBlock.x = 42;
    titleBlock.y = 120;
    titleBlock.cornerRadius = 28;
    titleBlock.layoutMode = "NONE";
    titleBlock.strokes = [];
    titleBlock.fills = [{ type: "SOLID", color: rgb("#FFFFFF") }];
    frame.appendChild(titleBlock);

    const accentBar = figma.createRectangle();
    accentBar.resize(10, 160);
    accentBar.x = 28;
    accentBar.y = 34;
    accentBar.cornerRadius = 999;
    accentBar.fills = [{ type: "SOLID", color: rgb(context.branding.colors.primary) }];
    accentBar.strokes = [];
    titleBlock.appendChild(accentBar);

    titleBlock.appendChild(
      createText({
        text: fitTextByWords(slide.title, 7),
        fontSize: 72,
        fontStyle: "Bold",
        color: "#0F172A",
        width: 500,
        x: 58,
        y: 36,
        lineHeight: 78,
      })
    );

    titleBlock.appendChild(
      createText({
        text: fitTextByChars(slide.text, 120),
        fontSize: 26,
        fontStyle: "Regular",
        color: "#475569",
        width: 500,
        x: 58,
        y: 290,
        lineHeight: 36,
      })
    );

    const imageCard = figma.createFrame();
    imageCard.resize(356, 520);
    imageCard.x = 682;
    imageCard.y = 120;
    imageCard.cornerRadius = 28;
    imageCard.layoutMode = "NONE";
    imageCard.clipsContent = true;
    imageCard.strokes = [];
    imageCard.fills = [{ type: "SOLID", color: rgb("#E2E8F0") }];
    frame.appendChild(imageCard);

    const image = await createImageRect(slide.imageUrl, 356, 520, "FILL");
    imageCard.appendChild(image);

    const bottomInfo = figma.createFrame();
    bottomInfo.resize(FRAME_WIDTH - 84, 200);
    bottomInfo.x = 42;
    bottomInfo.y = 700;
    bottomInfo.cornerRadius = 24;
    bottomInfo.layoutMode = "NONE";
    bottomInfo.strokes = [];
    bottomInfo.fills = [{ type: "SOLID", color: rgb("#E2E8F0") }];
    frame.appendChild(bottomInfo);

    bottomInfo.appendChild(
      createText({
        text: "Conteúdo educativo",
        fontSize: 22,
        fontStyle: "Bold",
        color: "#0F172A",
        width: 220,
        x: 28,
        y: 26,
      })
    );

    bottomInfo.appendChild(
      createText({
        text: "Ideal para explicar conceitos, destacar erros comuns e ensinar passos com clareza.",
        fontSize: 26,
        fontStyle: "Regular",
        color: "#475569",
        width: 900,
        x: 28,
        y: 70,
        lineHeight: 34,
      })
    );

    return frame;
  },
};