import { fitTextByChars, fitTextByWords } from "../../../utils/text";

import type { SlideRenderer } from "../../../domain/template/types";
import { createBaseFrame } from "../../shared/createBaseFrame";
import { createCounterPill } from "../../shared/createCounterPill";
import { createRoundedImageFrame } from "../../shared/createRoundedImageFrame";
import { createText } from "../../shared/createText";
import { rgb } from "../../../utils/color";

export const authorityContentRenderer: SlideRenderer = {
  async render({ slide, index, total, context }) {
    const frame = createBaseFrame(slide.title || "Authority Content");
    frame.fills = [{ type: "SOLID", color: rgb("#09090B") }];

    frame.appendChild(
      createText({
        text: context.branding.brand.seriesName.toUpperCase(),
        fontSize: 16,
        fontStyle: "Regular",
        color: "#A1A1AA",
        width: 300,
        x: 42,
        y: 30,
      })
    );

    frame.appendChild(
      createText({
        text: context.branding.brand.profileHandle,
        fontSize: 16,
        fontStyle: "Regular",
        color: "#A1A1AA",
        width: 240,
        x: 798,
        y: 30,
        alignHorizontal: "RIGHT",
      })
    );

    frame.appendChild(createCounterPill(index + 1, total, 924, 20, "#18181B"));

    frame.appendChild(
      createText({
        text: fitTextByWords(slide.title, 7),
        fontSize: 70,
        fontStyle: "Bold",
        color: "#FFFFFF",
        width: 700,
        x: 42,
        y: 110,
        lineHeight: 76,
      })
    );

    const accentBar = figma.createRectangle();
    accentBar.resize(8, 180);
    accentBar.x = 42;
    accentBar.y = 332;
    accentBar.cornerRadius = 999;
    accentBar.fills = [{ type: "SOLID", color: rgb(context.branding.colors.primary) }];
    accentBar.strokes = [];
    frame.appendChild(accentBar);

    frame.appendChild(
      createText({
        text: fitTextByChars(slide.text, 235),
        fontSize: 28,
        fontStyle: "Regular",
        color: "#D4D4D8",
        width: 500,
        x: 72,
        y: 332,
        lineHeight: 38,
      })
    );

    const imageFrame = await createRoundedImageFrame(slide.imageUrl, 420, 720);
    imageFrame.x = 618;
    imageFrame.y = 168;
    imageFrame.cornerRadius = 24;
    frame.appendChild(imageFrame);

    const footerQuote = figma.createFrame();
    footerQuote.resize(996, 120);
    footerQuote.x = 42;
    footerQuote.y = 910;
    footerQuote.cornerRadius = 22;
    footerQuote.layoutMode = "NONE";
    footerQuote.strokes = [];
    footerQuote.fills = [{ type: "SOLID", color: rgb("#111113") }];
    frame.appendChild(footerQuote);

    footerQuote.appendChild(
      createText({
        text: "Posicionamento forte vende mais do que explicação morna.",
        fontSize: 24,
        fontStyle: "Bold",
        color: "#FFFFFF",
        width: 920,
        x: 38,
        y: 42,
        alignHorizontal: "CENTER",
      })
    );

    return frame;
  },
};