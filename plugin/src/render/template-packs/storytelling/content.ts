import { fitTextByChars, fitTextByWords } from "../../../utils/text";

import type { SlideRenderer } from "../../../domain/template/types";
import { createBaseFrame } from "../../shared/createBaseFrame";
import { createCounterPill } from "../../shared/createCounterPill";
import { createRoundedImageFrame } from "../../shared/createRoundedImageFrame";
import { createText } from "../../shared/createText";
import { rgb } from "../../../utils/color";

function createStoryTag(text: string, colorHex: string, x: number, y: number): FrameNode {
  const tag = figma.createFrame();
  tag.resize(138, 40);
  tag.x = x;
  tag.y = y;
  tag.cornerRadius = 999;
  tag.layoutMode = "NONE";
  tag.strokes = [];
  tag.fills = [{ type: "SOLID", color: rgb(colorHex) }];

  tag.appendChild(
    createText({
      text,
      fontSize: 15,
      fontStyle: "Bold",
      color: "#FFFFFF",
      width: 138,
      x: 0,
      y: 11,
      alignHorizontal: "CENTER",
    })
  );

  return tag;
}

export const storytellingContentRenderer: SlideRenderer = {
  async render({ slide, index, total, context }) {
    const frame = createBaseFrame(slide.title || "Storytelling Content");
    frame.fills = [{ type: "SOLID", color: rgb("#F8FAFC") }];

    frame.appendChild(
      createText({
        text: context.branding.brand.seriesName,
        fontSize: 16,
        fontStyle: "Regular",
        color: "#64748B",
        width: 280,
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

    frame.appendChild(createStoryTag("CONTEXTO", context.branding.colors.primary, 42, 110));

    frame.appendChild(
      createText({
        text: fitTextByWords(slide.title, 8),
        fontSize: 60,
        fontStyle: "Bold",
        color: "#0F172A",
        width: 960,
        x: 42,
        y: 168,
        lineHeight: 66,
      })
    );

    const leftCard = figma.createFrame();
    leftCard.resize(474, 640);
    leftCard.x = 42;
    leftCard.y = 300;
    leftCard.cornerRadius = 28;
    leftCard.layoutMode = "NONE";
    leftCard.clipsContent = true;
    leftCard.strokes = [];
    leftCard.fills = [{ type: "SOLID", color: rgb("#FFFFFF") }];
    frame.appendChild(leftCard);

    const quoteMark = figma.createText();
    quoteMark.fontName = { family: "Inter", style: "Bold" };
    quoteMark.characters = "“";
    quoteMark.fontSize = 110;
    quoteMark.fills = [{ type: "SOLID", color: rgb("#CBD5E1") }];
    quoteMark.x = 26;
    quoteMark.y = 8;
    leftCard.appendChild(quoteMark);

    leftCard.appendChild(
      createText({
        text: fitTextByChars(slide.text, 235),
        fontSize: 28,
        fontStyle: "Regular",
        color: "#334155",
        width: 386,
        x: 42,
        y: 108,
        lineHeight: 38,
      })
    );

    const divider = figma.createRectangle();
    divider.resize(386, 4);
    divider.x = 42;
    divider.y = 534;
    divider.cornerRadius = 999;
    divider.fills = [{ type: "SOLID", color: rgb(context.branding.colors.primary) }];
    divider.strokes = [];
    leftCard.appendChild(divider);

    leftCard.appendChild(
      createText({
        text: "Narrativa com começo, tensão e direção.",
        fontSize: 20,
        fontStyle: "Bold",
        color: "#0F172A",
        width: 386,
        x: 42,
        y: 560,
      })
    );

    const imageFrame = await createRoundedImageFrame(slide.imageUrl, 522, 640);
    imageFrame.x = 556;
    imageFrame.y = 300;
    imageFrame.cornerRadius = 28;
    frame.appendChild(imageFrame);

    return frame;
  },
};