import { fitTextByChars, fitTextByWords } from "../../../utils/text";

import type { SlideRenderer } from "../../../domain/template/types";
import { createBaseFrame } from "../../shared/createBaseFrame";
import { createCounterPill } from "../../shared/createCounterPill";
import { createRoundedImageFrame } from "../../shared/createRoundedImageFrame";
import { createText } from "../../shared/createText";
import { rgb } from "../../../utils/color";

function createOpinionCard(
  title: string,
  body: string,
  backgroundHex: string,
  titleHex: string,
  bodyHex: string,
  x: number,
  y: number
): FrameNode {
  const card = figma.createFrame();
  card.resize(474, 330);
  card.x = x;
  card.y = y;
  card.cornerRadius = 26;
  card.layoutMode = "NONE";
  card.strokes = [];
  card.fills = [{ type: "SOLID", color: rgb(backgroundHex) }];

  card.appendChild(
    createText({
      text: title,
      fontSize: 28,
      fontStyle: "Bold",
      color: titleHex,
      width: 390,
      x: 30,
      y: 28,
    })
  );

  card.appendChild(
    createText({
      text: body,
      fontSize: 24,
      fontStyle: "Regular",
      color: bodyHex,
      width: 390,
      x: 30,
      y: 84,
      lineHeight: 32,
    })
  );

  return card;
}

export const mythContentRenderer: SlideRenderer = {
  async render({ slide, index, total, context }) {
    const frame = createBaseFrame(slide.title || "Myth Content");
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

    frame.appendChild(createCounterPill(index + 1, total, 924, 20, "#334155"));

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

    frame.appendChild(
      createOpinionCard(
        "Mito",
        fitTextByChars(slide.text, 105),
        "#FEE2E2",
        "#991B1B",
        "#7F1D1D",
        42,
        240
      )
    );

    frame.appendChild(
      createOpinionCard(
        "Verdade",
        "A resposta correta depende do contexto, da oferta e da execução.",
        "#DBEAFE",
        "#1D4ED8",
        "#1E3A8A",
        564,
        240
      )
    );

    const imageFrame = await createRoundedImageFrame(slide.imageUrl, 996, 290);
    imageFrame.x = 42;
    imageFrame.y = 618;
    imageFrame.cornerRadius = 26;
    frame.appendChild(imageFrame);

    const footerBar = figma.createFrame();
    footerBar.resize(996, 82);
    footerBar.x = 42;
    footerBar.y = 936;
    footerBar.cornerRadius = 18;
    footerBar.layoutMode = "NONE";
    footerBar.strokes = [];
    footerBar.fills = [{ type: "SOLID", color: rgb("#FFFFFF") }];
    frame.appendChild(footerBar);

    footerBar.appendChild(
      createText({
        text: "Comparações claras ajudam o leitor a entender rápido e salvar o post.",
        fontSize: 22,
        fontStyle: "Regular",
        color: "#475569",
        width: 940,
        x: 28,
        y: 28,
        alignHorizontal: "CENTER",
      })
    );

    return frame;
  },
};